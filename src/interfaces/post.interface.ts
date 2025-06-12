// src/interfaces/post.interface.ts
export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  images: string[];
  tags: string[];
  is_featured: boolean;
  status: PostStatus;
  likes_count: number;
  saves_count: number;
  created_at: Date;
  updated_at: Date;
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
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

export interface Report {
  id: string;
  reporter_id: string;
  post_id: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  created_at: Date;
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