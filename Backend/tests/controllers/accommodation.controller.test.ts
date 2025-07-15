import { AccommodationController } from '../../src/controllers/accommodation.controller';
import { AccommodationService } from '../../src/services/accommodation.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/accommodation.service');

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('AccommodationController', () => {
  const mockReq = {} as Request;
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('getAccommodationById - should return 404 if not found', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    (AccommodationService.getAccommodationById as jest.Mock).mockResolvedValue(null);

    const next = jest.fn();
    await AccommodationController.getAccommodationById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Accommodation not found' });
  });

  it('createAccommodation - should return 201 and created accommodation', async () => {
    const req = { params: { postId: '1' }, body: { name: 'Test' } } as unknown as Request;
    const mockAccommodation = { id: 1, name: 'Test' };
    (AccommodationService.createAccommodation as jest.Mock).mockResolvedValue(mockAccommodation);

    const next = jest.fn();
    await AccommodationController.createAccommodation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAccommodation,
      message: 'Accommodation created successfully',
    });
  });

  it('updateAccommodation - should return 404 if not found or unauthorized', async () => {
    const req = { params: { id: '1' }, body: { name: 'Updated Test', user_id: '123' } } as unknown as Request;
    (AccommodationService.updateAccommodation as jest.Mock).mockResolvedValue(null);

    const next = jest.fn();
    await AccommodationController.updateAccommodation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Accommodation not found or unauthorized' });
  });

  it('getAccommodationsByPost - should return accommodations for a post', async () => {
    const req = { params: { postId: '1' } } as unknown as Request;
    const mockAccommodations = [{ id: 1, name: 'Test Accommodation' }];
    (AccommodationService.getAccommodationsByPost as jest.Mock).mockResolvedValue(mockAccommodations);

    const next = jest.fn();
    await AccommodationController.getAccommodationsByPost(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAccommodations,
    });
  });

  it('deleteAccommodation - should return 404 if not found', async () => {
    const req = {
        params: { id: '1' },
        body: { user_id: '123' }  
    } as unknown as Request;

    (AccommodationService.deleteAccommodation as jest.Mock).mockResolvedValue(false);

    const next = jest.fn();
    await AccommodationController.deleteAccommodation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Accommodation not found or unauthorized' });
  });

  it('deleteAccommodation - should return success message on successful deletion', async () => {
    const req = {
        name: 'deleteAccommodation',
        params: { id: '1' },
        body: { user_id: '123' }  
    } as unknown as Request;

    (AccommodationService.deleteAccommodation as jest.Mock).mockResolvedValue(true);

    const next = jest.fn();
    await AccommodationController.deleteAccommodation(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Accommodation deleted successfully',
    });
  });

  it('getAccommodationById - should return accommodation by ID', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const mockAccommodation = { id: 1, name: 'Test Accommodation' };
    (AccommodationService.getAccommodationById as jest.Mock).mockResolvedValue(mockAccommodation);

    const next = jest.fn();
    await AccommodationController.getAccommodationById(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAccommodation,
    });
  });
  
});