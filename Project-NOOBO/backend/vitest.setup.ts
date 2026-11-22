// Unit tests never connect to a real database; give ConfigModule the minimum
// environment it validates when AppModule is imported.
process.env.DB_HOST ??= '127.0.0.1';
process.env.DB_PORT ??= '3306';
process.env.DB_USER ??= 'root';
process.env.DB_PASSWORD ??= '';
process.env.DB_NAME ??= 'smartbooking_test';
process.env.JWT_SECRET ??= 'test-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret';
