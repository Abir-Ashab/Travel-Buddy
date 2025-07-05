import { Request, Response } from 'express';
import { MediaService } from "../services/media.service";
import { CreateMediaRequest, UpdateMediaRequest } from "../interfaces/media.interface";
import { catchAsync } from "../utils/catchAsync.util";

const getMediaByPost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const media = await MediaService.getMediaByPost(postId);
  res.json({
    success: true,
    data: media
  });
});

const getMediaById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const media = await MediaService.getMediaById(id);

  if (!media) {
    return res.status(404).json({
      success: false,
      message: 'Media not found'
    });
  }

  res.json({
    success: true,
    data: media
  });
});

const createMedia = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: 'Image file is required'
    });
  }

  const media = await MediaService.createMedia(postId, file);

  res.status(201).json({
    success: true,
    data: media,
    message: 'Media created successfully'
  });
});

const updateMedia = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: 'Image file is required'
    });
  }

  const media = await MediaService.updateMedia(id, file);

  if (!media) {
    return res.status(404).json({
      success: false,
      message: 'Media not found or unauthorized'
    });
  }

  res.json({
    success: true,
    data: media,
    message: 'Media updated successfully'
  });
});

const deleteMedia = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const success = await MediaService.deleteMedia(id);

  if (!success) {
    return res.status(404).json({
      success: false,
      message: 'Media not found or unauthorized'
    });
  }

  res.json({
    success: true,
    message: 'Media deleted successfully'
  });
});

export const MediaController = {
  getMediaByPost,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
};
