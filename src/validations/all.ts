import { z } from "zod";
import { USER_Role, USER_STATUS } from "../interfaces/user.interface";
import { PostStatus, ReportReason, ReportStatus } from "../interfaces/post.interface";

// ==================== USER VALIDATIONS ====================
const createUserValidation = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    role: z.nativeEnum(USER_Role).default(USER_Role.EXPLORER),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    status: z.nativeEnum(USER_STATUS).default(USER_STATUS.ACTIVE),
    passwordChangedAt: z.date().optional(),
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
    name: z.string().min(1, "Name is required").optional(),
    bio: z.string().optional(),
    travel_preferences: z.record(z.any()).optional(),
    profile_picture: z.string().url("Invalid profile picture URL").optional(),
  }),
});

const changePasswordValidation = z.object({
  body: z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

export const UserValidations = {
  createUserValidation,
  updateUserValidation,
  updateUserProfileValidation,
  changePasswordValidation,
};

// ==================== AUTH VALIDATIONS ====================
const loginValidation = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const AuthValidations = {
  loginValidation,
};

// ==================== LOCATION VALIDATIONS ====================
const createLocationValidation = z.object({
  body: z.object({
    name: z.string().min(1, "Location name is required"),
    country: z.string().min(1, "Country is required"),
    region: z.string().min(1, "Region is required"),
    latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
    timezone: z.string().min(1, "Timezone is required"),
  }),
});

const updateLocationValidation = z.object({
  body: z.object({
    name: z.string().min(1, "Location name is required").optional(),
    country: z.string().min(1, "Country is required").optional(),
    region: z.string().min(1, "Region is required").optional(),
    latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90").optional(),
    longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180").optional(),
    timezone: z.string().min(1, "Timezone is required").optional(),
  }),
});

export const LocationValidations = {
  createLocationValidation,
  updateLocationValidation,
};

// ==================== POST VALIDATIONS ====================
const createPostValidation = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    location_id: z.number().int().positive("Location ID must be a positive integer"),
    total_cost: z.number().min(0, "Total cost must be non-negative"),
    duration_days: z.number().int().positive("Duration must be at least 1 day"),
    effort_level: z.number().int().min(1).max(5, "Effort level must be between 1 and 5"),
    status: z.nativeEnum(PostStatus).optional().default(PostStatus.DRAFT),
    media_urls: z.array(z.string().url("Invalid media URL")).optional(),
  }),
});

const updatePostValidation = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    location_id: z.number().int().positive("Location ID must be a positive integer").optional(),
    total_cost: z.number().min(0, "Total cost must be non-negative").optional(),
    duration_days: z.number().int().positive("Duration must be at least 1 day").optional(),
    effort_level: z.number().int().min(1).max(5, "Effort level must be between 1 and 5").optional(),
    status: z.nativeEnum(PostStatus).optional(),
    is_featured: z.boolean().optional(),
  }),
});

const postFiltersValidation = z.object({
  query: z.object({
    location_id: z.number().int().positive().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    min_cost: z.number().min(0).optional(),
    max_cost: z.number().min(0).optional(),
    min_duration: z.number().int().positive().optional(),
    max_duration: z.number().int().positive().optional(),
    effort_level: z.number().int().min(1).max(5).optional(),
    is_featured: z.boolean().optional(),
    user_id: z.number().int().positive().optional(),
    search: z.string().optional(),
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(100).optional().default(10),
  }),
});

const reportPostValidation = z.object({
  body: z.object({
    reason: z.nativeEnum(ReportReason),
    description: z.string().optional(),
  }),
});

export const PostValidations = {
  createPostValidation,
  updatePostValidation,
  postFiltersValidation,
  reportPostValidation,
};

// ==================== ACCOMMODATION VALIDATIONS ====================
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

// ==================== ATTRACTION VALIDATIONS ====================
const attractionTypes = z.enum(['museum', 'monument', 'park', 'beach', 'temple', 'market', 'viewpoint', 'adventure']);
const bestTimeToVisit = z.enum(['morning', 'afternoon', 'evening', 'night']);

const createAttractionValidation = z.object({
  body: z.object({
    attraction_name: z.string().min(1, "Attraction name is required"),
    attraction_type: attractionTypes,
    entry_cost: z.number().min(0, "Entry cost must be non-negative"),
    rating: z.number().min(0).max(5, "Rating must be between 0 and 5"),
    review: z.string().optional(),
    time_spent_hours: z.number().min(0, "Time spent must be non-negative"),
    best_time_to_visit: bestTimeToVisit,
    recommended: z.boolean().optional().default(false),
    tips: z.string().optional(),
    notes: z.string().optional(),
    visit_date: z.string().datetime("Invalid visit date format"),
  }),
});

const updateAttractionValidation = z.object({
  body: z.object({
    attraction_name: z.string().min(1, "Attraction name is required").optional(),
    attraction_type: attractionTypes.optional(),
    entry_cost: z.number().min(0, "Entry cost must be non-negative").optional(),
    rating: z.number().min(0).max(5, "Rating must be between 0 and 5").optional(),
    review: z.string().optional(),
    time_spent_hours: z.number().min(0, "Time spent must be non-negative").optional(),
    best_time_to_visit: bestTimeToVisit.optional(),
    recommended: z.boolean().optional(),
    tips: z.string().optional(),
    notes: z.string().optional(),
    visit_date: z.string().datetime("Invalid visit date format").optional(),
  }),
});

export const AttractionValidations = {
  createAttractionValidation,
  updateAttractionValidation,
};

// ==================== DINING VALIDATIONS ====================
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

// ==================== TRANSPORT VALIDATIONS ====================
const createTransportValidation = z.object({
  body: z.object({
    transport_type: z.string().min(1, "Transport type is required"),
    provider: z.string().min(1, "Provider is required"),
    cost: z.number().min(0, "Cost must be non-negative"),
    notes: z.string().optional(),
  }),
});

const updateTransportValidation = z.object({
  body: z.object({
    transport_type: z.string().min(1, "Transport type is required").optional(),
    provider: z.string().min(1, "Provider is required").optional(),
    cost: z.number().min(0, "Cost must be non-negative").optional(),
    notes: z.string().optional(),
  }),
});

export const TransportValidations = {
  createTransportValidation,
  updateTransportValidation,
};

// ==================== WISHLIST VALIDATIONS ====================
const groupingTypes = z.enum(['region', 'theme', 'budget', 'season']);

const createWishlistValidation = z.object({
  body: z.object({
    name: z.string().min(1, "Wishlist name is required"),
    description: z.string().optional(),
    grouping_type: groupingTypes,
    is_public: z.boolean().optional().default(false),
  }),
});

const updateWishlistValidation = z.object({
  body: z.object({
    name: z.string().min(1, "Wishlist name is required").optional(),
    description: z.string().optional(),
    grouping_type: groupingTypes.optional(),
    is_public: z.boolean().optional(),
  }),
});

const createWishlistItemValidation = z.object({
  body: z.object({
    location_id: z.string().optional(),
    location: z.object({
      name: z.string().min(1, "Location name is required"),
      country: z.string().min(1, "Country is required"),
      region: z.string().min(1, "Region is required"),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      timezone: z.string().optional(),
    }).optional(),
    notes: z.string().optional(),
    estimated_budget: z.number().min(0, "Budget must be non-negative").optional(),
    priority_level: z.number().int().min(1).max(5, "Priority level must be between 1 and 5"),
    preferred_start_date: z.string().datetime("Invalid start date format").optional(),
    preferred_end_date: z.string().datetime("Invalid end date format").optional(),
  }),
});

const updateWishlistItemValidation = z.object({
  body: z.object({
    notes: z.string().optional(),
    estimated_budget: z.number().min(0, "Budget must be non-negative").optional(),
    priority_level: z.number().int().min(1).max(5, "Priority level must be between 1 and 5").optional(),
    preferred_start_date: z.string().datetime("Invalid start date format").optional(),
    preferred_end_date: z.string().datetime("Invalid end date format").optional(),
  }),
});

const wishlistFiltersValidation = z.object({
  query: z.object({
    grouping_type: groupingTypes.optional(),
    is_public: z.boolean().optional(),
    search: z.string().optional(),
    limit: z.number().int().positive().max(100).optional().default(10),
    offset: z.number().int().min(0).optional().default(0),
  }),
});

export const WishlistValidations = {
  createWishlistValidation,
  updateWishlistValidation,
  createWishlistItemValidation,
  updateWishlistItemValidation,
  wishlistFiltersValidation,
};

// ==================== TRIP VALIDATIONS ====================
const tripStatuses = z.enum(['planning', 'confirmed', 'ongoing', 'completed', 'cancelled']);
const participantRoles = z.enum(['creator', 'participant']);
const participantStatuses = z.enum(['invited', 'joined', 'declined']);

const createTripValidation = z.object({
  body: z.object({
    location_id: z.string().min(1, "Location ID is required"),
    trip_name: z.string().min(1, "Trip name is required"),
    start_date: z.string().datetime("Invalid start date format"),
    end_date: z.string().datetime("Invalid end date format"),
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
    user_ids: z.array(z.string().min(1, "User ID is required")).min(1, "At least one user ID is required"),
  }),
});

const updateParticipantStatusValidation = z.object({
  body: z.object({
    status: z.enum(['joined', 'declined']),
  }),
});

const sendMessageValidation = z.object({
  body: z.object({
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

// ==================== NOTIFICATION VALIDATIONS ====================
const notificationTypes = z.enum(['like', 'save', 'trip_invite', 'match_found', 'wishlist_share', 'proximity_alert']);

const createNotificationValidation = z.object({
  body: z.object({
    user_id: z.string().min(1, "User ID is required"),
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    type: notificationTypes,
    metadata: z.record(z.any()).optional(),
  }),
});

const updateNotificationValidation = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").optional(),
    message: z.string().min(1, "Message is required").optional(),
    type: notificationTypes.optional(),
    metadata: z.record(z.any()).optional(),
    is_read: z.boolean().optional(),
  }),
});

export const NotificationValidations = {
  createNotificationValidation,
  updateNotificationValidation,
};

// ==================== PROXIMITY VALIDATIONS ====================
const triggerTypes = z.enum(['wishlist_location', 'trip_participant', 'featured_post', 'attraction', 'accommodation', 'dining']);

const createProximitySettingsValidation = z.object({
  body: z.object({
    proximity_radius_km: z.number().min(0.1).max(100, "Radius must be between 0.1 and 100 km").optional(),
    enable_wishlist_alerts: z.boolean().optional(),
    enable_trip_participant_alerts: z.boolean().optional(),
    enable_featured_post_alerts: z.boolean().optional(),
    enable_attraction_alerts: z.boolean().optional(),
    enable_accommodation_alerts: z.boolean().optional(),
    enable_dining_alerts: z.boolean().optional(),
  }),
});

const updateLocationValidation2 = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  }),
});

const getProximityAlertsValidation = z.object({
  query: z.object({
    trigger_type: triggerTypes.optional(),
    limit: z.number().int().positive().max(100).optional().default(10),
    offset: z.number().int().min(0).optional().default(0),
  }),
});

export const ProximityValidations = {
  createProximitySettingsValidation,
  updateLocationValidation: updateLocationValidation2,
  getProximityAlertsValidation,
};

// ==================== COMMON VALIDATIONS ====================
const paginationValidation = z.object({
  query: z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(100).optional().default(10),
    sort_by: z.string().optional(),
    sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

const searchValidation = z.object({
  query: z.object({
    query: z.string().min(1, "Search query is required"),
    filters: z.record(z.any()).optional(),
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(100).optional().default(10),
    sort_by: z.string().optional(),
    sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const CommonValidations = {
  paginationValidation,
  searchValidation,
};

// ==================== PARAM VALIDATIONS ====================
const mongoIdValidation = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});

const numericIdValidation = z.object({
  params: z.object({
    id: z.number().int().positive("ID must be a positive integer"),
  }),
});

export const ParamValidations = {
  mongoIdValidation,
  numericIdValidation,
};