import { z } from 'zod';
import { PostStatus, ReportReason } from '../interfaces/post.interface';

const createPostValidation = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    location_id: z.number().int().positive("Location ID must be a positive integer"),
    total_cost: z.number().min(0, "Total cost must be non-negative"),
    duration_days: z.number().int().positive("Duration must be at least 1 day"),
    effort_level: z.number().int().min(1).max(5, "Effort level must be between 1 and 5"),
    status: z.nativeEnum(PostStatus).optional().default(PostStatus.DRAFT),
    media_urls: z.array(z.string().url("Invalid media URL")).optional(),
  }),
});

const updatePostValidation = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    location_id: z.number().int().positive("Location ID must be a positive integer").optional(),
    total_cost: z.number().min(0, "Total cost must be non-negative").optional(),
    duration_days: z.number().int().positive("Duration must be at least 1 day").optional(),
    effort_level: z.number().int().min(1).max(5, "Effort level must be between 1 and 5").optional(),
    status: z.nativeEnum(PostStatus).optional(),
    is_featured: z.boolean().optional(),
  }),
});

const postFiltersValidation = z.object({
  query: z.object({
    location_id: z.number().int().positive().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    min_cost: z.number().min(0).optional(),
    max_cost: z.number().min(0).optional(),
    min_duration: z.number().int().positive().optional(),
    max_duration: z.number().int().positive().optional(),
    effort_level: z.number().int().min(1).max(5).optional(),
    is_featured: z.boolean().optional(),
    user_id: z.number().int().positive().optional(),
    search: z.string().optional(),
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(100).optional().default(10),
  }),
});

const reportPostValidation = z.object({
  body: z.object({
    reason: z.nativeEnum(ReportReason),
    description: z.string().optional(),
  }),
});

export const PostValidations = {
  createPostValidation,
  updatePostValidation,
  postFiltersValidation,
  reportPostValidation,
};