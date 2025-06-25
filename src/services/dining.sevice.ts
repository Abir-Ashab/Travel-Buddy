import { diningModel } from '../models/dining.model';
import { postModel } from '../models/post.model';
import {
  Dining,
  CreateDiningRequest,
  UpdateDiningRequest
} from '../interfaces/dining.interface';

const getDiningsByPost = async (postId: string): Promise<Dining[]> => {
  return await diningModel.findByPostId(postId);
};

const getDiningById = async (diningId: string): Promise<Dining | null> => {
  return await diningModel.findById(diningId);
};

const createDining = async (
  postId: string,
  // userId: string,
  diningData: CreateDiningRequest
): Promise<Dining> => {

  const post = await postModel.findById(postId);
  
//   if (!post || String(post.user_id) !== String(userId)) {
//     throw new Error('Post not found or unauthorized');
//   }

  // Validate rating
  if (diningData.rating < 1 || diningData.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const diningId = await diningModel.create({
    post_id: postId,
    ...diningData
  });

  const createdDining = await diningModel.findById(diningId);
  if (!createdDining) {
    throw new Error('Dining experience not found after creation');
  }
  
  return createdDining;
};

const updateDining = async (
  diningId: string,
  // userId: string,
  updateData: UpdateDiningRequest
): Promise<Dining | null> => {
  const dining = await diningModel.findById(diningId);
  if (!dining) {
    return null;
  }

  const post = await postModel.findById(dining.post_id);
  
//   if (!post || String(post.user_id) !== String(userId)) {
//     return null;
//   }

  if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }

  await diningModel.update(diningId, updateData);
  return await diningModel.findById(diningId);
};

const deleteDining = async (diningId: string): Promise<boolean> => {
  // Verify user owns the post that this dining belongs to
  const dining = await diningModel.findById(diningId);
  if (!dining) {
    return false;
  }

  const post = await postModel.findById(dining.post_id);
//   if (!post || String(post.user_id) !== String(userId)) {
//     return false;
//   }

  return await diningModel.delete(diningId);
}

export const DiningService = {
    getDiningsByPost,
    getDiningById,
    createDining,
    updateDining,
    deleteDining
}