import { z } from 'zod';
const mealTypes = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

const createDiningValidation = z.object({
  body: z.object({
    restaurant_name: z.string().min(1, "Restaurant name is required"),
    cuisine_type: z.string().min(1, "Cuisine type is required"),
    meal_type: mealTypes,
    cost: z.number().min(0, "Cost must be non-negative"),
    rating: z.number().min(0).max(5, "Rating must be between 0 and 5"),
    review: z.string().optional(),
    dishes_tried: z.array(z.string()).optional(),
    notes: z.string().optional(),
    visit_date: z.string().datetime("Invalid visit date format"),
  }),
});

const updateDiningValidation = z.object({
  body: z.object({
    restaurant_name: z.string().min(1, "Restaurant name is required").optional(),
    cuisine_type: z.string().min(1, "Cuisine type is required").optional(),
    meal_type: mealTypes.optional(),
    cost: z.number().min(0, "Cost must be non-negative").optional(),
    rating: z.number().min(0).max(5, "Rating must be between 0 and 5").optional(),
    review: z.string().optional(),
    dishes_tried: z.array(z.string()).optional(),
    notes: z.string().optional(),
    visit_date: z.string().datetime("Invalid visit date format").optional(),
  }),
});

export const DiningValidations = {
  createDiningValidation,
  updateDiningValidation,
};