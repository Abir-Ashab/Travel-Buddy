import { Request, Response } from 'express';
import { ProximityService } from "../services/proximity.service";
import {
  CreateProximitySettingsRequest,
  UpdateLocationRequest,
  GetProximityAlertsRequest
} from "../interfaces/proximity.interface";
import { catchAsync } from "../utils/catchAsync.util";

const getProximitySettings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const settings = await ProximityService.getProximitySettings(userId);
  
  res.json({
    success: true,
    data: settings
  });
});

const createProximitySettings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const settingsData: CreateProximitySettingsRequest = req.body;
  const settings = await ProximityService.createProximitySettings(userId, settingsData);

  res.status(201).json({
    success: true,
    data: settings,
    message: 'Proximity settings created successfully'
  });
});

const updateProximitySettings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const updateData: CreateProximitySettingsRequest = req.body;
  const settings = await ProximityService.updateProximitySettings(userId, updateData);

  res.json({
    success: true,
    data: settings,
    message: 'Proximity settings updated successfully'
  });
});

const updateUserLocation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const locationData: UpdateLocationRequest = req.body; 
  const location = await ProximityService.updateUserLocation(userId, locationData);

  ProximityService.processProximityAlerts(userId).catch(console.error);

  res.json({
    success: true,
    data: location,
    message: 'Location updated successfully'
  });
});

const getUserLocation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const location = await ProximityService.getUserLocation(userId);

  res.json({
    success: true,
    data: location
  });
});

const getProximityAlerts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const queryParams: GetProximityAlertsRequest = req.query;
  
  const alerts = await ProximityService.getProximityAlerts(userId, queryParams);

  res.json({
    success: true,
    data: alerts
  });
});

const getProximityHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { limit = 50, offset = 0 } = req.query;
  const history = await ProximityService.getProximityHistory(userId, Number(limit), Number(offset));

  res.json({
    success: true,
    data: history
  });
});

const deleteProximityAlert = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const success = await ProximityService.deleteProximityAlert(id, userId);

  res.json({
    success: true,
    message: 'Proximity alert deleted successfully'
  });
});

const getNearbyWishlistLocations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id; 
  const nearbyItems = await ProximityService.getNearbyWishlistLocations(userId);

  res.json({
    success: true,
    data: nearbyItems
  });
});

const getNearbyTripParticipants = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const nearbyParticipants = await ProximityService.getNearbyTripParticipants(userId);

  res.json({
    success: true,
    data: nearbyParticipants
  });
});

const getNearbyFeaturedPosts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const nearbyPosts = await ProximityService.getNearbyFeaturedPosts(userId);

  res.json({
    success: true,
    data: nearbyPosts
  });
});

const getNearbyAttractions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const nearbyAttractions = await ProximityService.getNearbyAttractions(userId);

  res.json({
    success: true,
    data: nearbyAttractions
  });
});

const getNearbyAccommodations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id; 
  const nearbyAccommodations = await ProximityService.getNearbyAccommodations(userId);

  res.json({
    success: true,
    data: nearbyAccommodations
  });
});

const getNearbyDining = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const nearbyDining = await ProximityService.getNearbyDining(userId);

  res.json({
    success: true,
    data: nearbyDining
  });
});

const processProximityAlerts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  await ProximityService.processProximityAlerts(userId);

  res.json({
    success: true,
    message: 'Proximity alerts processed successfully'
  });
});

export const ProximityController = {
  getProximitySettings,
  createProximitySettings,
  updateProximitySettings,
  updateUserLocation,
  getUserLocation,
  getProximityAlerts,
  getProximityHistory,
  deleteProximityAlert,
  getNearbyWishlistLocations,
  getNearbyTripParticipants,
  getNearbyFeaturedPosts,
  getNearbyAttractions,
  getNearbyAccommodations,
  getNearbyDining,
  processProximityAlerts
};
