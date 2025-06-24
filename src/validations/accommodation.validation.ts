import { z } from 'zod';
const accommodationTypes = z.enum(['hotel', 'hostel', 'airbnb', 'guesthouse']);

const createAccommodationValidation = z.object({
  body: z.object({
    accommodation_type: accommodationTypes,
    name: z.string().min(1, "Accommodation name is required"),
    cost_per_night: z.number().min(0, "Cost per night must be non-negative"),
    rating: z.number().min(0).max(5, "Rating must be between 0 and 5"),
    review: z.string().optional(),
    notes: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    check_in_date: z.string().datetime("Invalid check-in date format"),
    check_out_date: z.string().datetime("Invalid check-out date format"),
  }),
});

const updateAccommodationValidation = z.object({
  body: z.object({
    accommodation_type: accommodationTypes.optional(),
    name: z.string().min(1, "Accommodation name is required").optional(),
    cost_per_night: z.number().min(0, "Cost per night must be non-negative").optional(),
    rating: z.number().min(0).max(5, "Rating must be between 0 and 5").optional(),
    review: z.string().optional(),
    notes: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    check_in_date: z.string().datetime("Invalid check-in date format").optional(),
    check_out_date: z.string().datetime("Invalid check-out date format").optional(),
  }),
});

export const AccommodationValidations = {
  createAccommodationValidation,
  updateAccommodationValidation,
};