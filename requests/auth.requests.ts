import request from 'supertest';
import { AUTH_ENDPOINTS } from '../endpoints/auth.endpoints';
import { config } from '../config/config';

const baseUrl = config.baseUrl;

export class AuthRequests {
  static registerWithEmail(data: {
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    deviceId?: string;
  }) {
    return request(baseUrl)
      .post(AUTH_ENDPOINTS.REGISTER_EMAIL)
      .send(data)
      .set('Accept', 'application/json');
  }

  static registerWithDevice(data: { deviceId: string }) {
    return request(baseUrl)
      .post(AUTH_ENDPOINTS.REGISTER_DEVICE)
      .send(data)
      .set('Accept', 'application/json');
  }

  static login(data: { email?: string; password?: string; deviceId?: string }) {
    return request(baseUrl).post(AUTH_ENDPOINTS.LOGIN).send(data).set('Accept', 'application/json');
  }

  static refreshToken(data: { refreshToken: string }) {
    return request(baseUrl)
      .post(AUTH_ENDPOINTS.REFRESH_TOKEN)
      .send(data)
      .set('Accept', 'application/json');
  }
}
