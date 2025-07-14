import { tripModel } from "../repositories/trip.repository";
import { notificationModel } from "../repositories/notification.repository";
import { userModel } from "../repositories/user.repository";
import {
  TravelPlan,
  TravelParticipant,
  Message,
  CreateTripRequest,
  UpdateTripRequest,
  InviteParticipantsRequest,
  SendMessageRequest,
  TripListResponse,
  TripDetailsResponse,
  InviteResponse
} from "../interfaces/trip.interface";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { ValidationError } from "../errors/validationError";

const validateUserId = (userId: string): void => {
  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }
};

const validateDates = (startDate: Date, endDate: Date): void => {
  const today = new Date();
  
  if (startDate <= today) {
    throw new Error('Start date must be in the future');
  }
  
  if (endDate <= startDate) {
    throw new Error('End date must be after start date');
  }
};

const validateTripDates = (startDateStr: string, endDateStr: string): void => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  validateDates(startDate, endDate);
};

const validateBudget = (budget: number | undefined): void => {
  if (budget !== undefined && budget <= 0) {
    throw new Error('Total budget must be greater than 0');
  }
};

const validateMaxParticipants = (maxParticipants: number | undefined): void => {
  if (maxParticipants !== undefined && maxParticipants < 1) {
    throw new Error('Maximum participants must be at least 1');
  }
};

const validateParticipantStatus = (status: string): void => {
  if (!status || !['joined', 'declined'].includes(status)) {
    throw new ForbiddenError("Valid status (joined or declined) is required");
  }
};

const validateMessage = (message: string): void => {
  if (!message.trim()) {
    throw new ValidationError('Message cannot be empty');
  }
};

const validateInviteData = (inviteData: InviteParticipantsRequest): void => {
  if (!inviteData.user_ids || !Array.isArray(inviteData.user_ids) || inviteData.user_ids.length === 0) {
    throw new NotFoundError("user_ids array is required and cannot be empty");
  }
};

const validateCreateTripData = (tripData: CreateTripRequest): void => {
  validateTripDates(tripData.start_date, tripData.end_date);
  validateBudget(tripData.total_budget);
  validateMaxParticipants(tripData.max_participants);
};

const validateUpdateTripData = (updateData: UpdateTripRequest, existingTrip: TravelPlan): void => {
  if (updateData.start_date || updateData.end_date) {
    const startDate = updateData.start_date ? new Date(updateData.start_date) : existingTrip.start_date;
    const endDate = updateData.end_date ? new Date(updateData.end_date) : existingTrip.end_date;
    
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
  }

  validateBudget(updateData.total_budget);
  validateMaxParticipants(updateData.max_participants);
};

const validateMaxParticipantsUpdate = async (tripId: string, maxParticipants: number): Promise<void> => {
  const currentCount = await tripModel.getParticipantCount(tripId);
  if (maxParticipants < currentCount) {
    throw new Error('Cannot reduce max participants below current participant count');
  }
};

const validateInviteCapacity = async (tripId: string, userIds: string[], trip: TravelPlan): Promise<void> => {
  const currentCount = await tripModel.getParticipantCount(tripId);
  const newTotalCount = currentCount + userIds.length;

  if (newTotalCount > trip.max_participants) {
    throw new Error(
      `Cannot invite ${userIds.length} users. Would exceed maximum participants limit.`
    );
  }
};

const validateNewParticipants = async (tripId: string, userIds: string[]): Promise<string[]> => {
  const existingParticipants = await tripModel.getParticipants(tripId);
  const existingUserIds = existingParticipants.map(p => p.user_id.toString());
  const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

  if (newUserIds.length === 0) {
    throw new Error('All specified users are already participants');
  }

  return newUserIds;
};

const createTrip = async (
  userId: string,
  tripData: CreateTripRequest
): Promise<TravelPlan> => {
  validateUserId(userId);
  validateCreateTripData(tripData);

  const planningStatus = await tripModel.getStatusByName('planning');
  if (!planningStatus) {
    throw new Error('Planning status not found');
  }

  const tripId = await tripModel.create({
    creator_id: userId,
    location: tripData.location,
    trip_name: tripData.trip_name,
    start_date: new Date(tripData.start_date),
    end_date: new Date(tripData.end_date),
    total_budget: tripData.total_budget,
    status_id: planningStatus.id,
    max_participants: tripData.max_participants
  });

  await tripModel.addParticipants(tripId, [userId]);
  await tripModel.updateParticipantStatus(tripId, userId, 'joined');
  await tripModel.updateParticipantRole(tripId, userId, 'creator');

  const createdTrip = await tripModel.findById(tripId);
  if (!createdTrip) {
    throw new Error('Trip not found after creation');
  }
  
  return createdTrip;
};

const getUserTrips = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<TripListResponse> => {
  validateUserId(userId);
  const result = await tripModel.findByUserId(userId, page, limit);
  
  return {
    trips: result.trips,
    total: result.total,
    page,
    limit
  };
};

const getTripById = async (
  tripId: string,
  userId: string
): Promise<TripDetailsResponse | null> => {
  validateUserId(userId);
  const trip = await tripModel.findById(tripId);
  if (!trip) {
    throw new NotFoundError("Trip not found")
  }

  const isParticipant = await tripModel.isUserParticipant(tripId, userId);
  if (!isParticipant) {
    throw new UnauthorizedError('Unauthorized access to trip');
  }

  const participants = await tripModel.getParticipants(tripId);
  const recentMessages = await tripModel.getMessages(tripId, 1, 10);

  return {
    ...trip,
    participants,
    recent_messages: recentMessages
  };
};

const updateTrip = async (
  tripId: string,
  userId: string,
  updateData: UpdateTripRequest
): Promise<TravelPlan | null> => {
  validateUserId(userId);
  const isCreator = await tripModel.isUserCreator(tripId, userId);
  if (!isCreator) {
    throw new Error('Only trip creator can update trip details');
  }

  const trip = await tripModel.findById(tripId);
  if (!trip) {
    throw new NotFoundError("Trip not found")
  }

  validateUpdateTripData(updateData, trip);

  if (updateData.max_participants !== undefined) {
    await validateMaxParticipantsUpdate(tripId, updateData.max_participants);
  }

  await tripModel.update(tripId, updateData);
  return await tripModel.findById(tripId);
};

const deleteTrip = async (tripId: string, userId: string): Promise<boolean> => {
  validateUserId(userId);
  const isCreator = await tripModel.isUserCreator(tripId, userId);
  if (!isCreator) {
    throw new Error('Only trip creator can delete the trip');
  }

  return await tripModel.delete(tripId);
};

const inviteParticipants = async (
  tripId: string,
  userId: string,
  inviteData: InviteParticipantsRequest
): Promise<{ message: string; invited_count: number }> => {
  validateUserId(userId);
  validateInviteData(inviteData);

  const isCreator = await tripModel.isUserCreator(tripId, userId);
  if (!isCreator) {
    throw new Error('Only trip creator can invite participants');
  }

  const trip = await tripModel.findById(tripId);
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }

  await validateInviteCapacity(tripId, inviteData.user_ids, trip);
  const newUserIds = await validateNewParticipants(tripId, inviteData.user_ids);

  await tripModel.addParticipants(tripId, newUserIds);

  for (const invitedUserId of newUserIds) {
    if (invitedUserId.toString() === userId.toString()) {
      continue; 
    }

    try {
      const inviter = await userModel.findById(userId);

      await notificationModel.create({
        user_id: invitedUserId,
        title: 'Trip Invitation!',
        message: `${inviter.name || 'Someone'} invited you to join the trip"`,
        type: 'trip_invite',
        metadata: {
          trip_id: tripId,
          inviter_id: userId,
          inviter_name: inviter.name || 'Unknown',
        },
      });
    } catch (notificationError) {
      console.error(`Failed to create invitation notification for user ${invitedUserId}:`, notificationError);
    }
  }

  return {
    message: 'Participants invited successfully',
    invited_count: newUserIds.length
  };
};

const updateParticipantStatus = async (
  tripId: string,
  userId: string,
  status: 'joined' | 'declined'
): Promise<boolean> => {
  validateUserId(userId);
  validateParticipantStatus(status);

  const isParticipant = await tripModel.isUserParticipant(tripId, userId);
  if (!isParticipant) {
    throw new Error('User is not invited to this trip');
  }

  return await tripModel.updateParticipantStatus(tripId, userId, status);
};

const leaveTrip = async (tripId: string, userId: string): Promise<boolean> => {
  const isCreator = await tripModel.isUserCreator(tripId, userId);
  if (isCreator) {
    throw new Error('Trip creator cannot leave the trip. Transfer ownership or delete the trip instead.');
  }

  const trip = await tripModel.removeParticipant(tripId, userId);
  if (!trip) {
    throw new NotFoundError("Trip not found or user not a participant")
  }
  return trip;
};

const removeParticipant = async (
  tripId: string,
  creatorId: string,
  participantId: string
): Promise<boolean> => {
  const isCreator = await tripModel.isUserCreator(tripId, creatorId);
  if (!isCreator) {
    throw new Error('Only trip creator can remove participants');
  }
  const isParticipantCreator = await tripModel.isUserCreator(tripId, participantId);
  if (isParticipantCreator) {
    throw new Error('Cannot remove trip creator');
  }

  return await tripModel.removeParticipant(tripId, participantId);
};

const sendMessage = async (
  tripId: string,
  userId: string,
  messageData: SendMessageRequest
): Promise<Message> => {
  validateUserId(userId);
  const isParticipant = await tripModel.isUserParticipant(tripId, userId);
  if (!isParticipant) {
    throw new Error('Only trip participants can send messages');
  }

  validateMessage(messageData.message);

  const messageId = await tripModel.createMessage({
    trip_plan_id: tripId,
    sender_id: userId,
    message: messageData.message.trim(),
    attachments: messageData.attachments || null
  });

  const messages = await tripModel.getMessages(tripId, 1, 1);
  return messages[0];
};

const getTripMessages = async (
  tripId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<Message[]> => {
  validateUserId(userId);
  const isParticipant = await tripModel.isUserParticipant(tripId, userId);
  if (!isParticipant) {
    throw new Error('Only trip participants can view messages');
  }

  return await tripModel.getMessages(tripId, page, limit);
};

const getUserInvites = async (userId: string): Promise<InviteResponse[]> => {
  return await tripModel.getUserInvites(userId);
};

const getTripParticipants = async (
  tripId: string,
  userId: string
): Promise<TravelParticipant[]> => {
  validateUserId(userId);
  const isParticipant = await tripModel.isUserParticipant(tripId, userId);
  if (!isParticipant) {
    throw new Error('Only trip participants can view participant list');
  }

  return await tripModel.getParticipants(tripId);
};

export const TripService = {
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