import { accommodationModel } from "../repositories/accommodation.repository"
import { postModel } from '../repositories/post.repository';
import {
  Accommodation,
  CreateAccommodationRequest,
  UpdateAccommodationRequest
} from "../interfaces/accommodation.interface"
import { NotFoundError } from "../errors/NotFoundError";

const validateRating = (rating: number): void => {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
};

const validateCheckInOutDates = (checkInDate: string, checkOutDate: string): void => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be after check-in date');
  }
};

const validateCreateAccommodationData = (accommodationData: CreateAccommodationRequest): void => {
  validateRating(accommodationData.rating);
  validateCheckInOutDates(accommodationData.check_in_date, accommodationData.check_out_date);
};

const validateUpdateAccommodationData = (updateData: UpdateAccommodationRequest): void => {
  if (updateData.rating !== undefined) {
    validateRating(updateData.rating);
  }

  if (updateData.check_in_date && updateData.check_out_date) {
    validateCheckInOutDates(updateData.check_in_date, updateData.check_out_date);
  }
};

// Service methods
const getAccommodationsByPost = async (postId: string): Promise<Accommodation[]> => {
  return await accommodationModel.findByPostId(postId);
};

const getAccommodationById = async (accommodationId: string): Promise<Accommodation | null> => {
  const accommodation = await accommodationModel.findById(accommodationId);
  if (!accommodation) {
    throw new NotFoundError("Accommodation not found")
  }
  return accommodation;
};

const createAccommodation = async (
  postId: string,
  accommodationData: CreateAccommodationRequest
): Promise<Accommodation> => {
  validateCreateAccommodationData(accommodationData);

  const accommodationId = await accommodationModel.create({
    post_id: postId,
    ...accommodationData
  });

  const createdAccommodation = await accommodationModel.findById(accommodationId);
  if (!createdAccommodation) {
    throw new Error('Accommodation not found after creation');
  }
  
  return createdAccommodation;
};

const updateAccommodation = async (
  accommodationId: string,
  updateData: UpdateAccommodationRequest
): Promise<Accommodation | null> => {
  const accommodation = await accommodationModel.findById(accommodationId);
  if (!accommodation) {
    throw new NotFoundError("Accommodation not found")
  }

  const post = await postModel.findById(accommodation.post_id);
  
  validateUpdateAccommodationData(updateData);

  await accommodationModel.update(accommodationId, updateData);
  return await accommodationModel.findById(accommodationId);
};

const deleteAccommodation = async (accommodationId: string): Promise<boolean> => {
  const accommodation = await accommodationModel.findById(accommodationId);
  if (!accommodation) {
    throw new NotFoundError("Accommodation not found")
  }
  const post = await postModel.findById(accommodation.post_id);
  return await accommodationModel.delete(accommodationId);
};

export const AccommodationService = {
  getAccommodationsByPost,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation
};