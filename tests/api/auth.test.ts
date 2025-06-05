import { AuthSteps } from '../../steps/auth.steps';
import { v4 as uuidv4 } from 'uuid';

describe('Email registration', () => {
  it('Happy path', async () => {
    const email = `regression.testuser+${Date.now()}@galacticatest.com`;

    const { status, body } = await AuthSteps.emailRegistration('Amy', 'White', 'P@ssword01', email);

    expect(status).toBe(201);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');

    // Validate the user exists in the database after registration
    await AuthSteps.validateEmailRegistrationInDB('Amy', 'White', email);
  });

  it('Empty firstName', async () => {
    const email = `regression.testuser+${Date.now()}@galacticatest.com`;

    const { status, body } = await AuthSteps.emailRegistration('', 'White', 'password123', email);

    expect(status).toBe(400); // Assuming 400 Bad Request is returned for invalid input
    expect(body.errors[0].path).toBe('firstName');
    expect(body.errors[0].msg).toBe('First name is required');

    // Ensure the user does not exist in the database
    await AuthSteps.validateEmailRegistrationNotInDB(email);
  });

  it('Empty lastName', async () => {
    const email = `regression.testuser+${Date.now()}@galacticatest.com`;

    const { status, body } = await AuthSteps.emailRegistration('Amy', '', 'password123', email);

    expect(status).toBe(400); // Assuming 400 Bad Request is returned for invalid input
    expect(body.errors[0].path).toBe('lastName');
    expect(body.errors[0].msg).toBe('Last name is required');

    // Ensure the user does not exist in the database
    await AuthSteps.validateEmailRegistrationNotInDB(email);
  });

  it('Empty email', async () => {
    const email = '';

    const { status, body } = await AuthSteps.emailRegistration(
      'Amy',
      'White',
      'password123',
      email,
    );

    expect(status).toBe(400); // Assuming 400 Bad Request is returned for invalid input
    expect(body.errors[0].path).toBe('email');
    expect(body.errors[0].msg).toBe('Valid email is required');
  });

  it('Invalid email format', async () => {
    const email = 'invalid-email';

    const { status, body } = await AuthSteps.emailRegistration(
      'Amy',
      'White',
      'password123',
      email,
    );

    expect(status).toBe(400); // Assuming 400 Bad Request is returned for invalid input
    expect(body.errors[0].path).toBe('email');
    expect(body.errors[0].msg).toBe('Valid email is required');

    // Ensure the user does not exist in the database
    await AuthSteps.validateEmailRegistrationNotInDB(email);
  });

  it('Invalid password - password less than 8 characters', async () => {
    const email = `regression.testuser+${Date.now()}@galacticatest.com`;

    const { status, body } = await AuthSteps.emailRegistration('Amy', 'White', 'Pass1', email);

    expect(status).toBe(400); // Assuming 400 Bad Request is returned for invalid input
    expect(body.errors[0].path).toBe('password');
    expect(body.errors[0].msg).toBe('Password must be at least 8 characters long.');

    // Ensure the user does not exist in the database
    await AuthSteps.validateEmailRegistrationNotInDB(email);
  });

  it('Invalid password  - password without uppercase letters', async () => {
    const email = `regression.testuser+${Date.now()}@galacticatest.com`;

    const { status, body } = await AuthSteps.emailRegistration(
      'Amy',
      'White',
      'password123',
      email,
    );

    expect(status).toBe(400); // Assuming 400 Bad Request is returned for invalid input
    expect(body.errors[0].path).toBe('password');
    expect(body.errors[0].msg).toBe('Password must include at least one uppercase letter.');

    // Ensure the user does not exist in the database
    await AuthSteps.validateEmailRegistrationNotInDB(email);
  });

  it('Invalid password  - password without lowercase letters', async () => {
    const email = `regression.testuser+${Date.now()}@galacticatest.com`;

    const { status, body } = await AuthSteps.emailRegistration(
      'Amy',
      'White',
      'PASSWORD123',
      email,
    );

    expect(status).toBe(400); // Assuming 400 Bad Request is returned for invalid input
    expect(body.errors[0].path).toBe('password');
    expect(body.errors[0].msg).toBe('Password must include at least one lowercase letter.');

    // Ensure the user does not exist in the database
    await AuthSteps.validateEmailRegistrationNotInDB(email);
  });

  it('Existing user', async () => {
    const email = `regression.testuser+${Date.now()}@galacticatest.com`;

    const { status: firstStatus } = await AuthSteps.emailRegistration(
      'Amy',
      'White',
      'P@ssword01',
      email,
    );

    expect(firstStatus).toBe(201);

    const { status: secondStatus, body } = await AuthSteps.emailRegistration(
      'Amy',
      'White',
      'P@ssword01',
      email,
    );

    expect(secondStatus).toBe(409);
    expect(body.error).toBe('User already exists');
  });

  it('Convert device user to email user', async () => {
    const { deviceId } = await AuthSteps.createADeviceUser();

    const email = `regression.testuser+${Date.now()}@galacticatest.com`;
    const { status, body } = await AuthSteps.emailRegistration(
      'Amy',
      'White',
      'P@ssword01',
      email,
      deviceId,
    );

    expect(status).toBe(201);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');

    // Validate the user exists in the database after registration
    await AuthSteps.validateEmailRegistrationInDB('Amy', 'White', email);

    // Ensure the deviceId is updated in the database
    const user = await AuthSteps.getUserByEmail(email);
    expect(user.deviceId).toBe(deviceId);
  });
});

describe('Device registration', () => {
  it('Happy path', async () => {
    const deviceId = 'regression+' + uuidv4();

    const { status, body } = await AuthSteps.deviceRegistration(deviceId);

    expect(status).toBe(201);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');

    // Validate the user exists in the database after registration
    await AuthSteps.validateDeviceRegistrationInDB(deviceId);
  });

  it('Non-string deviceId', async () => {
    const { status, body } = await AuthSteps.deviceRegistration(234);

    expect(status).toBe(400);
    expect(body.errors[0].path).toBe('deviceId');
    expect(body.errors[0].msg).toBe('Device ID must be a string');
  });

  it('Existing device', async () => {
    const deviceId = 'regression+' + uuidv4();

    const { status: firstStatus } = await AuthSteps.deviceRegistration(deviceId);

    expect(firstStatus).toBe(201);

    const { status: secondStatus, body } = await AuthSteps.deviceRegistration(deviceId);
    expect(secondStatus).toBe(409);
    expect(body.error).toBe('User already exists');
  });
});

describe('Login', () => {
  it('Happy path - email and password', async () => {
    const { email, password } = await AuthSteps.createAnEmailUser();

    const { status, body } = await AuthSteps.userLogin(email, password);

    expect(status).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
  });

  it('Happy path - deviceId', async () => {
    const { deviceId } = await AuthSteps.createADeviceUser();

    const { status, body } = await AuthSteps.userLogin(undefined, undefined, deviceId);

    expect(status).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
  });

  it('Update last activity date on successful login - email user', async () => {
    const { email, password } = await AuthSteps.createAnEmailUser();
    const registerdAt = await AuthSteps.getUserByEmail(email).then((user) => user.lastActiveAt);

    const { status } = await AuthSteps.userLogin(email, password);
    expect(status).toBe(200);
    const lastActiveAt = await AuthSteps.getUserByEmail(email).then((user) => user.lastActiveAt);
    expect(new Date(lastActiveAt).getTime()).toBeGreaterThan(new Date(registerdAt).getTime());
  });

  it('Update last activity date on successful login - device user', async () => {
    const { deviceId } = await AuthSteps.createADeviceUser();
    const registeredAt = await AuthSteps.getUserByDeviceId(deviceId).then(
      (user) => user.lastActiveAt,
    );

    const { status } = await AuthSteps.userLogin(undefined, undefined, deviceId);
    expect(status).toBe(200);
    const lastActiveAt = await AuthSteps.getUserByDeviceId(deviceId).then(
      (user) => user.lastActiveAt,
    );
    expect(new Date(lastActiveAt).getTime()).toBeGreaterThan(new Date(registeredAt).getTime());
  });

  it('Update deviceId when changing device', async () => {
    const { email, password, deviceId } = await AuthSteps.createAnEmailUser();
    const existingDeviceId = await AuthSteps.getUserByEmail(email).then((user) => user.deviceId);
    expect(existingDeviceId).toBe(deviceId);

    // Simulate a new device login
    const newDeviceId = 'regression+' + uuidv4();
    const { status } = await AuthSteps.userLogin(email, password, newDeviceId);
    expect(status).toBe(200);

    // Verify that the deviceId has been updated in the database
    const updatedDeviceId = await AuthSteps.getUserByEmail(email).then((user) => user.deviceId);
    expect(updatedDeviceId).toBe(newDeviceId);
  });

  it('Without email', async () => {
    const { status, body } = await AuthSteps.userLogin(undefined, 'P@ssword01');
    expect(status).toBe(400);
    expect(body.errors[0].msg).toBe('Either email/password or deviceId must be provided');
  });

  it('Without password', async () => {
    const { email } = await AuthSteps.createAnEmailUser();

    const { status, body } = await AuthSteps.userLogin(email, undefined);
    expect(status).toBe(400);
    expect(body.errors[0].msg).toBe('Either email/password or deviceId must be provided');
  });

  it('Without deviceId', async () => {
    const { status, body } = await AuthSteps.userLogin(undefined, undefined, undefined);
    expect(status).toBe(400);
    expect(body.errors[0].msg).toBe('Either email/password or deviceId must be provided');
  });

  it('Login as email user using device id', async () => {
    const { deviceId } = await AuthSteps.createAnEmailUser();
    const { status, body } = await AuthSteps.userLogin(undefined, undefined, deviceId);
    expect(status).toBe(403);
    expect(body.error).toBe('Device login not allowed for this user');
  });
});

describe('Refresh Token', () => {
  it('Refresh token for email user', async () => {
    const { refreshToken } = await AuthSteps.createAnEmailUser();

    const { status, body } = await AuthSteps.tokenRefresh(refreshToken);

    expect(status).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
  });

  it('Refresh token for device user', async () => {
    const { refreshToken } = await AuthSteps.createADeviceUser();

    const { status, body } = await AuthSteps.tokenRefresh(refreshToken);

    expect(status).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
  });

  it('Invalid refresh token', async () => {
    const { status, body } = await AuthSteps.tokenRefresh('invalid-refresh-token');

    expect(status).toBe(401);
    expect(body.error).toBe('Invalid refresh token');
  });

  it('Expired refresh token', async () => {
    const { refreshToken } = await AuthSteps.createAnEmailUser();
    const expiredRefresh = AuthSteps.makeRefreshTokenExpired(refreshToken);
    const { status, body } = await AuthSteps.tokenRefresh(expiredRefresh);

    expect(status).toBe(401);
    expect(body.error).toBe('Refresh token expired');
  });
});
