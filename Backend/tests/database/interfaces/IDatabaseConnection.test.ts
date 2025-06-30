import IDatabaseConnection from '../../../src/database/interfaces/IDatabaseConnection';

describe('IDatabaseConnection', () => {
  let db: IDatabaseConnection;

  beforeEach(() => {
    db = new (IDatabaseConnection as any)();
  });

  test('connect() should throw not implemented error', async () => {
    await expect(db.connect()).rejects.toThrow('Method connect() must be implemented');
  });

  test('disconnect() should throw not implemented error', async () => {
    await expect(db.disconnect()).rejects.toThrow('Method disconnect() must be implemented');
  });

  test('getClient() should throw not implemented error', () => {
    expect(() => db.getClient()).toThrow('Method getClient() must be implemented');
  });

  test('isConnected() should throw not implemented error', () => {
    expect(() => db.isConnected()).toThrow('Method isConnected() must be implemented');
  });

  test('testConnection() should throw not implemented error', async () => {
    await expect(db.testConnection()).rejects.toThrow('Method testConnection() must be implemented');
  });

  test('runMigrations() should throw not implemented error', async () => {
    await expect(db.runMigrations()).rejects.toThrow('Method runMigrations() must be implemented');
  });

  test('rollbackMigrations() should throw not implemented error', async () => {
    await expect(db.rollbackMigrations()).rejects.toThrow('Method rollbackMigrations() must be implemented');
  });

  test('getConnectionInfo() should throw not implemented error', () => {
    expect(() => db.getConnectionInfo()).toThrow('Method getConnectionInfo() must be implemented');
  });
});