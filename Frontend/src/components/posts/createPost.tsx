import { useEffect, useState } from "react";
import api from "../../services/api";
import {FiUser, FiPlus} from "react-icons/fi";
import { useOutletContext, Link } from "react-router-dom";
import LocationSearch from "../globalFiles/locationSearch";

import { 
  FiEdit3, 
  FiMapPin, 
  FiDollarSign, 
  FiCalendar, 
  FiTrendingUp, 
  FiGlobe, 
  FiClock,
  FiNavigation,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiTruck,
  FiHome,
  FiCamera,
  FiCoffee
} from "react-icons/fi";

import TransportDetails from "./transportDetails";
import AccommodationDetails from "./accommodationDetails";
import AttractionDetails from "./attractionDetails";
import DiningDetails from "./diningDetails";

interface PostCreateProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: PostCreateProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [durationDays, setDurationDays] = useState(1);
  const [effortLevel, setEffortLevel] = useState(1);
  const [role, setRole] = useState("");
  const [id, setID] = useState("");
  const [location, setLocation] = useState({
    name: "",
    country: "",
    region: "",
    timezone: "",
    latitude: 0,
    longitude: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);
  
  // Modal states for detail components
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [showAttractionModal, setShowAttractionModal] = useState(false);
  const [showDiningModal, setShowDiningModal] = useState(false);

  const effortLevels = [
    { value: 1, label: "Very Easy", color: "bg-emerald-100 text-emerald-700", description: "Relaxing pace" },
    { value: 2, label: "Easy", color: "bg-green-100 text-green-700", description: "Comfortable journey" },
    { value: 3, label: "Moderate", color: "bg-yellow-100 text-yellow-700", description: "Some challenges" },
    { value: 4, label: "Challenging", color: "bg-orange-100 text-orange-700", description: "Demanding adventure" },
    { value: 5, label: "Extreme", color: "bg-red-100 text-red-700", description: "Expert level" }
  ];
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/profile");
        const userRole = response.data.data.role;
        const userId = response.data.data.id;
        console.log("user role: ", userRole)
        setRole(userRole)
        setID(userId)
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user information");
      }
    };

    fetchUserData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const userId = id; 
      const userRole = role;
      console.log("user role: ", userRole)
      console.log("id: ", id)
      const response = await api.post("/posts", {
        title,
        description,
        total_cost: parseFloat(totalCost),
        duration_days: durationDays,
        effort_level: effortLevel,
        status: "published",
        user_id: userId, 
        location: {
          name: location.name || title,
          country: location.country,
          region: location.region,
          timezone: location.timezone || "UTC",
          latitude: location.latitude,
          longitude: location.longitude
        }
      });

      // Store the created post ID for use in detail modals
      setCreatedPostId(response.data.data.id || response.data.id);
      setSuccess(true);
      onPostCreated();

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleLocationSelect = (lat: number, lon: number, displayName: string) => {
    // Parse the display name to extract components
    const parts = displayName.split(', ');
    const name = parts[0] || '';
    const region = parts.length > 1 ? parts[1] : '';
    const country = parts.length > 2 ? parts[parts.length - 1] : '';
    
    setLocation({
      name: name,
      country: country,
      region: region,
      timezone: 'UTC', // Default, can be updated with timezone API if needed
      latitude: lat,
      longitude: lon
    });
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTotalCost("");
    setDurationDays(1);
    setEffortLevel(1);
    setLocation({
      name: "",
      country: "",
      region: "",
      timezone: "",
      latitude: 0,
      longitude: 0
    });
    setSuccess(false);
    setCreatedPostId(null);
  };
  
  console.log("role: ", role)
  if (role === "explorer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiUser className="text-purple-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Be a Traveler To Create Posts!</h2>
            <p className="text-slate-600 mb-6">
              Upgrade your account to Traveler status to share your adventures and stories with our community.
            </p>
            <button
              className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg transition-all duration-200"
            >
              <Link to="/upgrade">
                Upgrade Account
              </Link>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Share Your Adventure
          </h1>
          <p className="text-slate-600">Tell the world about your incredible journey and inspire fellow travelers</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <FiCheck className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">Story Published!</h3>
                <p className="text-emerald-700 text-sm">Your adventure has been shared with the community.</p>
              </div>
            </div>
            
            <div className="border-t border-emerald-200 pt-4">
              <p className="text-emerald-700 text-sm mb-3 font-medium">Want to add more details to your adventure?</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setShowTransportModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors text-sm font-medium text-emerald-700"
                >
                  <FiTruck className="text-xs" />
                  Transport
                </button>
                <button
                  onClick={() => setShowAccommodationModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors text-sm font-medium text-emerald-700"
                >
                  <FiHome className="text-xs" />
                  Stay
                </button>
                <button
                  onClick={() => setShowAttractionModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors text-sm font-medium text-emerald-700"
                >
                  <FiCamera className="text-xs" />
                  Attractions
                </button>
                <button
                  onClick={() => setShowDiningModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors text-sm font-medium text-emerald-700"
                >
                  <FiCoffee className="text-xs" />
                  Dining
                </button>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                >
                  Create Another Post
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <FiAlertCircle className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Something went wrong</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FiEdit3 className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Story Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Adventure Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="e.g., Hiking the Himalayas: A Journey to Remember"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Tell Your Story
                </label>
                <textarea
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white resize-none"
                  placeholder="Describe your adventure, the challenges you faced, memorable moments, and tips for future travelers..."
                />
                <div className="mt-2 text-right text-sm text-slate-500">
                  {description.length}/500 characters
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <FiTrendingUp className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Trip Details</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  <FiDollarSign className="inline mr-1" />
                  Total Budget (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="e.g., 1250.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  <FiCalendar className="inline mr-1" />
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                <FiTrendingUp className="inline mr-1" />
                Difficulty Level
              </label>
              <div className="grid sm:grid-cols-5 gap-3">
                {effortLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setEffortLevel(level.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      effortLevel === level.value
                        ? `${level.color} border-current shadow-sm`
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg">{level.value}</div>
                      <div className="text-sm font-medium">{level.label}</div>
                      <div className="text-xs mt-1 opacity-75">{level.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                <FiMapPin className="text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Location Details</h2>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <FiMapPin className="inline mr-1" />
                    Search Location
                  </label>
                  <LocationSearch 
                    onLocationSelect={handleLocationSelect}
                    placeholder="Search for a location (e.g., Everest)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <FiGlobe className="inline mr-1" />
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={location.country}
                    onChange={(e) => setLocation({...location, country: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="e.g., Nepal"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Region
                  </label>
                  <input
                    type="text"
                    value={location.region}
                    onChange={(e) => setLocation({...location, region: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="e.g., South Asia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <FiClock className="inline mr-1" />
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={location.timezone}
                    onChange={(e) => setLocation({...location, timezone: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="e.g., Asia/Kathmandu"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <FiNavigation className="inline mr-1" />
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={location.latitude}
                    onChange={(e) => setLocation({...location, latitude: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="e.g., 27.9881"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <FiNavigation className="inline mr-1" />
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={location.longitude}
                    onChange={(e) => setLocation({...location, longitude: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="e.g., 86.9250"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-12 py-4 rounded-2xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <FiLoader className="animate-spin" />
                  <span>Publishing Your Story...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <FiCheck />
                  <span>Share My Adventure</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Conditional rendering of detail modals */}
        {showTransportModal && createdPostId && (
          <TransportDetails
            postId={createdPostId}
            onClose={() => setShowTransportModal(false)}
          />
        )}

        {showAccommodationModal && createdPostId && (
          <AccommodationDetails
            postId={createdPostId}
            onClose={() => setShowAccommodationModal(false)}
          />
        )}

        {showAttractionModal && createdPostId && (
          <AttractionDetails
            postId={createdPostId}
            onClose={() => setShowAttractionModal(false)}
          />
        )}

        {showDiningModal && createdPostId && (
          <DiningDetails
            postId={createdPostId}
            onClose={() => setShowDiningModal(false)}
          />
        )}
      </div>
    </div>
  );
}