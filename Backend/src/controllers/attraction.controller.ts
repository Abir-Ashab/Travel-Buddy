import { Request, Response } from 'express';
import { AttractionService } from '../services/attraction.service';
import { CreateAttractionRequest, UpdateAttractionRequest } from '../interfaces/attraction.interface';
import { catchAsync } from '../utils/catchAsync.util';

const getAttractionsByPost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const attractions = await AttractionService.getAttractionsByPost(postId);
  res.json({
    success: true,
    data: attractions,
  });
});

const getAttractionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const attraction = await AttractionService.getAttractionById(id);

  res.json({
    success: true,
    data: attraction,
  });
});

const createAttraction = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const attractionData: CreateAttractionRequest = req.body;
  const attraction = await AttractionService.createAttraction(postId, attractionData);

  res.status(201).json({
    success: true,
    data: attraction,
    message: 'Attraction created successfully',
  });
});

const updateAttraction = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateAttractionRequest = req.body;
  const attraction = await AttractionService.updateAttraction(id, updateData);

  res.json({
    success: true,
    data: attraction,
    message: 'Attraction updated successfully',
  });
});

const deleteAttraction = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await AttractionService.deleteAttraction(id);

  res.json({
    success: true,
    message: 'Attraction deleted successfully',
  });
});

export const AttractionController = {
  getAttractionsByPost,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
};