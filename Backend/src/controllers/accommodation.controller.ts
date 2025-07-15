import { Request, Response } from 'express';
import { AccommodationService } from "../services/accommodation.service";
import { CreateAccommodationRequest, UpdateAccommodationRequest } from "../interfaces/accommodation.interface";
import { catchAsync } from "../utils/catchAsync.util";

const getAccommodationsByPost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const accommodations = await AccommodationService.getAccommodationsByPost(postId);
  res.json({
    success: true,
    data: accommodations
  });
});

const getAccommodationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const accommodation = await AccommodationService.getAccommodationById(id);

  res.json({
    success: true,
    data: accommodation
  });
});

const createAccommodation = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const accommodationData: CreateAccommodationRequest = req.body;

  const accommodation = await AccommodationService.createAccommodation(postId, accommodationData);

  res.status(201).json({
    success: true,
    data: accommodation,
    message: 'Accommodation created successfully'
  });
});

const updateAccommodation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateAccommodationRequest = req.body;
  const accommodation = await AccommodationService.updateAccommodation(id, updateData);

  res.json({
    success: true,
    data: accommodation,
    message: 'Accommodation updated successfully'
  });
});

const deleteAccommodation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const success = await AccommodationService.deleteAccommodation(id);

  res.json({
    success: true,
    message: 'Accommodation deleted successfully'
  });
});

export const AccommodationController = {
  getAccommodationsByPost,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
};
