import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import MediaDetails from "./mediaDetails"; // Import the MediaDetails component
import { 
  FiX, 
  FiUser, 
  FiDollarSign, 
  FiCalendar, 
  FiTrendingUp, 
  FiStar, 
  FiTruck, 
  FiHome, 
  FiCoffee, 
  FiMapPin,
  FiArrowLeft,
  FiLoader,
  FiImage,
  FiEdit3
} from "react-icons/fi";

interface PostDetails {
  id: string;
  title: string;
  description: string;
  total_cost?: number;
  duration_days?: number;
  effort_level?: number;
  user_name?: string;
  user_profile_picture?: string | null;
  user_id: string;
  location_id?: string | null;
  is_featured: boolean;
  status: string;
  likes_count: number;
  saves_count: number;
  shares_count: number;
  created_at?: string;
  updated_at: string;
  user_bio?: string | null;
  location_name?: string | null;
  location_country?: string | null;
  location_region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  media: any[];
  transport: Array<{
    id: string;
    transport_type: string;
    provider: string;
    cost: string;
    notes: string;
  }>;
  accommodation: Array<{
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
  }>;
  dining: Array<{
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
  }>;
  attraction: Array<{
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
  }>;
}

export default function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMediaDetails, setShowMediaDetails] = useState(false);

  async function fetchPostDetails() {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/posts/${id}/details`);
      setPost(res.data.data);
    } catch (err) {
      console.error("Failed to fetch post details", err);
      setError("Failed to load post details. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading post details...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Post</h3>
            <p className="text-red-600 mb-4">{error || "Post not found"}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Go Back
              </button>
              <button 
                onClick={fetchPostDetails}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            {post.user_profile_picture ? (
              <img
                src={post.user_profile_picture}
                alt={post.user_name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <FiUser className="text-slate-600 text-lg" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{post.title}</h1>
              <p className="text-slate-600">by {post.user_name}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-8">
            {post.media && post.media.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiImage className="text-blue-600" />
                  Media Gallery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.media.map((media, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden">
                        <img
                          src={media.image_url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-2xl flex items-center justify-center">
                        <button
                          onClick={() => window.open(media.image_url, '_blank')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-xl text-slate-700 hover:bg-slate-100"
                        >
                          <FiImage />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Overview</h2>
              <p className="text-slate-600 leading-relaxed mb-6">{post.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <FiDollarSign className="text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-700">${post.total_cost}</div>
                  <div className="text-sm text-blue-600">Total Cost</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                  <FiCalendar className="text-emerald-600 mb-2" />
                  <div className="text-2xl font-bold text-emerald-700">{post.duration_days}</div>
                  <div className="text-sm text-emerald-600">Days</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  <FiTrendingUp className="text-amber-600 mb-2" />
                  <div className="text-2xl font-bold text-amber-700">{post.effort_level}/5</div>
                  <div className="text-sm text-amber-600">Effort Level</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
                  <FiStar className="text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-700">{post.likes_count}</div>
                  <div className="text-sm text-purple-600">Likes</div>
                </div>
              </div>
            </div>

            {/* Transportation */}
            {post.transport && post.transport.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiTruck className="text-blue-600" />
                  Transportation
                </h3>
                <div className="space-y-3">
                  {post.transport.map((transport) => (
                    <div key={transport.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-800">{transport.transport_type}</h4>
                          <p className="text-slate-600 text-sm">{transport.provider}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          ${transport.cost}
                        </span>
                      </div>
                      {transport.notes && (
                        <p className="text-slate-600 text-sm">{transport.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accommodation */}
            {post.accommodation && post.accommodation.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiHome className="text-emerald-600" />
                  Accommodation
                </h3>
                <div className="space-y-3">
                  {post.accommodation.map((acc) => (
                    <div key={acc.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-800">{acc.name}</h4>
                          <p className="text-slate-600 text-sm capitalize">{acc.accommodation_type}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <FiStar className="text-yellow-500 text-sm" />
                            <span className="text-sm font-medium">{acc.rating}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                          ${acc.cost_per_night}/night
                        </span>
                      </div>
                      {acc.review && (
                        <p className="text-slate-600 text-sm mb-2">"{acc.review}"</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(acc.amenities).map(([amenity, available]) => (
                          available && (
                            <span
                              key={amenity}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs capitalize"
                            >
                              {amenity}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dining */}
            {post.dining && post.dining.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiCoffee className="text-amber-600" />
                  Dining
                </h3>
                <div className="space-y-3">
                  {post.dining.map((dining) => (
                    <div key={dining.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-800">{dining.restaurant_name}</h4>
                          <p className="text-slate-600 text-sm">{dining.cuisine_type} • {dining.meal_type}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <FiStar className="text-yellow-500 text-sm" />
                            <span className="text-sm font-medium">{dining.rating}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                          ${dining.cost}
                        </span>
                      </div>
                      {dining.review && (
                        <p className="text-slate-600 text-sm mb-2">"{dining.review}"</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(dining.dishes_tried).map(([dish, tried]) => (
                          tried && (
                            <span
                              key={dish}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs capitalize"
                            >
                              {dish}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attractions */}
            {post.attraction && post.attraction.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiMapPin className="text-purple-600" />
                  Attractions
                </h3>
                <div className="space-y-3">
                  {post.attraction.map((attraction) => (
                    <div key={attraction.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-800">{attraction.attraction_name}</h4>
                          <p className="text-slate-600 text-sm capitalize">{attraction.attraction_type}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <FiStar className="text-yellow-500 text-sm" />
                            <span className="text-sm font-medium">{attraction.rating}</span>
                            {attraction.recommended && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                Recommended
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          ${attraction.entry_cost}
                        </span>
                      </div>
                      {attraction.review && (
                        <p className="text-slate-600 text-sm mb-2">"{attraction.review}"</p>
                      )}
                      {attraction.tips && (
                        <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 mt-2">
                          <p className="text-yellow-800 text-sm"><strong>Tips:</strong> {attraction.tips}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span>⏱️ {attraction.time_spent_hours}h</span>
                        <span>🕐 Best time: {attraction.best_time_to_visit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}