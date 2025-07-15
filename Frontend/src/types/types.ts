// types.ts
export interface Transport {
  id: string;
  transport_type: string;
  provider: string;
  cost: string;
  notes: string;
}

export interface Accommodation {
  id: string;
  accommodation_type: string;
  name: string;
  cost_per_night: string;
  rating: string;
  review: string;
  notes: string;
  amenities: Record<string, boolean>;
  check_in_date: string;
  check_out_date: string;
}

export interface Dining {
  id: string;
  restaurant_name: string;
  cuisine_type: string;
  meal_type: string;
  cost: string;
  rating: string;
  review: string;
  dishes_tried: Record<string, boolean>;
  notes: string;
  visit_date: string;
}

export interface Attraction {
  id: string;
  attraction_name: string;
  attraction_type: string;
  entry_cost: string;
  rating: string;
  review: string;
  time_spent_hours: number;
  best_time_to_visit: string;
  recommended: boolean;
  tips: string;
  notes: string;
  visit_date: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  total_cost?: number;
  duration_days?: number;
  effort_level?: number;
  user_name?: string;
  user_profile_picture?: string | null;
  created_at?: string;
}

export interface PostDetails extends Post {
  user_id: string;
  location_id?: string | null;
  is_featured: boolean;
  status: string;
  likes_count: number;
  saves_count: number;
  shares_count: number;
  updated_at: string;
  user_bio?: string | null;
  location_name?: string | null;
  location_country?: string | null;
  location_region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  media: any[];
  transport: Transport[];
  accommodation: Accommodation[];
  dining: Dining[];
  attraction: Attraction[];
}

export interface PostDetailProps {
  post: PostDetails;
  loading?: boolean;
  onClose: () => void;
}

interface TripStatus {
  id: string;
  name: 'planning' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  description?: string;
  created_at?: Date;
}

interface TravelPlan {
  id: string;
  creator_id: string;
  location_id: string;
  trip_name: string;
  start_date: Date;
  end_date: Date;
  total_budget: number;
  status_id: string;
  max_participants: number;
  created_at?: Date;
  updated_at?: Date;
  creator_name?: string;
  location_name?: string;
  status_name?: string;
  participants_count?: number;
  user_role?: 'creator' | 'participant';
  user_status?: 'invited' | 'joined' | 'declined';
}

interface TravelParticipant {
  id: string;
  trip_plan_id: string;
  user_id: string;
  role: 'creator' | 'participant';
  status: 'invited' | 'joined' | 'declined';
  joined_at?: Date;
  created_at?: Date;
  user_name?: string;
  user_email?: string;
  profile_picture?: string;
}

interface Message {
  id: string;
  trip_plan_id: string;
  sender_id: string;
  message: string;
  attachments?: any[];
  created_at?: Date;
  sender_name?: string;
  sender_profile_picture?: string;
}

interface InviteResponse {
  id: string;
  trip_name: string;
  creator_name: string;
  location_name: string;
  start_date: Date;
  end_date: Date;
  status: 'invited' | 'joined' | 'declined';
  created_at: Date;
}