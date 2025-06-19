export interface Wishlist {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  grouping_type: 'region' | 'theme' | 'budget' | 'season';
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WishlistItem {
  id: number;
  wishlist_id: number;
  location_id: number;
  notes?: string;
  estimated_budget?: number;
  priority_level: number;
  preferred_start_date?: Date;
  preferred_end_date?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  location?: Location;
}

export interface CreateWishlistRequest {
  name: string;
  description?: string;
  grouping_type: 'region' | 'theme' | 'budget' | 'season';
  is_public?: boolean;
}

export interface UpdateWishlistRequest {
  name?: string;
  description?: string;
  grouping_type?: 'region' | 'theme' | 'budget' | 'season';
  is_public?: boolean;
}

export interface AddWishlistItemRequest {
  location_id: number;
  notes?: string;
  estimated_budget?: number;
  priority_level: number;
  preferred_start_date?: Date;
  preferred_end_date?: Date;
}

export interface UpdateWishlistItemRequest {
  notes?: string;
  estimated_budget?: number;
  priority_level?: number;
  preferred_start_date?: Date;
  preferred_end_date?: Date;
}

export interface WishlistFilters {
  user_id?: number;
  grouping_type?: 'region' | 'theme' | 'budget' | 'season';
  is_public?: boolean;
  search?: string;
}
