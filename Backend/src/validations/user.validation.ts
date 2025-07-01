import { z } from "zod";
import { USER_Role, USER_STATUS } from "../interfaces/user.interface";

const createAdminValidations = z.object({
  body: z.object({
    name: z.string(),
    role: z.nativeEnum(USER_Role).default(USER_Role.ADMIN),
    email: z.string().email(),
    password: z.string(),
    status: z.nativeEnum(USER_STATUS).default(USER_STATUS.ACTIVE),
  }),
});

const updateUserValidation = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    role: z.nativeEnum(USER_Role).optional(),
    status: z.nativeEnum(USER_STATUS).optional(),
  }),
});

const updateUserProfileValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    number: z.string().nullable().optional(),
    bio: z.string().optional(),
    status: z.string().optional(),
    role: z.string().optional(),
    profile_picture: z.string().optional(),
    travel_preferences: z.object({
      budget: z.string().optional(),
      preferred_climate: z.string().optional(),
      interests: z.array(z.string()).optional(),
    }).optional(),
    proximity_notifications_enabled: z.boolean().optional(),
    proximity_radius_km: z.number().nullable().optional(),
    current_latitude: z.number().nullable().optional(),
    current_longitude: z.number().nullable().optional(),
    location_updated_at: z.string().nullable().optional(),
    geom: z.object({
      type: z.string().optional(),
      coordinates: z.array(z.number()).optional(),
    }).nullable().optional(),
  }),
});

const changePasswordValidation = z.object({
  body: z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

export const UserValidations = {
  createAdminValidations,
  updateUserValidation,
  updateUserProfileValidation,
  changePasswordValidation,
};
