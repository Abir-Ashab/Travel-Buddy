<!-- accomodation.interface.ts -->
export interface Accommodation {
  id: string;
  post_id: string;
  accommodation_type: 'hotel' | 'hostel' | 'airbnb' | 'guesthouse';
  name: string;
  cost_per_night: number;
  rating: number;
  review?: string;
  notes?: string;
  amenities?: string[];
  check_in_date: Date;
  check_out_date: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateAccommodationRequest {
  accommodation_type: 'hotel' | 'hostel' | 'airbnb' | 'guesthouse';
  name: string;
  cost_per_night: number;
  rating: number;
  review?: string;
  notes?: string;
  amenities?: string[];
  check_in_date: string;
  check_out_date: string;
}

export interface UpdateAccommodationRequest {
  accommodation_type?: 'hotel' | 'hostel' | 'airbnb' | 'guesthouse';
  name?: string;
  cost_per_night?: number;
  rating?: number;
  review?: string;
  notes?: string;
  amenities?: string[];
  check_in_date?: string;
  check_out_date?: string;
}



<!-- accomodation.route.ts -->
import { Router } from 'express';
import { AccommodationController } from "../controllers/accomodation.controller";
// import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/post/:postId', AccommodationController.getAccommodationsByPost);
router.get('/:id', AccommodationController.getAccommodationById);
router.post('/post/:postId', AccommodationController.createAccommodation);
router.put('/:id', AccommodationController.updateAccommodation);
router.delete('/:id', AccommodationController.deleteAccommodation);

export { router as accommodationRoutes };


<!-- accomodation.controller.ts -->
import { Request, Response } from 'express';
import { AccommodationService } from "../services/accomodation.service";
import { CreateAccommodationRequest, UpdateAccommodationRequest } from "../interfaces/accomodation.interface";
import { catchAsync } from "../utils/catchAsync";

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

  if (!accommodation) {
    return res.status(404).json({
      success: false,
      message: 'Accommodation not found'
    });
  }

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
  const userId = req.body.user_id;

  // if (!userId) {
  //   return res.status(401).json({
  //     success: false,
  //     message: 'User not authenticated'
  //   });
  // }

  const accommodation = await AccommodationService.updateAccommodation(id, updateData);

  if (!accommodation) {
    return res.status(404).json({
      success: false,
      message: 'Accommodation not found or unauthorized'
    });
  }

  res.json({
    success: true,
    data: accommodation,
    message: 'Accommodation updated successfully'
  });
});

const deleteAccommodation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.body.user_id;

  // if (!userId) {
  //   return res.status(401).json({
  //     success: false,
  //     message: 'User not authenticated'
  //   });
  // }

  const success = await AccommodationService.deleteAccommodation(id);

  if (!success) {
    return res.status(404).json({
      success: false,
      message: 'Accommodation not found or unauthorized'
    });
  }

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

<!-- accomodation.service.ts -->
import { createAccommodationModel } from "../models/accomodation.model"
import { createPostModel } from '../models/post.model';
import {
  Accommodation,
  CreateAccommodationRequest,
  UpdateAccommodationRequest
} from "../interfaces/accomodation.interface"
import KnexConnection from '../database/implementations/knex/KnexConnection';

const knexConnection = new KnexConnection();
await knexConnection.connect();

const knexInstance = knexConnection.getClient();
const accommodationModel = createAccommodationModel(knexInstance);

const getAccommodationsByPost = async (postId: string): Promise<Accommodation[]> => {
  return await accommodationModel.findByPostId(postId);
};

const getAccommodationById = async (accommodationId: string): Promise<Accommodation | null> => {
  return await accommodationModel.findById(accommodationId);
};

const createAccommodation = async (
  postId: string,
//   userId: string,
  accommodationData: CreateAccommodationRequest
): Promise<Accommodation> => {

//   const postModel = createPostModel(knexInstance);
//   const post = await postModel.findById(postId);
  
//   if (!post || String(post.user_id) !== String(userId)) {
//     throw new Error('Post not found or unauthorized');
//   }

  // Validate rating
  if (accommodationData.rating < 1 || accommodationData.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate dates
  const checkIn = new Date(accommodationData.check_in_date);
  const checkOut = new Date(accommodationData.check_out_date);
  
  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be after check-in date');
  }

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
  // userId: string,
  updateData: UpdateAccommodationRequest
): Promise<Accommodation | null> => {
  // Verify user owns the post that this accommodation belongs to
  const accommodation = await accommodationModel.findById(accommodationId);
  if (!accommodation) {
    return null;
  }

  const postModel = createPostModel(knexInstance);
  const post = await postModel.findById(accommodation.post_id);
  
  // if (!post || String(post.user_id) !== String(userId)) {
  //   return null;
  // }

  if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }

  if (updateData.check_in_date && updateData.check_out_date) {
    const checkIn = new Date(updateData.check_in_date);
    const checkOut = new Date(updateData.check_out_date);
    
    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }
  }

  await accommodationModel.update(accommodationId, updateData);
  return await accommodationModel.findById(accommodationId);
};

const deleteAccommodation = async (accommodationId: string): Promise<boolean> => {
  const accommodation = await accommodationModel.findById(accommodationId);
  if (!accommodation) {
    return false;
  }

  const postModel = createPostModel(knexInstance);
  const post = await postModel.findById(accommodation.post_id);
  
  // if (!post || String(post.user_id) !== String(userId)) {
  //   return false;
  // }

  return await accommodationModel.delete(accommodationId);
};

export const AccommodationService = {
  getAccommodationsByPost,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation
};


<!-- accomodation.model.ts -->
import { Accommodation } from "../interfaces/accomodation.interface"

class AccommodationModel {
  constructor(knex) {
    this.knex = knex;
    this.tableName = 'accommodation';
  }

  async findByPostId(postId: string): Promise<Accommodation[]> {
    return await this.knex(this.tableName)
      .where('post_id', postId)
      .orderBy('check_in_date', 'asc');
  }

  async findById(id: string): Promise<Accommodation | null> {
    const accommodation = await this.knex(this.tableName)
      .where('id', id)
      .first();

    return accommodation || null;
  }

  async create(accommodationData: any): Promise<string> {
    const [accommodation] = await this.knex(this.tableName)
      .insert(accommodationData)
      .returning('id');

    return accommodation.id;
  }

  async update(id: string, updateData: any): Promise<void> {
    await this.knex(this.tableName)
      .where('id', id)
      .update({
        ...updateData,
        updated_at: this.knex.fn.now()
      });
  }

  async delete(id: string): Promise<boolean> {
    const deletedRows = await this.knex(this.tableName)
      .where('id', id)
      .del();

    return deletedRows > 0;
  }
}

export const createAccommodationModel = (knex) => new AccommodationModel(knex);
export { AccommodationModel };