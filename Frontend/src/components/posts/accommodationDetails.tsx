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

interface Accommodation {
  accommodation_type: string;
  name: string;
  cost_per_night: number;
  rating: number;
  check_in_date: string;
  check_out_date: string;
  location: {
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  review: string;
  notes: string;
  amenities: {
    wifi: boolean;
    pool: boolean;
    breakfast: boolean;
    parking: boolean;
  };
}

interface AccommodationDetailsProps {
  postId: string;
  onClose: () => void;
}

export default function AccommodationDetails({ postId, onClose }: AccommodationDetailsProps) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([
    {
      accommodation_type: "",
      name: "",
      cost_per_night: 0,
      rating: 0,
      check_in_date: "",
      check_out_date: "",
      location: {
        name: "",
        country: "",
        region: "",
        latitude: 0,
        longitude: 0,
        timezone: ""
      },
      review: "",
      notes: "",
      amenities: {
        wifi: false,
        pool: false,
        breakfast: false,
        parking: false
      }
    }
  ]);
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

  const accommodationTypes = [
    "hotel", "hostel", "resort", "apartment", "villa", "guesthouse", 
    "bed_and_breakfast", "camping", "motel", "homestay", "other"
  ];

  const addAccommodation = () => {
    setAccommodations([...accommodations, {
      accommodation_type: "",
      name: "",
      cost_per_night: 0,
      rating: 0,
      check_in_date: "",
      check_out_date: "",
      location: {
        name: "",
        country: "",
        region: "",
        latitude: 0,
        longitude: 0,
        timezone: ""
      },
      review: "",
      notes: "",
      amenities: {
        wifi: false,
        pool: false,
        breakfast: false,
        parking: false
      }
    }]);
  };

  const removeAccommodation = (index: number) => {
    if (accommodations.length > 1) {
      setAccommodations(accommodations.filter((_, i) => i !== index));
    }
  };

  const updateAccommodation = (index: number, field: string, value: any) => {
    const updated = accommodations.map((accommodation, i) => {
      if (i === index) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          const parentValue = accommodation[parent as keyof Accommodation];
          return {
            ...accommodation,
            [parent]: {
              ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
              [child]: value
            }
          };
        }
        return { ...accommodation, [field]: value };
      }
      return accommodation;
    });
    setAccommodations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {      
      console.log(accommodations);
      
      const validAccommodations = accommodations.filter(a => 
        a.accommodation_type && a.location.name && a.cost_per_night > 0 && a.location.country
      );

      if (validAccommodations.length === 0) {
        setError("Please add at least one valid accommodation detail");
        setLoading(false);
        return;
      }
      for (const accommodation of validAccommodations) {
        await api.post(`/accomodations/post/${postId}`, {
          post_id: postId,
          ...accommodation
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save accommodation details");
    } finally {
      setLoading(false);
    }
  };
  const handleLocationSelect = (lat: number, lon: number, displayName: string) => {
    const parts = displayName.split(', ');
    const name = parts[0] || '';
    const region = parts.length > 1 ? parts[1] : '';
    const country = parts.length > 2 ? parts[parts.length - 1] : '';
    
    setLocation({
        name: name,
        country: country,
        region: region,
        timezone: 'UTC',
        latitude: lat,
        longitude: lon
    });
    
  };

  const addLocation = (index: number) => {
    accommodations[index].location = location
  };

  return (
    <div className="fixed ml-[15%] inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                <FiHome className="text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Accommodation Details</h2>
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
                <h3 className="font-semibold text-emerald-800">Accommodation Details Saved!</h3>
                <p className="text-emerald-700 text-sm">Your accommodation information has been added to your post.</p>
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
              {accommodations.map((accommodation, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-800">Accommodation {index + 1}</h3>
                    {accommodations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAccommodation(index)}
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
                          Type *
                        </label>
                        <select
                          required
                          value={accommodation.accommodation_type}
                          onChange={(e) => updateAccommodation(index, 'accommodation_type', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select type</option>
                          {accommodationTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={accommodation.name}
                          onChange={(e) => updateAccommodation(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="e.g., Hotel Sunshine"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Cost per Night (USD) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={accommodation.cost_per_night}
                          onChange={(e) => updateAccommodation(index, 'cost_per_night', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Check-in Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={accommodation.check_in_date}
                          onChange={(e) => updateAccommodation(index, 'check_in_date', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Check-out Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={accommodation.check_out_date}
                          onChange={(e) => updateAccommodation(index, 'check_out_date', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
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
                          value={accommodation.rating}
                          onChange={(e) => updateAccommodation(index, 'rating', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="4.5"
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
                      <div>
                      <h4 className="font-semibold text-slate-800 mb-3">Amenities</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(accommodation.amenities).map(([amenity, value]) => (
                          <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => updateAccommodation(index, `amenities.${amenity}`, e.target.checked)}
                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-slate-700 capitalize">
                              {amenity === 'wifi' ? 'WiFi' : amenity}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Review and Notes */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Review
                        </label>
                        <textarea
                          rows={3}
                          value={accommodation.review}
                          onChange={(e) => updateAccommodation(index, 'review', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white resize-none"
                          placeholder="Share your experience..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          rows={3}
                          value={accommodation.notes}
                          onChange={(e) => updateAccommodation(index, 'notes', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white resize-none"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addAccommodation}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiPlus />
                Add Another Accommodation
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
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save Accommodation Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}