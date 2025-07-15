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

interface Dining {
  restaurant_name: string;
  cuisine_type: string;
  meal_type: string;
  cost: number;
  rating: number;
  review: string;
  dishes_tried: {
    [key: string]: boolean;
  };
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

interface DiningDetailsProps {
  postId: string;
  onClose: () => void;
}

export default function DiningDetails({ postId, onClose }: DiningDetailsProps) {
  const [dinings, setDinings] = useState<Dining[]>([
    {
      restaurant_name: "",
      cuisine_type: "",
      meal_type: "",
      cost: 0,
      rating: 0,
      review: "",
      dishes_tried: {},
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

  const cuisineTypes = [
    "local", "italian", "chinese", "indian", "mexican", "japanese", "french", 
    "thai", "american", "mediterranean", "middle_eastern", "korean", "vietnamese", 
    "greek", "spanish", "german", "british", "fusion", "vegetarian", "vegan", "other"
  ];

  const mealTypes = ["breakfast", "brunch", "lunch", "dinner", "snack", "dessert", "drinks"];

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
    dinings[index].location = location
  };
  
  const addDining = () => {
    setDinings([...dinings, {
      restaurant_name: "",
      cuisine_type: "",
      meal_type: "",
      cost: 0,
      rating: 0,
      review: "",
      dishes_tried: {},
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

  const removeDining = (index: number) => {
    if (dinings.length > 1) {
      setDinings(dinings.filter((_, i) => i !== index));
    }
  };

  const updateDining = (index: number, field: string, value: any) => {
    const updated = dinings.map((dining, i) => {
      if (i === index) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          const parentValue = dining[parent as keyof Dining];
          return {
            ...dining,
            [parent]: {
              ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
              [child]: value
            }
          };
        }
        return { ...dining, [field]: value };
      }
      return dining;
    });
    setDinings(updated);
  };

  const addDish = (index: number, dishName: string) => {
    if (dishName.trim()) {
      const updated = dinings.map((dining, i) => {
        if (i === index) {
          return {
            ...dining,
            dishes_tried: {
              ...dining.dishes_tried,
              [dishName.trim()]: true
            }
          };
        }
        return dining;
      });
      setDinings(updated);
    }
  };

  const removeDish = (index: number, dishName: string) => {
    const updated = dinings.map((dining, i) => {
      if (i === index) {
        const newDishes = { ...dining.dishes_tried };
        delete newDishes[dishName];
        return {
          ...dining,
          dishes_tried: newDishes
        };
      }
      return dining;
    });
    setDinings(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validDinings = dinings.filter(d => 
        d.restaurant_name && d.cuisine_type && d.meal_type && d.cost > 0 && d.location.country
      );

      if (validDinings.length === 0) {
        setError("Please add at least one valid dining detail");
        setLoading(false);
        return;
      }
      for (const dining of validDinings) {
        await api.post(`/dinings/post/${postId}`, {
          post_id: postId,
          ...dining
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save dining details");
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
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                <FiCoffee className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Dining Details</h2>
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
                <h3 className="font-semibold text-emerald-800">Dining Details Saved!</h3>
                <p className="text-emerald-700 text-sm">Your dining information has been added to your post.</p>
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
              {dinings.map((dining, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-800">Dining Experience #{index + 1}</h3>
                    {dinings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDining(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Restaurant Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={dining.restaurant_name}
                          onChange={(e) => updateDining(index, 'restaurant_name', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                          placeholder="e.g., Tasty Bites"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Cuisine Type *
                        </label>
                        <select
                          required
                          value={dining.cuisine_type}
                          onChange={(e) => updateDining(index, 'cuisine_type', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select cuisine</option>
                          {cuisineTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Meal Type *
                        </label>
                        <select
                          required
                          value={dining.meal_type}
                          onChange={(e) => updateDining(index, 'meal_type', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select meal type</option>
                          {mealTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Total Cost (USD) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={dining.cost}
                          onChange={(e) => updateDining(index, 'cost', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>

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
                          value={dining.rating}
                          onChange={(e) => updateDining(index, 'rating', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                          placeholder="4.3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Visit Date
                        </label>
                        <input
                          type="date"
                          value={dining.visit_date}
                          onChange={(e) => updateDining(index, 'visit_date', e.target.value)}
                          max={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        />
                      </div>
                    </div>

                    {/* Dishes Tried */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Dishes Tried
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.keys(dining.dishes_tried).map((dish) => (
                          <span
                            key={dish}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                          >
                            {dish}
                            <button
                              type="button"
                              onClick={() => removeDish(index, dish)}
                              className="text-orange-500 hover:text-orange-700"
                            >
                              <FiX size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a dish (e.g., butter chicken)"
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              addDish(index, input.value);
                              input.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            addDish(index, input.value);
                            input.value = '';
                          }}
                          className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                        >
                          <FiPlus />
                        </button>
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
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Review
                        </label>
                        <textarea
                          rows={3}
                          value={dining.review}
                          onChange={(e) => updateDining(index, 'review', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                          placeholder="Share your dining experience..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          rows={3}
                          value={dining.notes}
                          onChange={(e) => updateDining(index, 'notes', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addDining}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-600 hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiPlus />
                Add Another Dining Experience
              </button>
            </div>

            <div className="flex gap-4 mt-8 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-2xl font-semibold text-white transition-colors ${
                  loading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save Dining Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}