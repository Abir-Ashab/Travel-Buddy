import { ProximityController } from '../../src/controllers/proximity.controller';
import { ProximityService } from '../../src/services/proximity.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/proximity.service');

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('ProximityController', () => {
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('getProximitySettings - should return 401 if user not authenticated', async () => {
    const req = { body: {} } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getProximitySettings(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getProximitySettings - should return settings if authenticated', async () => {
    const req = { body: { user_id: '123' } } as unknown as Request;
    const mockSettings = { radius: 100 };
    (ProximityService.getProximitySettings as jest.Mock).mockResolvedValue(mockSettings);
    const next = jest.fn();
    await ProximityController.getProximitySettings(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockSettings });
  });

  it('createProximitySettings - should return 401 if user not authenticated', async () => {
    const req = { body: {} } as unknown as Request;
    const next = jest.fn();
    await ProximityController.createProximitySettings(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('createProximitySettings - should return 201 and created settings', async () => {
    const req = { body: { user_id: '123', radius: 100 } } as unknown as Request;
    const mockSettings = { radius: 100 };
    (ProximityService.createProximitySettings as jest.Mock).mockResolvedValue(mockSettings);
    const next = jest.fn();
    await ProximityController.createProximitySettings(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockSettings,
      message: 'Proximity settings created successfully'
    });
  });

  it('updateProximitySettings - should return 401 if user not authenticated', async () => {
    const req = { body: {} } as unknown as Request;
    const next = jest.fn();
    await ProximityController.updateProximitySettings(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('updateProximitySettings - should return 404 if settings not found', async () => {
    const req = { body: { user_id: '123', radius: 200 } } as unknown as Request;
    (ProximityService.updateProximitySettings as jest.Mock).mockResolvedValue(null);
    const next = jest.fn();
    await ProximityController.updateProximitySettings(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Proximity settings not found' });
  });

  it('updateProximitySettings - should return updated settings', async () => {
    const req = { body: { user_id: '123', radius: 200 } } as unknown as Request;
    const mockSettings = { radius: 200 };
    (ProximityService.updateProximitySettings as jest.Mock).mockResolvedValue(mockSettings);
    const next = jest.fn();
    await ProximityController.updateProximitySettings(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockSettings,
      message: 'Proximity settings updated successfully'
    });
  });

  it('updateUserLocation - should return 401 if user not authenticated', async () => {
    const req = { body: {} } as unknown as Request;
    const next = jest.fn();
    await ProximityController.updateUserLocation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('updateUserLocation - should update location and return success', async () => {
    const req = { body: { user_id: '123', lat: 1, lng: 2 } } as unknown as Request;
    const mockLocation = { lat: 1, lng: 2 };
    (ProximityService.updateUserLocation as jest.Mock).mockResolvedValue(mockLocation);
    (ProximityService.processProximityAlerts as jest.Mock).mockResolvedValue(undefined);
    const next = jest.fn();
    await ProximityController.updateUserLocation(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockLocation,
      message: 'Location updated successfully'
    });
  });

  it('getUserLocation - should return 401 if user not authenticated', async () => {
    const req = { query: { user_id: undefined } } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getUserLocation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getUserLocation - should return 404 if location not found', async () => {
    const req = { query: { user_id: '123' } } as unknown as Request;
    (ProximityService.getUserLocation as jest.Mock).mockResolvedValue(null);
    const next = jest.fn();
    await ProximityController.getUserLocation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User location not found' });
  });

  it('getUserLocation - should return user location', async () => {
    const req = { query: { user_id: '123' } } as unknown as Request;
    const mockLocation = { lat: 1, lng: 2 };
    (ProximityService.getUserLocation as jest.Mock).mockResolvedValue(mockLocation);
    const next = jest.fn();
    await ProximityController.getUserLocation(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockLocation });
  });

  it('getProximityAlerts - should return 401 if user not authenticated', async () => {
    const req = { query: { user_id: undefined } } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getProximityAlerts(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getProximityAlerts - should return alerts', async () => {
    const req = { query: { user_id: '123' } } as unknown as Request;
    const mockAlerts = [{ id: 1 }];
    (ProximityService.getProximityAlerts as jest.Mock).mockResolvedValue(mockAlerts);
    const next = jest.fn();
    await ProximityController.getProximityAlerts(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockAlerts });
  });

  it('getProximityHistory - should return 401 if user not authenticated', async () => {
    const req = { body: {}, query: {} } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getProximityHistory(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getProximityHistory - should return history', async () => {
    const req = { body: { user_id: '123' }, query: { limit: 10, offset: 0 } } as unknown as Request;
    const mockHistory = [{ id: 1 }];
    (ProximityService.getProximityHistory as jest.Mock).mockResolvedValue(mockHistory);
    const next = jest.fn();
    await ProximityController.getProximityHistory(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockHistory });
  });

  it('deleteProximityAlert - should return 401 if user not authenticated', async () => {
    const req = { params: { id: '1' }, body: {} } as unknown as Request;
    const next = jest.fn();
    await ProximityController.deleteProximityAlert(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('deleteProximityAlert - should return 404 if not found or unauthorized', async () => {
    const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
    (ProximityService.deleteProximityAlert as jest.Mock).mockResolvedValue(false);
    const next = jest.fn();
    await ProximityController.deleteProximityAlert(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Proximity alert not found or unauthorized' });
  });

  it('deleteProximityAlert - should return success message on successful deletion', async () => {
    const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
    (ProximityService.deleteProximityAlert as jest.Mock).mockResolvedValue(true);
    const next = jest.fn();
    await ProximityController.deleteProximityAlert(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Proximity alert deleted successfully' });
  });

  it('getNearbyWishlistLocations - should return 401 if user not authenticated', async () => {
    const req = { query: { user_id: undefined } } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getNearbyWishlistLocations(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getNearbyWishlistLocations - should return wishlist locations', async () => {
    const req = { query: { user_id: '123' } } as unknown as Request;
    const mockItems = [{ id: 1 }];
    (ProximityService.getNearbyWishlistLocations as jest.Mock).mockResolvedValue(mockItems);
    const next = jest.fn();
    await ProximityController.getNearbyWishlistLocations(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockItems });
  });

  it('getNearbyTripParticipants - should return 401 if user not authenticated', async () => {
    const req = { query: { user_id: undefined } } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getNearbyTripParticipants(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getNearbyTripParticipants - should return nearby participants', async () => {
    const req = { query: { user_id: '123' } } as unknown as Request;
    const mockParticipants = [{ id: 1 }];
    (ProximityService.getNearbyTripParticipants as jest.Mock).mockResolvedValue(mockParticipants);
    const next = jest.fn();
    await ProximityController.getNearbyTripParticipants(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockParticipants });
  });

  it('getNearbyFeaturedPosts - should return 401 if user not authenticated', async () => {
    const req = { query: { user_id: undefined } } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getNearbyFeaturedPosts(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getNearbyFeaturedPosts - should return nearby posts', async () => {
    const req = { query: { user_id: '123' } } as unknown as Request;
    const mockPosts = [{ id: 1 }];
    (ProximityService.getNearbyFeaturedPosts as jest.Mock).mockResolvedValue(mockPosts);
    const next = jest.fn();
    await ProximityController.getNearbyFeaturedPosts(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockPosts });
  });

  it('getNearbyAttractions - should return 401 if user not authenticated', async () => {
    const req = { query: { user_id: undefined } } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getNearbyAttractions(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getNearbyAttractions - should return nearby attractions', async () => {
    const req = { query: { user_id: '123' } } as unknown as Request;
    const mockAttractions = [{ id: 1 }];
    (ProximityService.getNearbyAttractions as jest.Mock).mockResolvedValue(mockAttractions);
    const next = jest.fn();
    await ProximityController.getNearbyAttractions(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockAttractions });
  });

  it('getNearbyAccommodations - should return 401 if user not authenticated', async () => {
    const req = { query: { user_id: undefined } } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getNearbyAccommodations(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getNearbyAccommodations - should return nearby accommodations', async () => {
    const req = { query: { user_id: '123' } } as unknown as Request;
    const mockAccommodations = [{ id: 1 }];
    (ProximityService.getNearbyAccommodations as jest.Mock).mockResolvedValue(mockAccommodations);
    const next = jest.fn();
    await ProximityController.getNearbyAccommodations(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockAccommodations });
  });

  it('getNearbyDining - should return 401 if user not authenticated', async () => {
    const req = { query: { user_id: undefined } } as unknown as Request;
    const next = jest.fn();
    await ProximityController.getNearbyDining(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('getNearbyDining - should return nearby dining', async () => {
    const req = { query: { user_id: '123' } } as unknown as Request;
    const mockDining = [{ id: 1 }];
    (ProximityService.getNearbyDining as jest.Mock).mockResolvedValue(mockDining);
    const next = jest.fn();
    await ProximityController.getNearbyDining(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockDining });
  });

  it('processProximityAlerts - should return 401 if user not authenticated', async () => {
    const req = { body: {} } as unknown as Request;
    const next = jest.fn();
    await ProximityController.processProximityAlerts(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
  });

  it('processProximityAlerts - should return success message', async () => {
    const req = { body: { user_id: '123' } } as unknown as Request;
    (ProximityService.processProximityAlerts as jest.Mock).mockResolvedValue(undefined);
    const next = jest.fn();
    await ProximityController.processProximityAlerts(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Proximity alerts processed successfully' });
  });
});
