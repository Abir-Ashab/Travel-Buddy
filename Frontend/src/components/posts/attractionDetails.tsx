import { useState } from "react";
import { FiCamera, FiPlus, FiTrash2, FiSave, FiX, FiMapPin, FiStar, FiClock } from "react-icons/fi";
import api from "../../services/api";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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

                    {/* Location Details */}
                    <div className="border-t border-slate-200 pt-6">
                      <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <FiMapPin className="text-green-600" />
                        Location Details
                      </h4>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Location Name
                          </label>
                          <input
                            type="text"
                            value={attraction.location.name}
                            onChange={(e) => updateAttraction(index, 'location.name', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="e.g., City Center"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            required
                            value={attraction.location.country}
                            onChange={(e) => updateAttraction(index, 'location.country', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="e.g., France"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Region
                          </label>
                          <input
                            type="text"
                            value={attraction.location.region}
                            onChange={(e) => updateAttraction(index, 'location.region', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="e.g., Europe"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            value={attraction.location.latitude}
                            onChange={(e) => updateAttraction(index, 'location.latitude', parseFloat(e.target.value))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="48.858844"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            value={attraction.location.longitude}
                            onChange={(e) => updateAttraction(index, 'location.longitude', parseFloat(e.target.value))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="2.294351"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Timezone
                          </label>
                          <input
                            type="text"
                            value={attraction.location.timezone}
                            onChange={(e) => updateAttraction(index, 'location.timezone', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="Europe/Paris"
                          />
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