import KnexConnection from '../../../../src/database/implementations/knex/KnexConnection';
import knex from 'knex';

jest.mock('knex');
jest.mock('../../../../src/database/implementations/knex/knexConfig', () => jest.fn(() => ({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true,
})));
jest.mock('../../../../src/config/database', () => ({
  type: 'sqlite',
}));

describe('KnexConnection', () => {
  let knexConnection: KnexConnection;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    knexConnection = new KnexConnection();
    mockClient = {
      raw: jest.fn().mockResolvedValue([1]),
      destroy: jest.fn().mockResolvedValue(undefined),
      migrate: {
        latest: jest.fn().mockResolvedValue([1, ['migration1.js', 'migration2.js']]),
        rollback: jest.fn().mockResolvedValue([0, ['migration1.js']]),
      },
    };
    (knex as unknown as jest.Mock).mockReturnValue(mockClient);
  });

  describe('connect', () => {
    it('should connect and set connected to true', async () => {
      mockClient.raw.mockResolvedValue([1]);
      await expect(knexConnection.connect()).resolves.toBe(mockClient);
      expect(knexConnection.connected).toBe(true);
      expect(knex).toHaveBeenCalled();
    });

    it('should throw error if testConnection fails', async () => {
      mockClient.raw.mockRejectedValue(new Error('fail'));
      await expect(knexConnection.connect()).rejects.toThrow('Knex connection failed: fail');
      expect(knexConnection.connected).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect and set connected to false', async () => {
      knexConnection.client = mockClient;
      knexConnection.connected = true;
      await knexConnection.disconnect();
      expect(mockClient.destroy).toHaveBeenCalled();
      expect(knexConnection.connected).toBe(false);
    });

    it('should not throw if client is null', async () => {
      knexConnection.client = null;
      await expect(knexConnection.disconnect()).resolves.toBeUndefined();
    });

    it('should throw error if destroy fails', async () => {
      knexConnection.client = mockClient;
      mockClient.destroy.mockRejectedValue(new Error('destroy error'));
      await expect(knexConnection.disconnect()).rejects.toThrow('Knex connection failed: destroy error');
    });
  });

  describe('getClient', () => {
    it('should return client if connected', () => {
      knexConnection.client = mockClient;
      knexConnection.connected = true;
      expect(knexConnection.getClient()).toBe(mockClient);
    });

    it('should throw if not connected', () => {
      knexConnection.client = null;
      knexConnection.connected = false;
      expect(() => knexConnection.getClient()).toThrow('Database not connected. Call connect() first.');
    });
  });

  describe('isConnected', () => {
    it('should return true if connected and client exists', () => {
      knexConnection.client = mockClient;
      knexConnection.connected = true;
      expect(knexConnection.isConnected()).toBe(true);
    });

    it('should return false if not connected', () => {
      knexConnection.client = null;
      knexConnection.connected = false;
      expect(knexConnection.isConnected()).toBe(false);
    });
  });

  describe('testConnection', () => {
    it('should call raw with SELECT 1 for sqlite', async () => {
      knexConnection.client = mockClient;
      await expect(knexConnection.testConnection()).resolves.toBeUndefined();
      expect(mockClient.raw).toHaveBeenCalledWith('SELECT 1');
    });

    it('should throw if client not initialized', async () => {
      knexConnection.client = null;
      await expect(knexConnection.testConnection()).rejects.toThrow('Knex client not initialized');
    });

    it('should throw if db type is unsupported', async () => {
      jest.resetModules();
      jest.doMock('../../../../src/config/database', () => ({
        __esModule: true,
        default: { type: 'unknown' },
      }));

      const KnexConnection = (await import('../../../../src/database/implementations/knex/KnexConnection')).default;
      const instance = new KnexConnection();
      instance['client'] = { raw: jest.fn() };

      await expect(instance.testConnection()).rejects.toThrow('Unsupported database type: unknown');
    });

  });

  describe('runMigrations', () => {
    it('should run migrations and log output', async () => {
      knexConnection.client = mockClient;
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await knexConnection.runMigrations();
      expect(mockClient.migrate.latest).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('Running migrations...');
      expect(logSpy).toHaveBeenCalledWith('Ran 2 migrations in batch 1');
      logSpy.mockRestore();
    });

    it('should log if no migrations to run', async () => {
      knexConnection.client = mockClient;
      mockClient.migrate.latest.mockResolvedValue([1, []]);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await knexConnection.runMigrations();
      expect(logSpy).toHaveBeenCalledWith('No migrations to run');
      logSpy.mockRestore();
    });

    it('should throw if not connected', async () => {
      knexConnection.client = null;
      await expect(knexConnection.runMigrations()).rejects.toThrow('Database not connected');
    });
  });

  describe('rollbackMigrations', () => {
    it('should rollback migrations and log output', async () => {
      knexConnection.client = mockClient;
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await knexConnection.rollbackMigrations();
      expect(mockClient.migrate.rollback).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('Rolling back migrations...');
      expect(logSpy).toHaveBeenCalledWith('Rolled back 1 migrations from batch 0');
      logSpy.mockRestore();
    });

    it('should log if no migrations to rollback', async () => {
      knexConnection.client = mockClient;
      mockClient.migrate.rollback.mockResolvedValue([0, []]);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await knexConnection.rollbackMigrations();
      expect(logSpy).toHaveBeenCalledWith('No migrations to rollback');
      logSpy.mockRestore();
    });

    it('should throw if not connected', async () => {
      knexConnection.client = null;
      await expect(knexConnection.rollbackMigrations()).rejects.toThrow('Database not connected');
    });
  });

  describe('getConnectionInfo', () => {
    it('should return connection info', () => {
      knexConnection.connected = true;
      knexConnection.config = {
        client: 'sqlite3',
        connection: { database: 'testdb', host: 'localhost', port: 1234 },
      };
      const info = knexConnection.getConnectionInfo();
      expect(info).toEqual({
        orm: 'knex',
        type: 'sqlite',
        connected: true,
        config: {
          client: 'sqlite3',
          database: 'testdb',
          host: 'localhost',
          port: 1234,
        },
      });
    });

    it('should handle missing database and host', () => {
      knexConnection.connected = false;
      knexConnection.config = {
        client: 'sqlite3',
        connection: { filename: 'file.db' },
      };
      const info = knexConnection.getConnectionInfo();
      expect(info.config.database).toBe('file.db');
      expect(info.config.host).toBe('file');
      expect(info.config.port).toBeNull();
    });
  });
});