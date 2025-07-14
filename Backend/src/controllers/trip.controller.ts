import { Request, Response } from 'express';
import { TripService } from "../services/trip.service";
import { catchAsync } from '../utils/catchAsync.util';

const createTrip = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const tripData = req.body;
  
  const trip = await TripService.createTrip(userId, tripData);

  res.status(201).json({
    success: true,
    data: trip,
    message: 'Trip created successfully'
  });
});

const getUserTrips = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await TripService.getUserTrips(userId, page, limit);

  res.json({
    success: true,
    data: result
  });
});

const getTripById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const trip = await TripService.getTripById(id, userId);

  res.json({
    success: true,
    data: trip
  });
});

const updateTrip = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const updateData = req.body;
  const trip = await TripService.updateTrip(id, userId, updateData);

  res.json({
    success: true,
    data: trip,
    message: 'Trip updated successfully'
  });
});

const deleteTrip = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const success = await TripService.deleteTrip(id, userId);

  res.json({
    success: true,
    message: 'Trip deleted successfully'
  });
});

const inviteParticipants = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const inviteData = req.body;

  await TripService.inviteParticipants(id, userId, inviteData);

  res.json({
    success: true,
    message: 'Participants invited successfully'
  });
});

const updateParticipantStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { status } = req.body;
  const success = await TripService.updateParticipantStatus(id, userId, status);

  res.json({
    success: true,
    message: `Trip invitation ${status} successfully`
  });
});

const leaveTrip = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const success = await TripService.leaveTrip(id, userId);
  res.json({
    success: true,
    message: 'Left trip successfully'
  });
});

const removeParticipant = catchAsync(async (req: Request, res: Response) => {
  const { id, participantId } = req.params;
  const userId = req.user?.id;
  const success = await TripService.removeParticipant(id, userId, participantId);

  res.json({
    success: true,
    message: 'Participant removed successfully'
  });
});

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const messageData = req.body;

  const message = await TripService.sendMessage(id, userId, messageData);

  res.status(201).json({
    success: true,
    data: message,
    message: 'Message sent successfully'
  });
});

const getTripMessages = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const messages = await TripService.getTripMessages(id, userId, page, limit);
  res.json({
    success: true,
    data: messages
  });
});

const getUserInvites = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const invites = await TripService.getUserInvites(userId);

  res.json({
    success: true,
    data: invites
  });
});

const getTripParticipants = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const participants = await TripService.getTripParticipants(id, userId);

  res.json({
    success: true,
    data: participants
  });
});

export const TripController = {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  inviteParticipants,
  updateParticipantStatus,
  leaveTrip,
  removeParticipant,
  sendMessage,
  getTripMessages,
  getUserInvites,
  getTripParticipants
};