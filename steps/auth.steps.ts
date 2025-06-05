import { AuthRequests } from '../requests/auth.requests';
import { config } from '../config/config';
import { db } from '../utils/db.util';
import { strict as assert } from 'assert';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export class AuthSteps {
  static async emailRegistration(
    firstName: string,
    lastName: string,
    password: string,
    email: string,
    deviceId?: string,
  ) {
    const response = await AuthRequests.registerWithEmail({
      firstName,
      lastName,
      password,
      email,
      deviceId,
    });
    return { status: response.status, body: response.body };
  }

  static async createAnEmailUser() {
    const email = `regression.testuser+${Date.now()}@galacticatest.com`;
    const password = 'P@ssword01';
    const deviceId = 'regression+' + uuidv4();

    const response = await AuthRequests.registerWithEmail({
      firstName: 'Regression',
      lastName: 'User',
      password,
      email,
      deviceId,
    });
    return {
      email,
      password,
      deviceId,
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken,
    };
  }

  static async deviceRegistration(deviceId: any) {
    const response = await AuthRequests.registerWithDevice({ deviceId });
    return { status: response.status, body: response.body };
  }

  static async createADeviceUser() {
    const deviceId = 'regression+' + uuidv4();
    const response = await AuthRequests.registerWithDevice({
      deviceId,
    });
    return {
      deviceId,
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken,
    };
  }

  static async userLogin(email?: string, password?: string, deviceId?: string) {
    const response = await AuthRequests.login({ email, password, deviceId });
    return { status: response.status, body: response.body };
  }

  static async tokenRefresh(refreshTokenValue: string) {
    const response = await AuthRequests.refreshToken({ refreshToken: refreshTokenValue });
    return { status: response.status, body: response.body };
  }

  static async validateEmailRegistrationInDB(firstName: string, lastName: string, email: string) {
    const query = 'SELECT * FROM user WHERE email = ?';
    const rows = await db.query(query, [email]);

    assert(rows.length > 0, `No user found in the database with email: ${email}`);

    const user = rows[0];

    assert.strictEqual(
      user.firstName,
      firstName,
      `Expected firstName to be ${firstName}, but got ${user.firstName}`,
    );
    assert.strictEqual(
      user.lastName,
      lastName,
      `Expected lastName to be ${lastName}, but got ${user.lastName}`,
    );
    assert.strictEqual(
      user.type,
      'EMAIL',
      `Expected user type to be 'EMAIL', but got ${user.type}`,
    );
    assert.strictEqual(user.email, email, `Expected email to be ${email}, but got ${user.email}`);

    assert(
      user.password && user.password.trim() !== '',
      `Password should not be empty for user with email: ${email}`,
    );
  }

  static async getUserByEmail(email: string) {
    const query = 'SELECT * FROM user WHERE email = ?';
    const rows = await db.query(query, [email]);

    assert(rows.length > 0, `No user found in the database with email: ${email}`);

    const user = rows[0];
    return user;
  }

  static async getUserByDeviceId(deviceId: string) {
    const query = 'SELECT * FROM user WHERE deviceId = ?';
    const rows = await db.query(query, [deviceId]);

    assert(rows.length > 0, `No user found in the database with deviceId: ${deviceId}`);

    const user = rows[0];
    return user;
  }

  static async validateEmailRegistrationNotInDB(email: string) {
    const query = 'SELECT * FROM user WHERE email = ?';
    const rows = await db.query(query, [email]);

    assert(rows.length === 0, `User with email ${email} should not exist in the database`);
  }

  static async validateDeviceRegistrationInDB(deviceId: string) {
    const query = 'SELECT * FROM user WHERE deviceId = ?';
    const rows = await db.query(query, [deviceId]);

    assert(rows.length > 0, `No user found in the database with deviceId: ${deviceId}`);

    const user = rows[0];

    assert.strictEqual(
      user.type,
      'DEVICE',
      `Expected user type to be 'DEVICE', but got ${user.type}`,
    );
    assert.strictEqual(
      user.deviceId,
      deviceId,
      `Expected deviceId to be ${deviceId}, but got ${user.deviceId}`,
    );
    assert.strictEqual(user.password, null);
  }

  static async validateDeviceRegistrationNotInDB(deviceId: string) {
    const query = 'SELECT * FROM user WHERE deviceId = ?';
    const rows = await db.query(query, [deviceId]);

    assert(rows.length === 0, `User with deviceId ${deviceId} should not exist in the database`);
  }

  static makeAccessTokenExpired(token: string) {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token');
    }

    const expiredToken = jwt.sign(
      { ...decoded, exp: Math.floor(Date.now() / 1000) - 60 },
      config.JWT_SECRET,
    );

    return expiredToken;
  }

  static makeRefreshTokenExpired(token: string) {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token');
    }

    const expiredToken = jwt.sign(
      { ...decoded, exp: Math.floor(Date.now() / 1000) - 60 },
      config.JWT_REFRESH_SECRET,
    );

    return expiredToken;
  }

  static async cleanupTestUsers() {
    const emailQuery = "DELETE FROM user WHERE email like '%regression%'";
    await db.query(emailQuery);

    const deviceQuery = "DELETE FROM user WHERE deviceId like '%regression%'";
    await db.query(deviceQuery);
  }
}
