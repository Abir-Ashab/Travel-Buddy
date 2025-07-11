import { useState } from "react";
import { FiHome, FiPlus, FiTrash2, FiSave, FiX, FiMapPin, FiStar } from "react-icons/fi";
import api from "../../services/api";
import LocationSearch from "../globalFiles/locationSearch";
import { 
  FiEdit3, 
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
  FiCamera,
  FiCoffee,
  FiImage
} from "react-icons/fi";

interface Attraction {
  attraction_name: string;
  attraction_type: string;
  entry_cost: number;
  rating: number;
  review: string;
  time_spent_hours: number;
  best_time_to_visit: string;
  recommended: boolean;
  tips: string;
  notes: string;
  visit_date: string;
  location: {
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

interface AttractionDetailsProps {
  postId: string;
  onClose: () => void;
}

export default function AttractionDetails({ postId, onClose }: AttractionDetailsProps) {
  const [attractions, setAttractions] = useState<Attraction[]>([
    {
      attraction_name: "",
      attraction_type: "",
      entry_cost: 0,
      rating: 0,
      review: "",
      time_spent_hours: 0,
      best_time_to_visit: "",
      recommended: false,
      tips: "",
      notes: "",
      visit_date: "",
      location: {
        name: "",
        country: "",
        region: "",
        latitude: 0,
        longitude: 0,
        timezone: ""
      }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const attractionTypes = [
    "museum", "monument", "park", "beach", "mountain", "temple", "church", 
    "palace", "castle", "zoo", "aquarium", "garden", "market", "viewpoint", 
    "waterfall", "lake", "historical_site", "cultural_site", "shopping", 
    "entertainment", "adventure", "nature", "landmark", "other"
  ];

  const bestTimes = [
    "morning", "afternoon", "evening", "night", "sunrise", "sunset", 
    "weekday", "weekend", "early_morning", "late_evening", "anytime"
  ];
  const [location, setLocation] = useState({
    name: "",
    country: "",
    region: "",
    timezone: "",
    latitude: 0,
    longitude: 0
  });
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
  const addLocation = (index: number) => {
    attractions[index].location = location
  };
  const addAttraction = () => {
    setAttractions([...attractions, {
      attraction_name: "",
      attraction_type: "",
      entry_cost: 0,
      rating: 0,
      review: "",
      time_spent_hours: 0,
      best_time_to_visit: "",
      recommended: false,
      tips: "",
      notes: "",
      visit_date: "",
      location: {
        name: "",
        country: "",
        region: "",
        latitude: 0,
        longitude: 0,
        timezone: ""
      }
    }]);
  };

  const removeAttraction = (index: number) => {
    if (attractions.length > 1) {
      setAttractions(attractions.filter((_, i) => i !== index));
    }
  };

  const updateAttraction = (index: number, field: string, value: any) => {
    const updated = attractions.map((attraction, i) => {
      if (i === index) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          const parentValue = attraction[parent as keyof Attraction];
          return {
            ...attraction,
            [parent]: {
              ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
              [child]: value
            }
          };
        }
        return { ...attraction, [field]: value };
      }
      return attraction;
    });
    setAttractions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty attractions
      const validAttractions = attractions.filter(a => 
        a.attraction_name && a.attraction_type && a.location.country
      );

      if (validAttractions.length === 0) {
        setError("Please add at least one valid attraction detail");
        setLoading(false);
        return;
      }

      // Submit each attraction
      for (const attraction of validAttractions) {
        await api.post(`/attractions/post/${postId}`, {
          post_id: postId,
          ...attraction
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save attraction details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed ml-[15%] inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                <FiCamera className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Attraction Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <FiX className="text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <FiSave className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">Attraction Details Saved!</h3>
                <p className="text-emerald-700 text-sm">Your attraction information has been added to your post.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {attractions.map((attraction, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-800">Attraction #{index + 1}</h3>
                    {attractions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttraction(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Attraction Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={attraction.attraction_name}
                          onChange={(e) => updateAttraction(index, 'attraction_name', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="e.g., Eiffel Tower"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Attraction Type *
                        </label>
                        <select
                          required
                          value={attraction.attraction_type}
                          onChange={(e) => updateAttraction(index, 'attraction_type', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="">Select type</option>
                          {attractionTypes.map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Entry Cost (USD)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={attraction.entry_cost}
                          onChange={(e) => updateAttraction(index, 'entry_cost', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Rating and Time */}
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          <FiStar className="inline mr-1" />
                          Rating (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={attraction.rating}
                          onChange={(e) => updateAttraction(index, 'rating', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="4.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          <FiClock className="inline mr-1" />
                          Time Spent (Hours)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={attraction.time_spent_hours}
                          onChange={(e) => updateAttraction(index, 'time_spent_hours', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Best Time to Visit
                        </label>
                        <select
                          value={attraction.best_time_to_visit}
                          onChange={(e) => updateAttraction(index, 'best_time_to_visit', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="">Select time</option>
                          {bestTimes.map(time => (
                            <option key={time} value={time}>
                              {time.charAt(0).toUpperCase() + time.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Visit Date
                        </label>
                        <input
                          type="date"
                          value={attraction.visit_date}
                          onChange={(e) => updateAttraction(index, 'visit_date', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        />
                      </div>
                    </div>

                    {/* Recommended */}
                    <div>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={attraction.recommended}
                          onChange={(e) => updateAttraction(index, 'recommended', e.target.checked)}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          Would you recommend this attraction?
                        </span>
                      </label>
                    </div>

                    {/* Review */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        rows={3}
                        value={attraction.review}
                        onChange={(e) => updateAttraction(index, 'review', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                        placeholder="Share your experience at this attraction..."
                      />
                    </div>

                    {/* Tips and Notes */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Tips for Other Travelers
                        </label>
                        <textarea
                          rows={3}
                          value={attraction.tips}
                          onChange={(e) => updateAttraction(index, 'tips', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                          placeholder="Any helpful tips or advice..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Additional Notes
                        </label>
                        <textarea
                          rows={3}
                          value={attraction.notes}
                          onChange={(e) => updateAttraction(index, 'notes', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                          placeholder="Any other notes or observations..."
                        />
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
                            <div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                  <FiMapPin className="inline mr-1" />
                                  Search Location
                                  </label>
                                  <LocationSearch 
                                  onLocationSelect={handleLocationSelect}
                                  placeholder="Search for a location (e.g., Everest Base Camp, Nepal)"
                                  />
                                  {(() => {
                                      addLocation(index);
                                      return null; 
                                  })()}
                              </div>
                            </div>
              
                            <div >
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                  <FiGlobe className="inline mr-1" />
                                  Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={location.name}
                                  onChange={(e) => setLocation({...location, name: e.target.value})}
                                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                                  placeholder="e.g., hotel sunshine"
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
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addAttraction}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold transition-colors flex items-center gap-2"
                >
                  <FiPlus />
                  Add Another Attraction
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-2xl font-semibold text-white transition-all duration-200 ${
                  loading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiSave />
                    Save Attraction Details
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}