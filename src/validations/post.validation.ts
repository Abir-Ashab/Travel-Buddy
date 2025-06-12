import { z } from 'zod';
import { PostStatus, ReportReason } from '../interfaces/post.interface';

// Create enum schemas from the interface enums
const PostStatusSchema = z.nativeEnum(PostStatus);
const ReportReasonSchema = z.nativeEnum(ReportReason);

export const createPostSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(10).max(2000),
  location: z.string().min(2).max(255),
  // images: z.array(z.string().url()).max(10).default([]),
  tags: z.array(z.string().max(50)).max(10).default([]),
  status: PostStatusSchema.default(PostStatus.PUBLISHED)
});

export const updatePostSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(10).max(2000).optional(),
  location: z.string().min(2).max(255).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  status: PostStatusSchema.optional()
});

export const postFiltersSchema = z.object({
  location: z.string().max(255).optional(),
  tags: z.array(z.string()).optional(),
  status: PostStatusSchema.optional(),
  is_featured: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10)
});

export const reportPostSchema = z.object({
  reason: ReportReasonSchema,
  description: z.string().max(500).optional()
});

// Type exports for TypeScript usage
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostFiltersInput = z.infer<typeof postFiltersSchema>;
export type ReportPostInput = z.infer<typeof reportPostSchema>;