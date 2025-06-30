import DatabaseFactory from '../../../src/database/factories/DatabaseFactory';
import dbConfig from '../../../src/config/database';
import KnexConnection from '../../../src/database/implementations/knex/KnexConnection';

jest.mock('../../../src/config/database', () => ({
  orm: 'knex',
  type: 'postgres'
}));

jest.mock('../../../src/database/implementations/knex/KnexConnection');

const mockConnection = {
  isConnected: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  getConnectionInfo: jest.fn(),
  testConnection: jest.fn(),
  runMigrations: jest.fn(),
  rollbackMigrations: jest.fn(),
};

describe('DatabaseFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    DatabaseFactory.instance = null;
    // @ts-ignore
    DatabaseFactory.connection = null;
    (KnexConnection as jest.Mock).mockImplementation(() => mockConnection);
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = DatabaseFactory.getInstance();
      const instance2 = DatabaseFactory.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createConnection', () => {
    it('should create a KnexConnection when orm is knex', () => {
      const conn = DatabaseFactory.createConnection();
      expect(KnexConnection).toHaveBeenCalled();
      expect(conn).toBe(mockConnection);
    });

    it('should throw error for unsupported ORM', () => {
      (dbConfig as any).orm = 'unsupported';
      expect(() => DatabaseFactory.createConnection()).toThrow('Unsupported ORM: unsupported');
      (dbConfig as any).orm = 'knex'; // restore
    });
  });

  describe('initialize', () => {
    it('should initialize and connect if not already connected', async () => {
      mockConnection.isConnected.mockReturnValue(false);
      await DatabaseFactory.initialize();
      expect(mockConnection.connect).toHaveBeenCalled();
      expect(DatabaseFactory.connection).toBe(mockConnection);
    });

    it('should not reconnect if already connected', async () => {
      mockConnection.isConnected.mockReturnValue(true);
      // @ts-ignore
      DatabaseFactory.connection = mockConnection;
      await DatabaseFactory.initialize();
      expect(mockConnection.connect).not.toHaveBeenCalled();
    });

    it('should throw and log error if initialization fails', async () => {
      mockConnection.isConnected.mockReturnValue(false);
      mockConnection.connect.mockRejectedValueOnce(new Error('fail'));
      await expect(DatabaseFactory.initialize()).rejects.toThrow('fail');
    });
  });

  describe('getConnection', () => {
    it('should throw if not initialized', () => {
      // @ts-ignore
      DatabaseFactory.connection = null;
      expect(() => DatabaseFactory.getConnection()).toThrow('Database not initialized');
    });

    it('should throw if connection is lost', () => {
      mockConnection.isConnected.mockReturnValue(false);
      // @ts-ignore
      DatabaseFactory.connection = mockConnection;
      expect(() => DatabaseFactory.getConnection()).toThrow('Database connection lost');
    });

    it('should return connection if connected', () => {
      mockConnection.isConnected.mockReturnValue(true);
      // @ts-ignore
      DatabaseFactory.connection = mockConnection;
      expect(DatabaseFactory.getConnection()).toBe(mockConnection);
    });
  });

  describe('disconnect', () => {
    it('should disconnect and set connection to null', async () => {
      // @ts-ignore
      DatabaseFactory.connection = mockConnection;
      await DatabaseFactory.disconnect();
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(DatabaseFactory.connection).toBeNull();
    });

    it('should do nothing if connection is null', async () => {
      // @ts-ignore
      DatabaseFactory.connection = null;
      await expect(DatabaseFactory.disconnect()).resolves.toBeUndefined();
    });

    it('should throw and log error if disconnect fails', async () => {
      // @ts-ignore
      DatabaseFactory.connection = mockConnection;
      mockConnection.disconnect.mockRejectedValueOnce(new Error('disconnect fail'));
      await expect(DatabaseFactory.disconnect()).rejects.toThrow('disconnect fail');
    });
  });

  describe('getConnectionInfo', () => {
    it('should return not connected info if no connection', () => {
      // @ts-ignore
      DatabaseFactory.connection = null;
      expect(DatabaseFactory.getConnectionInfo()).toEqual({
        status: 'Not connected',
        orm: dbConfig.orm,
        type: dbConfig.type
      });
    });

    it('should return connection info from connection if available', () => {
      mockConnection.getConnectionInfo.mockReturnValue({ foo: 'bar' });
      // @ts-ignore
      DatabaseFactory.connection = mockConnection;
      expect(DatabaseFactory.getConnectionInfo()).toEqual({ foo: 'bar' });
    });

    it('should return default connected info if getConnectionInfo not implemented', () => {
      // @ts-ignore
      DatabaseFactory.connection = { ...mockConnection, getConnectionInfo: undefined };
      expect(DatabaseFactory.getConnectionInfo()).toEqual({
        status: 'Connected',
        orm: dbConfig.orm,
        type: dbConfig.type
      });
    });
  });

  describe('testConnection', () => {
    it('should throw if no connection', async () => {
      // @ts-ignore
      DatabaseFactory.connection = null;
      await expect(DatabaseFactory.testConnection()).rejects.toThrow('No database connection available');
    });

    it('should throw if testConnection not implemented', async () => {
      // @ts-ignore
      DatabaseFactory.connection = { ...mockConnection, testConnection: undefined };
      await expect(DatabaseFactory.testConnection()).rejects.toThrow('testConnection method is not implemented');
    });

    it('should call testConnection', async () => {
      // @ts-ignore
      DatabaseFactory.connection = mockConnection;
      mockConnection.testConnection.mockResolvedValue('ok');
      await expect(DatabaseFactory.testConnection()).resolves.toBe('ok');
    });
  });

  describe('runMigrations', () => {
    it('should throw if no connection', async () => {
      // @ts-ignore
      DatabaseFactory.connection = null;
      await expect(DatabaseFactory.runMigrations()).rejects.toThrow('No database connection available');
    });

    it('should throw if runMigrations not implemented', async () => {
      // @ts-ignore
      DatabaseFactory.connection = { ...mockConnection, runMigrations: undefined };
      await expect(DatabaseFactory.runMigrations()).rejects.toThrow('runMigrations method is not implemented');
    });

    it('should call runMigrations', async () => {
      // @ts-ignore
      DatabaseFactory.connection = mockConnection;
      mockConnection.runMigrations.mockResolvedValue('migrated');
      await expect(DatabaseFactory.runMigrations()).resolves.toBe('migrated');
    });
  });

  describe('rollbackMigrations', () => {
    it('should throw if no connection', async () => {
      // @ts-ignore
      DatabaseFactory.connection = null;
      await expect(DatabaseFactory.rollbackMigrations()).rejects.toThrow('No database connection available');
    });

    it('should throw if rollbackMigrations not implemented', async () => {
      // @ts-ignore
      DatabaseFactory.connection = { ...mockConnection, rollbackMigrations: undefined };
      await expect(DatabaseFactory.rollbackMigrations()).rejects.toThrow('rollbackMigrations method is not implemented');
    });

    it('should call rollbackMigrations', async () => {
      // @ts-ignore
      DatabaseFactory.connection = mockConnection;
      mockConnection.rollbackMigrations.mockResolvedValue('rolled back');
      await expect(DatabaseFactory.rollbackMigrations()).resolves.toBe('rolled back');
    });
  });
});