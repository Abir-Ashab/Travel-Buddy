import { createTransportModel } from "../models/transport.model"
import { createPostModel } from '../models/post.model';
import {
  Transport,
  CreateTransportRequest,
  UpdateTransportRequest
} from '../interfaces/transport.interface';
import KnexConnection from '../database/implementations/knex/KnexConnection';

const knexConnection = new KnexConnection();
await knexConnection.connect();

const knexInstance = knexConnection.getClient();
const transportModel = createTransportModel(knexInstance);

const getTransportsByPost = async (postId: string): Promise<Transport[]> => {
  return await transportModel.findByPostId(postId);
};

const getTransportById = async (transportId: string): Promise<Transport | null> => {
  return await transportModel.findById(transportId);
};

const createTransport = async (
  postId: string,
  transportData: CreateTransportRequest
): Promise<Transport> => {
  // Verify user owns the post
  const postModel = createPostModel(knexInstance);
  const post = await postModel.findById(postId);

  const transportId = await transportModel.create({
    post_id: postId,
    ...transportData
  });

  const createdTransport = await transportModel.findById(transportId);
  if (!createdTransport) {
    throw new Error('Transport not found after creation');
  }
  
  return createdTransport;
};

const updateTransport = async (
  transportId: string,
  userId: string,
  updateData: UpdateTransportRequest
): Promise<Transport | null> => {
  // Verify user owns the post that this transport belongs to
  const transport = await transportModel.findById(transportId);
  if (!transport) {
    return null;
  }

  const postModel = createPostModel(knexInstance);
  const post = await postModel.findById(transport.post_id);
  
  if (!post || String(post.user_id) !== String(userId)) {
    return null;
  }

  await transportModel.update(transportId, updateData);
  return await transportModel.findById(transportId);
};

const deleteTransport = async (transportId: string, userId: string): Promise<boolean> => {
  // Verify user owns the post that this transport belongs to
  const transport = await transportModel.findById(transportId);
  if (!transport) {
    return false;
  }

  const postModel = createPostModel(knexInstance);
  const post = await postModel.findById(transport.post_id);
  
  if (!post || String(post.user_id) !== String(userId)) {
    return false;
  }

  return await transportModel.delete(transportId);
};

export const TransportService = {
  getTransportsByPost,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport
};
