import getKnexConfig from '../../../../src/database/implementations/knex/knexConfig';
import dbConfig from '../../../../src/config/database';

jest.mock('../../../../src/config/database', () => ({
  __esModule: true,
  default: {}
}));

describe('getKnexConfig', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should return correct config for postgresql', () => {
    (dbConfig as any).type = 'postgresql';
    (dbConfig as any).pool = { min: 1, max: 5 };
    (dbConfig as any).postgresql = {
      host: 'localhost',
      port: 5432,
      database: 'testdb',
      user: 'testuser',
      password: 'testpass',
      ssl: true
    };

    const config = getKnexConfig();
    expect(config).toEqual({
      pool: { min: 1, max: 5 },
      migrations: {
        directory: './migrations',
        tableName: 'knex_migrations'
      },
      seeds: {
        directory: './seeds'
      },
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
        ssl: true
      }
    });
  });

  it('should return correct config for mysql', () => {
    (dbConfig as any).type = 'mysql';
    (dbConfig as any).pool = { min: 2, max: 10 };
    (dbConfig as any).mysql = {
      host: 'localhost',
      port: 3306,
      database: 'mydb',
      user: 'myuser',
      password: 'mypass'
    };

    const config = getKnexConfig();
    expect(config).toEqual({
      pool: { min: 2, max: 10 },
      migrations: {
        directory: './migrations',
        tableName: 'knex_migrations'
      },
      seeds: {
        directory: './seeds'
      },
      client: 'mysql2',
      connection: {
        host: 'localhost',
        port: 3306,
        database: 'mydb',
        user: 'myuser',
        password: 'mypass'
      }
    });
  });

  it('should return correct config for sqlite', () => {
    (dbConfig as any).type = 'sqlite';
    (dbConfig as any).pool = { min: 1, max: 1 };
    (dbConfig as any).sqlite = {
      filename: './test.sqlite'
    };

    const config = getKnexConfig();
    expect(config).toEqual({
      pool: { min: 1, max: 1 },
      migrations: {
        directory: './migrations',
        tableName: 'knex_migrations'
      },
      seeds: {
        directory: './seeds'
      },
      client: 'sqlite3',
      connection: {
        filename: './test.sqlite'
      },
      useNullAsDefault: true
    });
  });

  it('should throw error for unsupported database type', () => {
    (dbConfig as any).type = 'oracle';
    (dbConfig as any).pool = {};

    expect(() => getKnexConfig()).toThrow(
      'Unsupported database type for Knex: oracle'
    );
  });
});