import { CreateWishlistRequest, UpdateWishlistRequest, WishlistFilters, CreateWishlistItemRequest, UpdateWishlistItemRequest } from '../../src/interfaces/wishlist.interface';
import { WishlistService } from '../../src/services/wishlist.service';
import { WishlistController } from '../../src/controllers/wishlist.controller';
import { Request, Response } from 'express';
import { catchAsync } from '../../src/utils/catchAsync.util';

jest.mock('../../src/services/wishlist.service');

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('WishlistController', () => {
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('createWishlist - should return 401 if user_id is missing', async () => {
    const req = { body: {} } as unknown as Request;
    const next = jest.fn();
    await WishlistController.createWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
  });

  it('createWishlist - should return 400 if name or grouping_type is missing', async () => {
    const req = { body: { user_id: '1', name: '' } } as unknown as Request;
    const next = jest.fn();
    await WishlistController.createWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Name and grouping_type are required' });
  });

  it('createWishlist - should return 201 and created wishlist', async () => {
    const req = { body: { user_id: '1', name: 'Wishlist', grouping_type: 'type' } } as unknown as Request;
    const mockWishlist = { id: 1, name: 'Wishlist' };
    (WishlistService.createWishlist as jest.Mock).mockResolvedValue(mockWishlist);
    const next = jest.fn();
    await WishlistController.createWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockWishlist,
      message: 'Wishlist created successfully',
    });
  });

  it('getWishlistById - should return 404 if not found', async () => {
    const req = { params: { id: '1' }, query: { user_id: '1' } } as unknown as Request;
    (WishlistService.getWishlistById as jest.Mock).mockResolvedValue(null);
    const next = jest.fn();
    await WishlistController.getWishlistById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Wishlist not found' });
  });

  it('getWishlistById - should return wishlist by ID', async () => {
    const req = { params: { id: '1' }, query: { user_id: '1' } } as unknown as Request;
    const mockWishlist = { id: 1, name: 'Wishlist' };
    (WishlistService.getWishlistById as jest.Mock).mockResolvedValue(mockWishlist);
    const next = jest.fn();
    await WishlistController.getWishlistById(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockWishlist });
  });

  it('getUserWishlists - should return wishlists for user', async () => {
    const req = { query: { user_id: '1' } } as unknown as Request;
    const mockWishlists = [{ id: 1, name: 'Wishlist' }];
    (WishlistService.getUserWishlists as jest.Mock).mockResolvedValue(mockWishlists);
    const next = jest.fn();
    await WishlistController.getUserWishlists(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockWishlists });
  });

  it('getPublicWishlists - should return public wishlists', async () => {
    const req = { query: {} } as unknown as Request;
    const mockWishlists = [{ id: 1, name: 'Public Wishlist' }];
    (WishlistService.getPublicWishlists as jest.Mock).mockResolvedValue(mockWishlists);
    const next = jest.fn();
    await WishlistController.getPublicWishlists(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockWishlists });
  });

  it('updateWishlist - should return 401 if user_id is missing', async () => {
    const req = { params: { id: '1' }, body: {} } as unknown as Request;
    const next = jest.fn();
    await WishlistController.updateWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
  });

  it('updateWishlist - should return 404 if not found or unauthorized', async () => {
    const req = { params: { id: '1' }, body: { user_id: '1' } } as unknown as Request;
    (WishlistService.updateWishlist as jest.Mock).mockResolvedValue(null);
    const next = jest.fn();
    await WishlistController.updateWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Wishlist not found or unauthorized' });
  });

  it('updateWishlist - should return updated wishlist', async () => {
    const req = { params: { id: '1' }, body: { user_id: '1', name: 'Updated' } } as unknown as Request;
    const mockWishlist = { id: 1, name: 'Updated' };
    (WishlistService.updateWishlist as jest.Mock).mockResolvedValue(mockWishlist);
    const next = jest.fn();
    await WishlistController.updateWishlist(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockWishlist,
      message: 'Wishlist updated successfully',
    });
  });

  it('deleteWishlist - should return 401 if user_id is missing', async () => {
    const req = { params: { id: '1' }, body: {} } as unknown as Request;
    const next = jest.fn();
    await WishlistController.deleteWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
  });

  it('deleteWishlist - should return 404 if not found or unauthorized', async () => {
    const req = { params: { id: '1' }, body: { user_id: '1' } } as unknown as Request;
    (WishlistService.deleteWishlist as jest.Mock).mockResolvedValue(false);
    const next = jest.fn();
    await WishlistController.deleteWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Wishlist not found or unauthorized' });
  });

  it('deleteWishlist - should return success message on successful deletion', async () => {
    const req = { params: { id: '1' }, body: { user_id: '1' } } as unknown as Request;
    (WishlistService.deleteWishlist as jest.Mock).mockResolvedValue(true);
    const next = jest.fn();
    await WishlistController.deleteWishlist(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Wishlist deleted successfully',
    });
  });

  it('addWishlistItem - should return 401 if user_id is missing', async () => {
    const req = { params: { wishlistId: '1' }, body: {} } as unknown as Request;
    const next = jest.fn();
    await WishlistController.addWishlistItem(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
  });

  it('addWishlistItem - should return 400 if priority_level or location is missing', async () => {
    const req = { params: { wishlistId: '1' }, body: { user_id: '1' } } as unknown as Request;
    const next = jest.fn();
    await WishlistController.addWishlistItem(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Priority level and location data are required' });
  });

  it('addWishlistItem - should return 400 if item is invalid or duplicate', async () => {
    const req = {
      params: { wishlistId: '1' },
      body: { user_id: '1', priority_level: 1, location_id: 'loc1' }
    } as unknown as Request;
    (WishlistService.addWishlistItem as jest.Mock).mockResolvedValue(null);
    const next = jest.fn();
    await WishlistController.addWishlistItem(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid location or duplicate entry' });
  });

  it('addWishlistItem - should return 201 and added item', async () => {
    const req = {
      params: { wishlistId: '1' },
      body: { user_id: '1', priority_level: 1, location_id: 'loc1' }
    } as unknown as Request;
    const mockItem = { id: 1, priority_level: 1 };
    (WishlistService.addWishlistItem as jest.Mock).mockResolvedValue(mockItem);
    const next = jest.fn();
    await WishlistController.addWishlistItem(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockItem,
      message: 'Item added to wishlist successfully',
    });
  });

  it('updateWishlistItem - should return 401 if user_id is missing', async () => {
    const req = { params: { itemId: '1' }, body: {} } as unknown as Request;
    const next = jest.fn();
    await WishlistController.updateWishlistItem(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
  });

  it('updateWishlistItem - should return 404 if not found or unauthorized', async () => {
    const req = { params: { itemId: '1' }, body: { user_id: '1' } } as unknown as Request;
    (WishlistService.updateWishlistItem as jest.Mock).mockResolvedValue(null);
    const next = jest.fn();
    await WishlistController.updateWishlistItem(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Wishlist item not found or unauthorized' });
  });

  it('updateWishlistItem - should return updated item', async () => {
    const req = { params: { itemId: '1' }, body: { user_id: '1', priority_level: 2 } } as unknown as Request;
    const mockItem = { id: 1, priority_level: 2 };
    (WishlistService.updateWishlistItem as jest.Mock).mockResolvedValue(mockItem);
    const next = jest.fn();
    await WishlistController.updateWishlistItem(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockItem,
      message: 'Wishlist item updated successfully',
    });
  });

  it('deleteWishlistItem - should return 401 if user_id is missing', async () => {
    const req = { params: { itemId: '1' }, body: {} } as unknown as Request;
    const next = jest.fn();
    await WishlistController.deleteWishlistItem(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
  });

  it('deleteWishlistItem - should return 404 if not found or unauthorized', async () => {
    const req = { params: { itemId: '1' }, body: { user_id: '1' } } as unknown as Request;
    (WishlistService.deleteWishlistItem as jest.Mock).mockResolvedValue(false);
    const next = jest.fn();
    await WishlistController.deleteWishlistItem(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Wishlist item not found or unauthorized' });
  });

  it('deleteWishlistItem - should return success message on successful deletion', async () => {
    const req = { params: { itemId: '1' }, body: { user_id: '1' } } as unknown as Request;
    (WishlistService.deleteWishlistItem as jest.Mock).mockResolvedValue(true);
    const next = jest.fn();
    await WishlistController.deleteWishlistItem(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Wishlist item deleted successfully',
    });
  });

  it('shareWishlist - should return 401 if user_id is missing', async () => {
    const req = { params: { id: '1' }, body: {} } as unknown as Request;
    const next = jest.fn();
    await WishlistController.shareWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
  });

  it('shareWishlist - should return 400 if unable to share', async () => {
    const req = { params: { id: '1' }, body: { user_id: '1' } } as unknown as Request;
    (WishlistService.shareWishlist as jest.Mock).mockResolvedValue(null);
    const next = jest.fn();
    await WishlistController.shareWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unable to share wishlist' });
  });

  it('shareWishlist - should return shared wishlist data', async () => {
    const req = { params: { id: '1' }, body: { user_id: '1' } } as unknown as Request;
    const mockShareData = { shareUrl: 'http://share' };
    (WishlistService.shareWishlist as jest.Mock).mockResolvedValue(mockShareData);
    const next = jest.fn();
    await WishlistController.shareWishlist(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockShareData,
      message: 'Wishlist shared successfully',
    });
  });

  it('getSharedWishlist - should return 404 if not found or private', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    (WishlistService.getSharedWishlist as jest.Mock).mockResolvedValue(null);
    const next = jest.fn();
    await WishlistController.getSharedWishlist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Shared wishlist not found or private' });
  });

  it('getSharedWishlist - should return shared wishlist', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const mockWishlist = { id: 1, name: 'Shared Wishlist' };
    (WishlistService.getSharedWishlist as jest.Mock).mockResolvedValue(mockWishlist);
    const next = jest.fn();
    await WishlistController.getSharedWishlist(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockWishlist });
  });
});