import { z } from 'zod';
const tripStatuses = z.enum(['planning', 'confirmed', 'ongoing', 'completed', 'cancelled']);
const participantRoles = z.enum(['creator', 'participant']);
const participantStatuses = z.enum(['invited', 'joined', 'declined']);

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  country: z.string().optional(),
  region: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().optional(),
});

const createTripValidation = z.object({
  body: z.object({
    location: locationSchema.optional(), 
    trip_name: z.string().min(1, "Trip name is required"),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format").optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional(),
    total_budget: z.number().min(0, "Budget must be non-negative"),
    max_participants: z.number().int().min(1, "Must allow at least 1 participant"),
  }),
});

const updateTripValidation = z.object({
  body: z.object({
    trip_name: z.string().min(1, "Trip name is required").optional(),
    start_date: z.string().datetime("Invalid start date format").optional(),
    end_date: z.string().datetime("Invalid end date format").optional(),
    total_budget: z.number().min(0, "Budget must be non-negative").optional(),
    max_participants: z.number().int().min(1, "Must allow at least 1 participant").optional(),
    status_id: z.string().optional(),
  }),
});

const inviteParticipantsValidation = z.object({
  body: z.object({
    user_id: z.string().min(1, "User ID is required"),
    user_ids: z.array(z.string().min(1, "User ID is required")).min(1, "At least one user ID is required"),
  }),
});

const updateParticipantStatusValidation = z.object({
  body: z.object({
    user_id: z.string().min(1, "User ID is required"),
    status: z.enum(['joined', 'declined']),
  }),
});

const sendMessageValidation = z.object({
  body: z.object({
    user_id: z.string().min(1, "User ID is required"),
    message: z.string().min(1, "Message is required"),
    attachments: z.array(z.any()).optional(),
  }),
});

export const TripValidations = {
  createTripValidation,
  updateTripValidation,
  inviteParticipantsValidation,
  updateParticipantStatusValidation,
  sendMessageValidation,
};
