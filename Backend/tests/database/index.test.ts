import * as db from '../../src/database/index';
import DatabaseFactory from '../../src/database/factories/DatabaseFactory';

jest.mock('../../src/database/factories/DatabaseFactory');

describe('database/index exports', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should export DatabaseFactory', () => {
        expect(db.DatabaseFactory).toBe(DatabaseFactory);
    });

    it('should call DatabaseFactory.initialize when initialize is called', () => {
        db.initialize();
        expect(DatabaseFactory.initialize).toHaveBeenCalled();
    });

    it('should call DatabaseFactory.getConnection when getConnection is called', () => {
        db.getConnection();
        expect(DatabaseFactory.getConnection).toHaveBeenCalled();
    });

    it('should call DatabaseFactory.disconnect when disconnect is called', () => {
        db.disconnect();
        expect(DatabaseFactory.disconnect).toHaveBeenCalled();
    });

    it('should call DatabaseFactory.testConnection when testConnection is called', () => {
        db.testConnection();
        expect(DatabaseFactory.testConnection).toHaveBeenCalled();
    });

    it('should call DatabaseFactory.runMigrations when runMigrations is called', () => {
        db.runMigrations();
        expect(DatabaseFactory.runMigrations).toHaveBeenCalled();
    });

    it('should call DatabaseFactory.rollbackMigrations when rollbackMigrations is called', () => {
        db.rollbackMigrations();
        expect(DatabaseFactory.rollbackMigrations).toHaveBeenCalled();
    });

    it('should call DatabaseFactory.getConnectionInfo when getConnectionInfo is called', () => {
        db.getConnectionInfo();
        expect(DatabaseFactory.getConnectionInfo).toHaveBeenCalled();
    });
});
