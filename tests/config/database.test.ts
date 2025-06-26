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
});
