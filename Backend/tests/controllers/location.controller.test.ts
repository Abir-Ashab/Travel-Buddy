import { LocationController } from '../../src/controllers/location.controller';
import { LocationService } from '../../src/services/location.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/location.service');

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
};

describe('LocationController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllLocations', () => {
        it('should return locations with default pagination', async () => {
            const req = {
                query: {}
            } as unknown as Request;
            const res = mockResponse();
            (LocationService.getAllLocations as jest.Mock).mockResolvedValue(['loc1', 'loc2']);
            const next = jest.fn();
            await LocationController.getAllLocations(req, res, next);

            expect(LocationService.getAllLocations).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                country: undefined,
                region: undefined
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: ['loc1', 'loc2']
            });
        });

        it('should parse query params and return locations', async () => {
            const req = {
                query: { page: '2', limit: '5', country: 'US', region: 'CA' }
            } as unknown as Request;
            const res = mockResponse();
            (LocationService.getAllLocations as jest.Mock).mockResolvedValue(['loc3']);
            const next = jest.fn();
            await LocationController.getAllLocations(req, res, next);

            expect(LocationService.getAllLocations).toHaveBeenCalledWith({
                page: 2,
                limit: 5,
                country: 'US',
                region: 'CA'
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: ['loc3']
            });
        });
    });

    describe('searchLocations', () => {
        it('should return 400 if query is missing', async () => {
            const req = { query: {} } as unknown as Request;
            const res = mockResponse();
            const next = jest.fn();
            await LocationController.searchLocations(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Search query is required'
            });
        });

        it('should return search results', async () => {
            const req = { query: { q: 'paris' } } as unknown as Request;
            const res = mockResponse();
            (LocationService.searchLocations as jest.Mock).mockResolvedValue(['Paris']);
            const next = jest.fn();
            await LocationController.searchLocations(req, res, next);

            expect(LocationService.searchLocations).toHaveBeenCalledWith('paris');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: ['Paris']
            });
        });
    });

    describe('getLocationById', () => {
        it('should return 404 if location not found', async () => {
            const req = { params: { id: '123' } } as unknown as Request;
            const res = mockResponse();
            (LocationService.getLocationById as jest.Mock).mockResolvedValue(null);
            const next = jest.fn();
            await LocationController.getLocationById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Location not found'
            });
        });

        it('should return location if found', async () => {
            const req = { params: { id: '456' } } as unknown as Request;
            const res = mockResponse();
            (LocationService.getLocationById as jest.Mock).mockResolvedValue({ id: '456', name: 'NYC' });
            const next = jest.fn();
            await LocationController.getLocationById(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { id: '456', name: 'NYC' }
            });
        });
    });

    describe('createLocation', () => {
        it('should create and return new location', async () => {
            const req = { body: { name: 'Berlin' } } as unknown as Request;
            const res = mockResponse();
            (LocationService.createLocation as jest.Mock).mockResolvedValue({ id: '789', name: 'Berlin' });
            const next = jest.fn();
            await LocationController.createLocation(req, res, next);

            expect(LocationService.createLocation).toHaveBeenCalledWith({ name: 'Berlin' });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { id: '789', name: 'Berlin' },
                message: 'Location created successfully'
            });
        });
    });

    describe('updateLocation', () => {
        it('should return 404 if location not found', async () => {
            const req = { params: { id: '999' }, body: { name: 'Updated' } } as unknown as Request;
            const res = mockResponse();
            (LocationService.updateLocation as jest.Mock).mockResolvedValue(null);
            const next = jest.fn();
            await LocationController.updateLocation(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Location not found'
            });
        });

        it('should update and return location', async () => {
            const req = { params: { id: '100' }, body: { name: 'Updated' } } as unknown as Request;
            const res = mockResponse();
            (LocationService.updateLocation as jest.Mock).mockResolvedValue({ id: '100', name: 'Updated' });
            const next = jest.fn();
            await LocationController.updateLocation(req, res, next);

            expect(LocationService.updateLocation).toHaveBeenCalledWith('100', { name: 'Updated' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { id: '100', name: 'Updated' },
                message: 'Location updated successfully'
            });
        });
    });

    describe('deleteLocation', () => {
        it('should return 404 if location not found', async () => {
            const req = { params: { id: '404' } } as unknown as Request;
            const res = mockResponse();
            (LocationService.deleteLocation as jest.Mock).mockResolvedValue(false);
            const next = jest.fn();
            await LocationController.deleteLocation(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Location not found'
            });
        });

        it('should delete and return success message', async () => {
            const req = { params: { id: '200' } } as unknown as Request;
            const res = mockResponse();
            (LocationService.deleteLocation as jest.Mock).mockResolvedValue(true);
            const next = jest.fn();
            await LocationController.deleteLocation(req, res, next);

            expect(LocationService.deleteLocation).toHaveBeenCalledWith('200');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Location deleted successfully'
            });
        });
    });
});