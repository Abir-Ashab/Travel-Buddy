import api from "../../services/api";

interface WishlistItem {
  id: string;
  priority_level: number;
  notes: string;
  estimated_budget?: number;
  preferred_start_date: string;
  preferred_end_date: string;
  location: {
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  createdAt?: string;
}

interface WishlistItemFormData {
  priority_level: number;
  notes: string;
  estimated_budget: number | '';
  preferred_start_date: string;
  preferred_end_date: string;
  location: {
    name: string;
    country: string;
    region: string;
    latitude: number | '';
    longitude: number | '';
    timezone: string;
  };
}

export interface Wishlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  itemCount?: number;
}

export const wishlistApi = {
  createWishlist: async (data: {
    name: string;
    description?: string;
    grouping_type: 'region' | 'theme' | 'budget' | 'season';
    is_public?: boolean;
  }) => {
    const response = await api.post('/wishlists', data);
    return response.data.data;
  },

  getUserWishlists: async (): Promise<Wishlist[]> => {
    const response = await api.get('/wishlists/my-wishlists');
    return response.data.data;
  },

  getPublicWishlists: async (): Promise<Wishlist[]> => {
    const response = await api.get('/wishlists/public');
    return response.data.data;
  },

  getWishlistById: async (id: string): Promise<Wishlist> => {
    const response = await api.get(`/wishlists/${id}`);
    return response.data.data;
  },

  updateWishlist: async (id: string, data: { name?: string; description?: string; is_public?: boolean }) => {
    const response = await api.put(`/wishlists/${id}`, data);
    return response.data.data;
  },

  deleteWishlist: async (id: string) => {
    const response = await api.delete(`/wishlists/${id}`);
    return response.data.data;
  },

  shareWishlist: async (id: string) => {
    const response = await api.post(`/wishlists/${id}/share`);
    return response.data.data;
  },

  getSharedWishlist: async (id: string): Promise<Wishlist> => {
    const response = await api.get(`/wishlists/shared/${id}`);
    return response.data.data;
  },

  addWishlistItem: async (wishlistId: string, data: WishlistItemFormData) => {
    const response = await api.post(`/wishlists/${wishlistId}/items`, data);
    return response.data.data;
  },

  updateWishlistItem: async (itemId: string, data: WishlistItemFormData) => {
    const response = await api.put(`/wishlists/items/${itemId}`, data);
    return response.data.data;
  },

  getWishlistItem: async (itemId: string) => {
    const response = await api.get(`/wishlists/items/${itemId}`);
    return response.data.data;
  },

  deleteWishlistItem: async (itemId: string) => {
    const response = await api.delete(`/wishlists/items/${itemId}`);
    return response.data.data;
  },
};
