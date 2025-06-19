import { createAttractionModel } from '../models/attraction.model';
import { createPostModel } from '../models/post.model';
import {
  Attraction,
  CreateAttractionRequest,
  UpdateAttractionRequest
} from '../interfaces/attraction.interface';
import KnexConnection from '../database/implementations/knex/KnexConnection';

const knexConnection = new KnexConnection();
await knexConnection.connect();

const knexInstance = knexConnection.getClient();
const attractionModel = createAttractionModel(knexInstance);

const getAttractionsByPost = async (postId: string): Promise<Attraction[]> => {
  return await attractionModel.findByPostId(postId);
};

const getAttractionById = async (attractionId: string): Promise<Attraction | null> => {
  return await attractionModel.findById(attractionId);
};

const createAttraction = async (
  postId: string,
//   userId: string,
  attractionData: CreateAttractionRequest
): Promise<Attraction> => {
  // Verify user owns the post
  const postModel = createPostModel(knexInstance);
  const post = await postModel.findById(postId);
  
//   if (!post || String(post.user_id) !== String(userId)) {
//     throw new Error('Post not found or unauthorized');
//   }

  // Validate rating
  if (attractionData.rating < 1 || attractionData.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate time spent
  if (attractionData.time_spent_hours < 0) {
    throw new Error('Time spent must be a positive number');
  }

  const attractionId = await attractionModel.create({
    post_id: postId,
    ...attractionData
  });

  const createdAttraction = await attractionModel.findById(attractionId);
  if (!createdAttraction) {
    throw new Error('Attraction not found after creation');
  }
  
  return createdAttraction;
};

const updateAttraction = async (
  attractionId: string,
  userId: string,
  updateData: UpdateAttractionRequest
): Promise<Attraction | null> => {
  // Verify user owns the post that this attraction belongs to
  const attraction = await attractionModel.findById(attractionId);
  if (!attraction) {
    return null;
  }

  const postModel = createPostModel(knexInstance);
  const post = await postModel.findById(attraction.post_id);
  
  if (!post || String(post.user_id) !== String(userId)) {
    return null;
  }

  // Validate rating if provided
  if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate time spent if provided
  if (updateData.time_spent_hours && updateData.time_spent_hours < 0) {
    throw new Error('Time spent must be a positive number');
  }

  await attractionModel.update(attractionId, updateData);
  return await attractionModel.findById(attractionId);
};

const deleteAttraction = async (attractionId: string, userId: string): Promise<boolean> => {
  // Verify user owns the post that this attraction belongs to
  const attraction = await attractionModel.findById(attractionId);
  if (!attraction) {
    return false;
  }

  const postModel = createPostModel(knexInstance);
  const post = await postModel.findById(attraction.post_id);
  
  if (!post || String(post.user_id) !== String(userId)) {
    return false;
  }

  return await attractionModel.delete(attractionId);
};

export const AttractionService = {
  getAttractionsByPost,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction
};