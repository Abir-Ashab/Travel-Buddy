import { Request, Response } from 'express';
import { WishlistService } from '../services/wishlist.service';
import {
  CreateWishlistRequest,
  UpdateWishlistRequest,
  CreateWishlistItemRequest,
  UpdateWishlistItemRequest,
  WishlistFilters
} from '../interfaces/wishlist.interface';
import { catchAsync } from '../utils/catchAsync.util';

const createWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const data: CreateWishlistRequest = req.body;
  const wishlist = await WishlistService.createWishlist(userId, data);
  res.status(201).json({ success: true, data: wishlist, message: 'Wishlist created successfully' });
});

const getWishlistById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const wishlist = await WishlistService.getWishlistById(id, userId);

  res.json({ success: true, data: wishlist });
});

const getUserWishlists = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const filters: WishlistFilters = {
    grouping_type: req.query.grouping_type as any,
    is_public: req.query.is_public === 'true' ? true : req.query.is_public === 'false' ? false : undefined,
    search: req.query.search as string,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
  };

  const wishlists = await WishlistService.getUserWishlists(userId, filters);
  res.json({ success: true, data: wishlists });
});

const getPublicWishlists = catchAsync(async (req: Request, res: Response) => {
  const filters: WishlistFilters = {
    grouping_type: req.query.grouping_type as any,
    search: req.query.search as string,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
  };

  const wishlists = await WishlistService.getPublicWishlists(filters);
  res.json({ success: true, data: wishlists });
});

const updateWishlist = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const data: UpdateWishlistRequest = req.body;
  const updatedWishlist = await WishlistService.updateWishlist(id, userId, data);
  res.json({ success: true, data: updatedWishlist, message: 'Wishlist updated successfully' });
});

const deleteWishlist = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const deleted = await WishlistService.deleteWishlist(id, userId);

  res.json({ success: true, message: 'Wishlist deleted successfully' });
});

const addWishlistItem = catchAsync(async (req: Request, res: Response) => {
  const { wishlistId } = req.params;
  const userId = req.user?.id;
  const data: CreateWishlistItemRequest = req.body;

  const item = await WishlistService.addWishlistItem(wishlistId, userId, data);
  res.status(201).json({ success: true, data: item, message: 'Item added to wishlist successfully' });
});

const updateWishlistItem = catchAsync(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const userId = req.user?.id;
  const data: UpdateWishlistItemRequest = req.body;
  const updatedItem = await WishlistService.updateWishlistItem(itemId, userId, data);

  res.json({ success: true, data: updatedItem, message: 'Wishlist item updated successfully' });
});

const deleteWishlistItem = catchAsync(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const userId = req.user?.id;
  const deleted = await WishlistService.deleteWishlistItem(itemId, userId);

  res.json({ success: true, message: 'Wishlist item deleted successfully' });
});

const getWishlistItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const item = await WishlistService.getWishlistItem(userId);
  res.json({ success: true, data: item });
});

const shareWishlist = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const shareData = await WishlistService.shareWishlist(id, userId);
  res.json({ success: true, data: shareData, message: 'Wishlist shared successfully' });
});

const getSharedWishlist = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const wishlist = await WishlistService.getSharedWishlist(id);

  res.json({ success: true, data: wishlist });
});

export const WishlistController = {
  createWishlist,
  getWishlistById,
  getUserWishlists,
  getPublicWishlists,
  updateWishlist,
  deleteWishlist,
  addWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  getWishlistItem,
  shareWishlist,
  getSharedWishlist
};
