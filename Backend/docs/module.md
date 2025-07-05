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
import { AccommodationController } from "../controllers/accommodation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { USER_Role } from "../interfaces/user.interface";
import { AccommodationValidations } from "../validations/accommodation.validation";
import validateRequest from "../middlewares/validateRequest";

const router = Router();

router.get(
    '/post/:postId',
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    AccommodationController.getAccommodationsByPost
);

router.get(
    '/:id',
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    AccommodationController.getAccommodationById
);

router.post(
    '/post/:postId',
    validateRequest(AccommodationValidations.createAccommodationValidation),
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    AccommodationController.createAccommodation
);

router.put(
    '/:id',
    validateRequest(AccommodationValidations.updateAccommodationValidation),
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    AccommodationController.updateAccommodation
);

router.delete(
    '/:id',
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    AccommodationController.deleteAccommodation
);

export { router as accommodationRoutes };


<!-- accomodation.controller.ts -->
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
  const userId = req.user?.id;

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
  const userId = req.user?.id;

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
import { accommodationModel } from "../repositories/accommodation.repository"
import { postModel } from '../repositories/post.repository';
import {
  Accommodation,
  CreateAccommodationRequest,
  UpdateAccommodationRequest
} from "../interfaces/accommodation.interface"

const getAccommodationsByPost = async (postId: string): Promise<Accommodation[]> => {
  return await accommodationModel.findByPostId(postId);
};

const getAccommodationById = async (accommodationId: string): Promise<Accommodation | null> => {
  return await accommodationModel.findById(accommodationId);
};

const createAccommodation = async (
  postId: string,
  accommodationData: CreateAccommodationRequest
): Promise<Accommodation> => {
  if (accommodationData.rating < 1 || accommodationData.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

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
  updateData: UpdateAccommodationRequest
): Promise<Accommodation | null> => {
  const accommodation = await accommodationModel.findById(accommodationId);
  if (!accommodation) {
    return null;
  }

  const post = await postModel.findById(accommodation.post_id);
  if (updateData.rating !== undefined && (updateData.rating < 1 || updateData.rating > 5)) {
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

<!-- accomodation.repository.ts -->
import { Accommodation } from "../interfaces/accommodation.interface";
import { getConnection } from '../database';

class AccommodationModel {
  private tableName = 'accommodation';
  
  private get knex() {
    const connection = getConnection();
    if (!connection) {
      throw new Error('Database connection is undefined');
    }
    return connection.getClient!();
  }

  private async findOrCreateLocation(locationData: {
    name: string;
    country?: string;
    region?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }): Promise<string> {
    const existingLocation = await this.knex('locations')
      .where('latitude', locationData.latitude)
      .andWhere('longitude', locationData.longitude)
      .first();

    if (existingLocation) {
      return existingLocation.id;
    }

    const [newLocation] = await this.knex('locations')
      .insert({
        id: this.knex.raw('uuid_generate_v4()'),
        name: locationData.name,
        country: locationData.country || null,
        region: locationData.region || null,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timezone: locationData.timezone || 'UTC',
        created_at: this.knex.fn.now() ,
      })
      .returning('*');

    return newLocation.id;
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

  async create(accommodationData: any & { location?: any }): Promise<string> {
    let locationId = null;
    if (accommodationData.location) {
      locationId = await this.findOrCreateLocation(accommodationData.location);
    }

    const { location, ...accomFields } = accommodationData;

    const [accommodation] = await this.knex(this.tableName)
      .insert({
        ...accomFields,
        location_id: locationId,
        // created_at: this.knex.fn.now(),
      })
      .returning('id');

    return accommodation.id;
  }

  async update(id: string, updateData: any & { location?: any }): Promise<void> {
    let locationId = null;
    if (updateData.location) {
      locationId = await this.findOrCreateLocation(updateData.location);
    }

    const { location, ...updateFields } = updateData;

    await this.knex(this.tableName)
      .where('id', id)
      .update({
        ...updateFields,
        ...(locationId ? { location_id: locationId } : {}),
        updated_at: this.knex.fn.now(),
      });
  }

  async delete(id: string): Promise<boolean> {
    const deletedRows = await this.knex(this.tableName)
      .where('id', id)
      .del();

    return deletedRows > 0;
  }
}

export const accommodationModel = new AccommodationModel();