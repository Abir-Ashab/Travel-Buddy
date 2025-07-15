import { mediaModel } from "../repositories/media.repository";
import { postModel } from '../repositories/post.repository';
import { Media } from "../interfaces/media.interface";
import { CloudinaryService } from "../services/cloudinary.service"
import { NotFoundError } from "../errors/NotFoundError";

const getMediaByPost = async (postId: string): Promise<Media[]> => {
  return await mediaModel.findByPostId(postId);
};

const getMediaById = async (mediaId: string): Promise<Media | null> => {
  const media =  await mediaModel.findById(mediaId);
  if(!media) {
    throw new NotFoundError("Media not found");
  }
  return media;
};

const createMedia = async (
  postId: string,
  file: Express.Multer.File
): Promise<Media> => {
  const post = await postModel.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const uploadResult = await CloudinaryService.uploadImage(file);

  const mediaId = await mediaModel.create({
    post_id: postId,
    image_url: uploadResult.secure_url
  });

  const createdMedia = await mediaModel.findById(mediaId);
  if (!createdMedia) {
    throw new Error('Media not found after creation');
  }
  
  return createdMedia;
};

const updateMedia = async (
  mediaId: string,
  file: Express.Multer.File
): Promise<Media | null> => {
  const media = await mediaModel.findById(mediaId);
  if(!media) {
    throw new NotFoundError("Media not found");
  }

  await CloudinaryService.deleteImage(media.image_url);
  const uploadResult = await CloudinaryService.uploadImage(file);

  await mediaModel.update(mediaId, {
    image_url: uploadResult.secure_url
  });

  return await mediaModel.findById(mediaId);
};

const deleteMedia = async (mediaId: string): Promise<boolean> => {
  const media = await mediaModel.findById(mediaId);
  if(!media) {
    throw new NotFoundError("Media not found");
  }
  await CloudinaryService.deleteImage(media.image_url);

  return await mediaModel.delete(mediaId);
};

export const MediaService = {
  getMediaByPost,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia
};