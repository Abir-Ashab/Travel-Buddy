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
});


