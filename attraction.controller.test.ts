// File: tests/controllers/attraction.controller.test.ts

import { AttractionController } from '../../src/controllers/attraction.controller';
import { AttractionService } from '../../src/services/attraction.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/attraction.service');

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('AttractionController', () => {
  const mockReq = {} as Request;
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('getAttractionById - should return 404 if not found', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    (AttractionService.getAttractionById as jest.Mock).mockResolvedValue(null);
    const next = jest.fn();
    await AttractionController.getAttractionById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Attraction not found' });
  });

  it('createAttraction - should return 201 and created attraction', async () => {
    const req = { params: { postId: '1' }, body: { name: 'Beach' } } as unknown as Request;
    const mockAttraction = { id: 2, name: 'Beach' };
    (AttractionService.createAttraction as jest.Mock).mockResolvedValue(mockAttraction);

    const next = jest.fn();
    await AttractionController.createAttraction(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAttraction,
      message: 'Attraction created successfully',
    });
  });
});
