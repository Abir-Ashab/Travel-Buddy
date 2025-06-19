export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum ReportReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  FALSE_INFO = 'false_info',
  OTHER = 'other'
}

export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved'
}

export interface Location {
  id: number;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  created_at: Date;
}

export interface Post {
  id: number;
  user_id: number;
  location_id: number;
  title: string;
  description: string;
  total_cost: number;
  duration_days: number;
  effort_level: number;
  is_featured: boolean;
  status: PostStatus;
  likes_count: number;
  saves_count: number;
  shares_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Media {
  id: number;
  post_id: number;
  image_url: string;
}

export interface PostLike {
  id: number;
  post_id: number;
  user_id: number;
  created_at: Date;
}

export interface PostSave {
  id: number;
  post_id: number;
  user_id: number;
  created_at: Date;
}

export interface PostShare {
  id: number;
  post_id: number;
  user_id: number;
  platform?: 'facebook' | 'twitter' | 'whatsapp' | 'copy_link';
  created_at: Date;
}

export interface Report {
  id: number;
  reporter_id: number;
  post_id: number;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  created_at: Date;
}

export interface CreatePostRequest {
  title: string;
  description: string;
  location_id: number;
  total_cost: number;
  duration_days: number;
  effort_level: number;
  status?: PostStatus;
  media_urls?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  location_id?: number;
  total_cost?: number;
  duration_days?: number;
  effort_level?: number;
  status?: PostStatus;
  is_featured?: boolean;
}

export interface PostFilters {
  location_id?: number;
  country?: string;
  region?: string;
  min_cost?: number;
  max_cost?: number;
  min_duration?: number;
  max_duration?: number;
  effort_level?: number;
  is_featured?: boolean;
  user_id?: number;
  search?: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}


export interface PostFilters {
  location?: string;
  tags?: string[];
  status?: PostStatus;
  is_featured?: boolean;
  page?: number;
  limit?: number;
}

export interface Like {
  id: number;
  user_id: number;
  post_id: string;
  created_at: Date;
}

export interface SavedPost {
  id: number;
  user_id: number;
  post_id: string;
  created_at: Date;
}