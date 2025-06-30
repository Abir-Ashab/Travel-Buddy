import { TransportController } from '../../src/controllers/transport.controller';
import { TransportService } from '../../src/services/transport.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/transport.service');

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('TransportController', () => {
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('getTransportById - should return 404 if not found', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    (TransportService.getTransportById as jest.Mock).mockResolvedValue(null);

    const next = jest.fn();
    await TransportController.getTransportById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Transport not found' });
  });

  it('createTransport - should return 201 and created transport', async () => {
    const req = { params: { postId: '1' }, body: { name: 'Test' } } as unknown as Request;
    const mockTransport = { id: 1, name: 'Test' };
    (TransportService.createTransport as jest.Mock).mockResolvedValue(mockTransport);

    const next = jest.fn();
    await TransportController.createTransport(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockTransport,
      message: 'Transport created successfully',
    });
  });

  it('updateTransport - should return 404 if not found or unauthorized', async () => {
    const req = { params: { id: '1' }, body: { name: 'Updated Test', user_id: '123' } } as unknown as Request;
    (TransportService.updateTransport as jest.Mock).mockResolvedValue(null);

    const next = jest.fn();
    await TransportController.updateTransport(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Transport not found or unauthorized' });
  });

  it('getTransportsByPost - should return transports for a post', async () => {
    const req = { params: { postId: '1' } } as unknown as Request;
    const mockTransports = [{ id: 1, name: 'Test Transport' }];
    (TransportService.getTransportsByPost as jest.Mock).mockResolvedValue(mockTransports);

    const next = jest.fn();
    await TransportController.getTransportsByPost(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockTransports,
    });
  });

  it('deleteTransport - should return 404 if not found', async () => {
    const req = {
      params: { id: '1' },
      body: { user_id: '123' }
    } as unknown as Request;

    (TransportService.deleteTransport as jest.Mock).mockResolvedValue(false);

    const next = jest.fn();
    await TransportController.deleteTransport(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Transport not found or unauthorized' });
  });

  it('deleteTransport - should return success message on successful deletion', async () => {
    const req = {
      params: { id: '1' },
      body: { user_id: '123' }
    } as unknown as Request;

    (TransportService.deleteTransport as jest.Mock).mockResolvedValue(true);

    const next = jest.fn();
    await TransportController.deleteTransport(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Transport deleted successfully',
    });
  });

  it('getTransportById - should return transport by ID', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const mockTransport = { id: 1, name: 'Test Transport' };
    (TransportService.getTransportById as jest.Mock).mockResolvedValue(mockTransport);

    const next = jest.fn();
    await TransportController.getTransportById(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockTransport,
    });
  });
});
