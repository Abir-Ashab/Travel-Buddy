// src/controllers/post.controller.ts
import { Request, Response } from 'express';
import { postService } from '../services/post.service';

import { 
  createPostSchema, 
  updatePostSchema, 
  postFiltersSchema, 
  reportPostSchema 
} from '../validations/post.validation';
import { catchAsync } from '../utils/catchAsync';


const createPost = catchAsync(async (req: Request, res: Response) => {
  const validatedData = req.body;
  const { user_id } = req.body;
  console.log("userId", user_id);
  const post = await postService.createPost(user_id, validatedData);
  res.status(201).json({ data: post });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    const validatedQuery = postFiltersSchema.parse(req.query);
    const posts = await postService.getAllPosts(validatedQuery);
    res.json({ data: posts });
});


const getPost = catchAsync(async (req: Request, res: Response) => {
    const postId = req.params.id;
    const post = await postService.getPostById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.json({ data: post });
});


const updatePost = catchAsync(async (req: Request, res: Response) => {
    const validatedData = updatePostSchema.parse(req.body);
    const postId = req.body.post_id;
    const userId = req.body.user_id;
    const post = await postService.updatePost(postId, userId, validatedData);
    res.json({ data: post });
});

const toggleLike = catchAsync(async (req: Request, res: Response) => {
    const postId = req.body.post_id;
    const userId = req.body.user_id || req.params.user_id; // Use params if available
    const result = await postService.toggleLike(userId, postId);
    res.json({ data: result });
});

const getPostLikes = catchAsync(async (req: Request, res: Response) => {
    const postId = req.params.id;
    const likes = await postService.getPostLikes(postId);
    res.json({ data: likes });
});

const toggleSave = catchAsync(async (req: Request, res: Response) => {
    const postId = req.body.post_id;
    const userId = req.body.user_id;
    const result = await postService.toggleSave(userId, postId);
    res.json({ data: result });
});

const getSavedPosts = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    console.log("userId", userId);
    const posts = await postService.getSavedPosts(userId);
    res.json({ data: posts });
});


const reportPost = catchAsync(async (req: Request, res: Response) => {
    const validatedData = reportPostSchema.parse(req.body);
    const postId = req.body.post_id;
    const userId = req.body.user_id;
    const report = await postService.reportPost(
      userId,
      postId,
      validatedData.reason,
      validatedData.description
    );
    res.status(201).json({ data: report });
});

const getFeaturedPosts = catchAsync(async (req: Request, res: Response) => {
    const posts = await postService.getFeaturedPosts();
    res.json({ data: posts });
});

const getTrendingPosts = catchAsync(async (req: Request, res: Response) => {
    const posts = await postService.getTrendingPosts();
    res.json({ data: posts });
});

const sharePost = catchAsync(async (req: Request, res: Response) => {
    const postId = req.body.post_id;
    const result = await postService.sharePost(postId);
    res.json({ data: result });
});


export const postController = {
    createPost,
    getAllPosts,
    getPost,
    updatePost,
    toggleLike,
    getPostLikes,
    toggleSave,
    getSavedPosts,
    reportPost,
    getFeaturedPosts,
    getTrendingPosts,
    sharePost
};