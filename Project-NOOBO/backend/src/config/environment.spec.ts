import { describe, expect, it } from 'vitest';
import { validateEnvironment } from './environment.js';

describe('validateEnvironment', () => {
  it('requires the MySQL settings to be present', () => {
    expect(() => validateEnvironment({})).toThrow(
      'Missing required environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME',
    );
  });

  it('accepts an intentionally empty password and applies local defaults', () => {
    expect(
      validateEnvironment({
        DB_HOST: '127.0.0.1',
        DB_USER: 'root',
        DB_PASSWORD: '',
        DB_NAME: 'smartbooking_db',
      }),
    ).toMatchObject({
      PORT: 3000,
      NODE_ENV: 'development',
      DB_PORT: 3306,
      DB_PASSWORD: '',
    });
  });

  it('rejects invalid port values', () => {
    expect(() =>
      validateEnvironment({
        DB_HOST: '127.0.0.1',
        DB_USER: 'root',
        DB_PASSWORD: '',
        DB_NAME: 'smartbooking_db',
        DB_PORT: 'not-a-port',
      }),
    ).toThrow('DB_PORT must be an integer between 1 and 65535.');
  });
});
