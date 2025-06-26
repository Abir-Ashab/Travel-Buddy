describe('Environment Configuration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; 
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3000';
    process.env.DB_URL = 'postgres://localhost:5432/travel_app';
    process.env.BCRYPT_SALT_ROUNDS = '5';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '7d';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_REFRESH_EXPIRES_IN = '1y';
  });

  afterEach(() => {
    process.env = OLD_ENV; 
  });

  it('should load all environment variables correctly', async () => {
    const env = (await import('../../src/config')).default;

    expect(env).toEqual({
      NODE_ENV: 'development',
      port: '3000',
      db_url: 'postgres://localhost:5432/travel_app',
      salt_round: '5',
      jwt_access_secret: 'test-access-secret',
      jwt_access_expires_in: '7d',
      jwt_refresh_secret: 'test-refresh-secret',
      jwt_refresh_expires_in: '1y',
    });
  });

it('should have undefined for missing variables', async () => {
  process.env.JWT_ACCESS_SECRET = undefined as any;
  process.env.DB_URL = undefined as any;

  jest.resetModules();

  const env = (await import('../../src/config')).default;

  expect(env.db_url).toBeUndefined();
  expect(env.jwt_access_secret).toBeUndefined();
});

});
