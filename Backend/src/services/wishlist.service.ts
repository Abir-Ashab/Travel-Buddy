import { wishlistModel } from "../repositories/wishlist.repository";
import { locationModel } from "../repositories/location.repository";
import {
  Wishlist,
  WishlistItem,
  WishlistWithItems,
  CreateWishlistRequest,
  UpdateWishlistRequest,
  CreateWishlistItemRequest,
  UpdateWishlistItemRequest,
  WishlistFilters,
  WishlistShareResponse
} from '../interfaces/wishlist.interface';
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ValidationError } from "../errors/validationError";
import { NotFoundError } from "../errors/NotFoundError";

const validateDates = (startDate: Date, endDate: Date): void => {
  const today = new Date();
  
  if (startDate <= today) {
    throw new Error('Start date must be in the future');
  }
  
  if (endDate <= startDate) {
    throw new Error('End date must be after start date');
  }
};
const validateWishlistDates = (startDateStr: string, endDateStr: string): void => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  validateDates(startDate, endDate);
};

const createWishlist = async (userId: string, data: CreateWishlistRequest): Promise<Wishlist> => {
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }
  if (!data.name || !data.grouping_type) {
    throw new ValidationError("Name and grouping_type are required")
  }
  const wishlistId = await wishlistModel.create(userId, data);
  const createdWishlist = await wishlistModel.findById(wishlistId);
  if (!createdWishlist) throw new Error('Wishlist not found after creation');
  return createdWishlist;
};

const getWishlistById = async (id: string, userId?: string): Promise<WishlistWithItems | null> => {
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }
  const wishlist = await wishlistModel.findWithItems(id);
  if (!wishlist) {
    throw new NotFoundError("Wishlist not found");
  }
  if (!wishlist.is_public && wishlist.user_id !== userId) {
    throw new UnauthorizedError("Wishlist is not public and user it doesn't match");
  }
  return wishlist;
};

const getUserWishlists = async (userId: string, filters: WishlistFilters = {}): Promise<Wishlist[]> => {
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }
  return await wishlistModel.findByUserId(userId, filters);
};

const getPublicWishlists = async (filters: WishlistFilters = {}): Promise<Wishlist[]> => {
  return await wishlistModel.findPublic(filters);
};

const updateWishlist = async (id: string, userId: string, data: UpdateWishlistRequest): 
Promise<Wishlist | null> => {
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }
  const wishlist = await wishlistModel.findById(id);
  if (!wishlist) {
    throw new NotFoundError("Wishlist not found");
  }
  const hasOwnership = await wishlistModel.checkOwnership(id, userId);
  if (!hasOwnership) {
    throw new UnauthorizedError("User doesn't have the ownership")
  }
  await wishlistModel.update(id, data);
  return await wishlistModel.findById(id);
};

const deleteWishlist = async (id: string, userId: string): Promise<boolean> => {
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }
  const wishlist = await wishlistModel.findById(id);
  if (!wishlist) {
    throw new NotFoundError("Wishlist not found");
  }
  const hasOwnership = await wishlistModel.checkOwnership(id, userId);
  if (!hasOwnership) {
    throw new UnauthorizedError("User doesn't have the ownership")
  }
  return await wishlistModel.delete(id);
};

const addWishlistItem = async (
  wishlistId: string,
  userId: string,
  data: CreateWishlistItemRequest
): Promise<WishlistItem | null> => {
  
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }

  if(data.preferred_end_date && data.preferred_start_date) {
    validateWishlistDates(data.preferred_start_date, data.preferred_end_date);
  }

  if (!data.priority_level || (!data.location_id && !data.location)) {
    throw new ValidationError("'Priority level and location data are required'") 
  }

  const hasOwnership = await wishlistModel.checkOwnership(wishlistId, userId);
  if (!hasOwnership) {
    throw new UnauthorizedError("User doesn't have the ownership")
  }
  let locationId = data.location_id;

  if (!locationId && data.location) {
    const locationData = {
      name: data.location.name,
      country: data.location.country || null,
      region: data.location.region || null,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      timezone: data.location.timezone || 'UTC',
    };

    try {
      locationId = await locationModel.create(locationData);

      if (locationModel.update) {
        await locationModel.update(locationId, locationData);
      }
    } catch (error) {
      return null;
    }
  }

  if (!locationId) return null;

  const locationExists = await wishlistModel.checkLocationExists(locationId);
  if (!locationExists) return null;

  const isDuplicate = await wishlistModel.checkDuplicateItem(wishlistId, locationId);
  if (isDuplicate) return null;



  const itemId = await wishlistModel.createItem(wishlistId, { ...data, location_id: locationId });

  const createdItem = await wishlistModel.findItemById(itemId);
  if (!createdItem) throw new ValidationError("Invalid location or duplicate entry");

  return createdItem;
};

const updateWishlistItem = async (id: string, userId: string, data: UpdateWishlistItemRequest): 
Promise<WishlistItem | null> => {
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }
  const item = await wishlistModel.findItemById(id);
  if (!item) {
    throw new NotFoundError("Wishlist not found");
  }
  const hasOwnership = await wishlistModel.checkItemOwnership(id, userId);
  if (!hasOwnership) {
    throw new UnauthorizedError("User doesn't have the ownership")
  }
  await wishlistModel.updateItem(id, data);
  return await wishlistModel.findItemById(id);
};

const deleteWishlistItem = async (id: string, userId: string): Promise<boolean> => {
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }
  const item = await wishlistModel.findItemById(id);
  if (!item) {
    throw new NotFoundError("Wishlist not found");
  }
  const hasOwnership = await wishlistModel.checkItemOwnership(id, userId);
  if (!hasOwnership) {
    throw new UnauthorizedError("User doesn't have the ownership")
  }
  const wishItem = await wishlistModel.deleteItem(id);
  if(!wishItem) {
    throw new NotFoundError("Wishlist item not found");
  }
  return wishItem;
};

const getWishlistItem = async (userId: string): Promise<any | null> => {
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }
  return await wishlistModel.getUserWishlistItemsWithLocations(userId)
};

const shareWishlist = async (id: string, userId: string): Promise<WishlistShareResponse | null> => {
  if(!userId) {
    throw new UnauthorizedError("Authentication required")
  }
  const hasOwnership = await wishlistModel.checkOwnership(id, userId);
  if (!hasOwnership) return null;
  const wishlist = await wishlistModel.findById(id);
  if (!wishlist) return null;
  if (!wishlist.is_public) await wishlistModel.update(id, { is_public: true });

  const wishlistWithItems = await wishlistModel.findWithItems(id);
  if (!wishlistWithItems) return null;

  const shareUrl = `${process.env.BASE_URL || 'http://localhost:3000/api'}/wishlists/shared/${id}`;

  return {
    share_url: shareUrl,
    wishlist: wishlistWithItems
  };
};

const getSharedWishlist = async (id: string): Promise<WishlistWithItems | null> => {
  const wishlist = await wishlistModel.findWithItems(id);
  if (!wishlist || !wishlist.is_public) {
    throw new NotFoundError("")
  }
  return wishlist;
};

export const WishlistService = {
  createWishlist,
  getWishlistById,
  getUserWishlists,
  getPublicWishlists,
  updateWishlist,
  deleteWishlist,
  getWishlistItem,
  addWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  shareWishlist,
  getSharedWishlist
};


