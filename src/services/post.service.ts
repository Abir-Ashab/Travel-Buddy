// src/services/post.service.ts
import { createPostModel } from '../models/post.model';
import { Post, PostFilters, Report } from '../interfaces/post.interface';
import KnexConnection from '../database/implementations/knex/KnexConnection';
const knexConnection = new KnexConnection();
await knexConnection.connect();

const knexInstance = knexConnection.getClient(); // This returns client
const postModel = createPostModel(knexInstance);

const createPost = async (user_id: string, postData: Partial<Post>): Promise<Post> => {
    return postModel.create({ ...postData, user_id: user_id });
}

const getAllPosts = async (filters: PostFilters): Promise<Post[]> => {
  return postModel.findAll(filters);
}

const getPostById = async (id: string): Promise<Post | null> => {
  return postModel.findById(id);
}

const updatePost = async (id: string, userId: string, data: Partial<Post>): Promise<Post> => {
  const post = await postModel.findById(id);
  if (!post || post.user_id !== userId) {
    throw new Error('Post not found or unauthorized');
  }
  return postModel.update(id, data);
}

const deletePost = async (id : string, userId: string): Promise<void> => {
  const post = await postModel.findById(id);
  if (!post || post.user_id !== userId) {
    throw new Error('Post not found or unauthorized');
  }
  await postModel.delete(id);
}

const toggleLike = async (userId: string, postId: string): Promise<{ liked: boolean }> => {
  const liked = await postModel.toggleLike(userId, postId);
  return { liked };
}

const getPostLikes = async (postId: string): Promise<number> => {
  const likes = await postModel.getLikes(postId);
  return Array.isArray(likes) ? likes.length : 0;
}

const toggleSave = async (userId: string, postId: string): Promise<{ saved: boolean }> => {
  const saved = await postModel.toggleSave(userId, postId);
  return { saved };
}

const getSavedPosts = async (userId: string): Promise<Post[]> => {
  return postModel.getSavedPosts(userId);
}

const getFeaturedPosts = async (): Promise<Post[]> => {
  return postModel.getFeatured();
}

const getTrendingPosts = async (): Promise<Post[]> => {
  return postModel.getTrending();
}

const reportPost = async (reporterId: string, postId: string, reason: string, description?: string): Promise<Report> => {
  return postModel.createReport({
    reporter_id: reporterId,
    post_id: postId,
    reason: reason as any,
    description
  });
}

const sharePost = async (postId: string): Promise<{ message: string }> => {
  return { message: 'Post shared successfully' };
}

// getReportedPosts
const getReportedPosts = async (): Promise<Report[]> => {
  return postModel.getReportedPosts();
}
// updateReportStatus
const updateReportStatus = async (reportId: string, status: 'resolved' | 'unresolved'): Promise<Report> => {
  return postModel.updateReportStatus(reportId, status);
}

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  getPostLikes,
  toggleSave,
  getSavedPosts,
  getFeaturedPosts,
  getTrendingPosts,
  reportPost,
  sharePost,
  getReportedPosts,
  updateReportStatus
};