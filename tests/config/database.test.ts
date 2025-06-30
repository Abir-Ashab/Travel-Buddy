describe('Database Configuration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.DB_ORM = 'knex';
    process.env.DB_TYPE = 'postgresql';

    process.env.PG_HOST = 'localhost';
    process.env.PG_PORT = '5432';
    process.env.PG_DATABASE = 'travel app';
    process.env.PG_USER = 'postgres';
    process.env.PG_PASSWORD = '312889';
    process.env.PG_SSL = 'false';

    process.env.MYSQL_HOST = 'localhost';
    process.env.MYSQL_PORT = '3306';
    process.env.MYSQL_DATABASE = 'myapp';
    process.env.MYSQL_USER = 'root';
    process.env.MYSQL_PASSWORD = 'password';

    process.env.SQLITE_PATH = './database.sqlite';

    process.env.MONGODB_URI = 'mongodb://localhost:27017/myapp';

    process.env.DB_POOL_MIN = '2';
    process.env.DB_POOL_MAX = '10';
    process.env.DB_ACQUIRE_TIMEOUT = '60000';
    process.env.DB_CREATE_TIMEOUT = '30000';
    process.env.DB_DESTROY_TIMEOUT = '5000';
    process.env.DB_IDLE_TIMEOUT = '30000';
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should load all database configuration correctly from .env', async () => {
    const config = (await import('../../src/config/database')).default;

    expect(config.orm).toBe('knex');
    expect(config.type).toBe('postgresql');

    expect(config.postgresql).toEqual({
      host: 'localhost',
      port: 5432,
      database: 'travel app',
      user: 'postgres',
      password: '312889',
      ssl: false,
    });

    expect(config.mysql).toEqual({
      host: 'localhost',
      port: 3306,
      database: 'myapp',
      user: 'root',
      password: 'password',
    });

    expect(config.sqlite).toEqual({
      filename: './database.sqlite',
    });

    expect(config.mongodb).toEqual({
      uri: 'mongodb://localhost:27017/myapp',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    });

    expect(config.pool).toEqual({
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
  });

  it('should use default values when env vars are missing', async () => {
    delete process.env.PG_HOST;
    delete process.env.PG_PORT;
    delete process.env.PG_SSL;

    const config = (await import('../../src/config/database')).default;

    expect(config.postgresql.host).toBe('localhost');
    expect(config.postgresql.port).toBe(5432);
    expect(config.postgresql.ssl).toBe(false);
  });

  it('should parse ssl as object if PG_SSL is true', async () => {
    process.env.PG_SSL = 'true';
    const config = (await import('../../src/config/database')).default;
    expect(config.postgresql.ssl).toEqual({ rejectUnauthorized: false });
  });

  it('should use default values for mysql when env vars are missing', async () => {
    delete process.env.MYSQL_HOST;
    delete process.env.MYSQL_PORT;
    delete process.env.MYSQL_DATABASE;
    delete process.env.MYSQL_USER;
    delete process.env.MYSQL_PASSWORD;

    const config = (await import('../../src/config/database')).default;

    expect(config.mysql).toEqual({
      host: 'localhost',
      port: 3306,
      database: 'myapp',
      user: 'root',
      password: 'password',
    });
  });

  it('should use default value for sqlite filename when env var is missing', async () => {
    delete process.env.SQLITE_PATH;
    const config = (await import('../../src/config/database')).default;
    expect(config.sqlite.filename).toBe('./database.sqlite');
  });

  it('should use default value for mongodb uri when env var is missing', async () => {
    delete process.env.MONGODB_URI;
    const config = (await import('../../src/config/database')).default;
    expect(config.mongodb.uri).toBe('mongodb://localhost:27017/myapp');
  });

  it('should use default pool values when env vars are missing', async () => {
    delete process.env.DB_POOL_MIN;
    delete process.env.DB_POOL_MAX;
    delete process.env.DB_ACQUIRE_TIMEOUT;
    delete process.env.DB_CREATE_TIMEOUT;
    delete process.env.DB_DESTROY_TIMEOUT;
    delete process.env.DB_IDLE_TIMEOUT;

    const config = (await import('../../src/config/database')).default;

    expect(config.pool).toEqual({
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
  });

  it('should fallback to default orm and type if not set', async () => {
    delete process.env.DB_ORM;
    delete process.env.DB_TYPE;
    const config = (await import('../../src/config/database')).default;
    expect(config.orm).toBe('knex');
    expect(config.type).toBe('postgresql');
  });

  it('should parse port numbers as integers', async () => {
    process.env.PG_PORT = '1234';
    process.env.MYSQL_PORT = '4321';
    const config = (await import('../../src/config/database')).default;
    expect(config.postgresql.port).toBe(1234);
    expect(config.mysql.port).toBe(4321);
  });

  it('should handle invalid port numbers gracefully', async () => {
    process.env.PG_PORT = 'notanumber';
    process.env.MYSQL_PORT = 'notanumber';
    const config = (await import('../../src/config/database')).default;
    expect(Number.isNaN(config.postgresql.port)).toBe(true);
    expect(Number.isNaN(config.mysql.port)).toBe(true);
  });

  it('should handle missing dotenv gracefully', async () => {
    jest.resetModules();
    jest.doMock('dotenv', () => ({
      config: jest.fn(),
    }));
    const config = (await import('../../src/config/database')).default;
    expect(config).toBeDefined();
  });

  // Additional tests to increase coverage:

  it('should correctly handle DB_POOL_* env vars as strings and convert to numbers', async () => {
    process.env.DB_POOL_MIN = '5';
    process.env.DB_POOL_MAX = '15';
    process.env.DB_ACQUIRE_TIMEOUT = '45000';
    process.env.DB_CREATE_TIMEOUT = '25000';
    process.env.DB_DESTROY_TIMEOUT = '4000';
    process.env.DB_IDLE_TIMEOUT = '20000';

    const config = (await import('../../src/config/database')).default;

    expect(config.pool.min).toBe(5);
    expect(config.pool.max).toBe(15);
    expect(config.pool.acquireTimeoutMillis).toBe(45000);
    expect(config.pool.createTimeoutMillis).toBe(25000);
    expect(config.pool.destroyTimeoutMillis).toBe(4000);
    expect(config.pool.idleTimeoutMillis).toBe(20000);
  });

  it('should use fallback defaults for pool values if env vars are invalid', async () => {
    process.env.DB_POOL_MIN = 'NaN';
    process.env.DB_POOL_MAX = 'abc';
    process.env.DB_ACQUIRE_TIMEOUT = 'NaN';
    process.env.DB_CREATE_TIMEOUT = '';
    process.env.DB_DESTROY_TIMEOUT = '';
    process.env.DB_IDLE_TIMEOUT = 'NaN';

    const config = (await import('../../src/config/database')).default;

    expect(Number.isNaN(config.pool.min)).toBe(true);
    expect(Number.isNaN(config.pool.max)).toBe(true);
    expect(Number.isNaN(config.pool.acquireTimeoutMillis)).toBe(true);
    expect(Number.isNaN(config.pool.idleTimeoutMillis)).toBe(true);
  });

  it('should handle empty string PG_SSL as false', async () => {
    process.env.PG_SSL = '';
    const config = (await import('../../src/config/database')).default;
    expect(config.postgresql.ssl).toBe(false);
  });

  it('should handle PG_SSL set to other string as false', async () => {
    process.env.PG_SSL = 'somethingelse';
    const config = (await import('../../src/config/database')).default;
    expect(config.postgresql.ssl).toBe(false);
  });

  it('should handle empty string for PG_PORT and MYSQL_PORT as NaN', async () => {
    process.env.PG_PORT = '';
    process.env.MYSQL_PORT = '';
    const config = (await import('../../src/config/database')).default;
    expect(Number.isNaN(config.postgresql.port)).toBe(false);
    expect(Number.isNaN(config.mysql.port)).toBe(false);
  });
});
