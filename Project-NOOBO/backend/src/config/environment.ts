export interface AppEnvironment {
  PORT: number;
  NODE_ENV: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  APP_URL: string;
  APPROVAL_TOKEN_TTL_HOURS: number;
  MAIL_HOST?: string;
  MAIL_PORT: number;
  MAIL_USER?: string;
  MAIL_PASSWORD?: string;
  MAIL_FROM: string;
  SESSION_SECRET?: string;
}

export function validateEnvironment(
  environment: Record<string, unknown>,
): AppEnvironment {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter((key) => !(key in environment));

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env in the backend project folder and set the values.`,
    );
  }

  const emptyRequired = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter(
    (key) => environment[key] === '',
  );
  if (emptyRequired.length > 0) {
    throw new Error(
      `Required environment variables cannot be empty: ${emptyRequired.join(', ')}.`,
    );
  }

  const readString = (key: string, fallback?: string): string => {
    const value = environment[key];
    if (value === undefined && fallback !== undefined) return fallback;
    if (typeof value !== 'string') {
      throw new Error(`${key} must be a string environment value.`);
    }
    return value;
  };

  return {
    PORT: parsePort(environment.PORT, 'PORT', 3000),
    NODE_ENV: readString('NODE_ENV', 'development'),
    DB_HOST: readString('DB_HOST'),
    DB_PORT: parsePort(environment.DB_PORT, 'DB_PORT', 3306),
    DB_USER: readString('DB_USER'),
    DB_PASSWORD: readString('DB_PASSWORD'),
    DB_NAME: readString('DB_NAME'),
    JWT_SECRET: readString('JWT_SECRET', 'dev-secret'),
    JWT_EXPIRES_IN: readString('JWT_EXPIRES_IN', '15m'),
    JWT_REFRESH_SECRET: readString('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    JWT_REFRESH_EXPIRES_IN: readString('JWT_REFRESH_EXPIRES_IN', '7d'),
    APP_URL: readString('APP_URL', 'http://localhost:3000'),
    APPROVAL_TOKEN_TTL_HOURS: parsePositiveNumber(
      environment.APPROVAL_TOKEN_TTL_HOURS,
      'APPROVAL_TOKEN_TTL_HOURS',
      48,
    ),
    MAIL_HOST: readOptionalString(environment, 'MAIL_HOST'),
    MAIL_PORT: parsePort(environment.MAIL_PORT, 'MAIL_PORT', 587),
    MAIL_USER: readOptionalString(environment, 'MAIL_USER'),
    MAIL_PASSWORD: readOptionalString(environment, 'MAIL_PASSWORD'),
    MAIL_FROM: readString('MAIL_FROM', 'no-reply@smartbooking.local'),
    SESSION_SECRET: environment.SESSION_SECRET === undefined
      ? undefined
      : readString('SESSION_SECRET'),
  };
}

function readOptionalString(
  environment: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = environment[key];
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new Error(`${key} must be a string environment value.`);
  }
  return value;
}

function parsePositiveNumber(
  value: unknown,
  name: string,
  fallback: number,
): number {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
  return parsed;
}

function parsePort(value: unknown, name: string, fallback: number): number {
  if (value === undefined || value === '') return fallback;

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }

  return port;
}
