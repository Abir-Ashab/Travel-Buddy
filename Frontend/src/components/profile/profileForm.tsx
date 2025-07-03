import { useState } from "react";
import { FiUser, FiMapPin, FiDollarSign, FiSun, FiCamera, FiPhone, FiNavigation } from "react-icons/fi";
import LocationSearch from "../globalFiles/locationSearch";

interface TravelPreferences {
  budget: string;
  preferred_climate: string;
  interests: string[];
}

interface Geom {
  type: string;
  coordinates: number[];
}

interface ProfileFormState {
  name: string;
  number: string | null;
  bio: string;
  status: string;
  profile_picture: string;
  travel_preferences: TravelPreferences;
  proximity_notifications_enabled: boolean;
  proximity_radius_km: number | null;
  current_latitude: number | null;
  current_longitude: number | null;
  location_updated_at: string | null;
  geom: Geom | null;
}

interface ProfileFormProps {
  initialData?: Partial<ProfileFormState>;
  onSubmit: (data: ProfileFormState) => Promise<void>;
  loading: boolean;
  isUpgrade?: boolean;
}

export default function ProfileForm({ 
  initialData = {}, 
  onSubmit, 
  loading,
  isUpgrade = false 
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormState>({
    name: initialData?.name || '',
    number: initialData?.number ?? null,
    bio: initialData?.bio || '',
    status: initialData?.status || 'active',
    profile_picture: initialData?.profile_picture || '',
    travel_preferences: {
      budget: initialData?.travel_preferences?.budget || 'medium',
      preferred_climate: initialData?.travel_preferences?.preferred_climate || 'temperate',
      interests: initialData?.travel_preferences?.interests || []
    },
    proximity_notifications_enabled: initialData?.proximity_notifications_enabled ?? true,
    proximity_radius_km: initialData?.proximity_radius_km ?? null,
    current_latitude: initialData?.current_latitude ?? null,
    current_longitude: initialData?.current_longitude ?? null,
    location_updated_at: initialData?.location_updated_at ?? null,
    geom: initialData?.geom ?? null
  });

  const [currentInterest, setCurrentInterest] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);

  const handleAddInterest = () => {
    if (currentInterest && !formData.travel_preferences.interests.includes(currentInterest)) {
      setFormData({
        ...formData,
        travel_preferences: {
          ...formData.travel_preferences,
          interests: [...formData.travel_preferences.interests, currentInterest]
        }
      });
      setCurrentInterest('');
    }
  };

  // Handle location selection from search
  const handleLocationSelect = (latitude: number, longitude: number, displayName: string) => {
    setFormData(prev => ({
      ...prev,
      current_latitude: latitude,
      current_longitude: longitude,
      location_updated_at: new Date().toISOString(),
      geom: {
        type: "Point",
        coordinates: [longitude, latitude]
      }
    }));
  };

  // Manual location change (for fallback)
  const handleLocationChange = (field: 'current_latitude' | 'current_longitude', value: string) => {
    const numValue = value === '' ? null : Number(value);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: numValue,
        location_updated_at: new Date().toISOString()
      };
      
      if (typeof newData.current_latitude === 'number' && 
          typeof newData.current_longitude === 'number') {
        newData.geom = {
          type: "Point",
          coordinates: [newData.current_longitude, newData.current_latitude]
        };
      } else {
        newData.geom = null;
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: ProfileFormState = {
      ...formData,
      travel_preferences: {
        budget: formData.travel_preferences.budget || 'medium',
        preferred_climate: formData.travel_preferences.preferred_climate || 'temperate',
        interests: formData.travel_preferences.interests || []
      },
      geom: (formData.current_latitude !== null && formData.current_longitude !== null) 
        ? {
            type: "Point",
            coordinates: [formData.current_longitude, formData.current_latitude]
          }
        : null
    };

    await onSubmit(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isUpgrade ? 'Complete Your Profile' : 'Edit Profile'}
          </h2>
          <p className="text-gray-600">Fill in your details to connect with fellow travelers</p>
        </div>

        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiUser className="mr-2" /> Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FiUser className="mr-2 text-gray-500" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FiPhone className="mr-2 text-gray-500" /> Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.number ?? ''}
                onChange={(e) => setFormData({
                    ...formData,
                    number: e.target.value || null
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="+8801700000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FiCamera className="mr-2 text-gray-500" /> Profile Picture URL
              </label>
              <input
                type="url"
                value={formData.profile_picture}
                onChange={(e) => setFormData({...formData, profile_picture: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="active">Active</option>
                <option value="away">Away</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Bio *</label>
            <textarea
              required
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={4}
              placeholder="Tell us about yourself and your travel experiences..."
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiNavigation className="mr-2" /> Current Location
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Search for your location
            </label>
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              placeholder="Search location (e.g., Kacchi Bhai, Dhanmondi)"
              className="w-full"
            />
          </div>
          {formData.current_latitude !== null && formData.current_longitude !== null && (
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Current Coordinates:</span>
                <button
                  type="button"
                  onClick={() => setShowManualLocation(!showManualLocation)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showManualLocation ? 'Hide Manual Entry' : 'Edit Manually'}
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <p>Latitude: {Number(formData.current_latitude).toFixed(6)}</p>
                <p>Longitude: {Number(formData.current_longitude).toFixed(6)}</p>
              </div>
            </div>
          )}

          {showManualLocation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.current_latitude ?? ''}
                  onChange={(e) => handleLocationChange('current_latitude', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="23.8103"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.current_longitude ?? ''}
                  onChange={(e) => handleLocationChange('current_longitude', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="90.4125"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiMapPin className="mr-2" /> Travel Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FiDollarSign className="mr-2 text-gray-500" /> Budget
              </label>
              <select
                value={formData.travel_preferences.budget}
                onChange={(e) => setFormData({
                  ...formData,
                  travel_preferences: {
                    ...formData.travel_preferences,
                    budget: e.target.value
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="low">Budget</option>
                <option value="medium">Mid-range</option>
                <option value="high">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FiSun className="mr-2 text-gray-500" /> Preferred Climate
              </label>
              <select
                value={formData.travel_preferences.preferred_climate}
                onChange={(e) => setFormData({
                  ...formData,
                  travel_preferences: {
                    ...formData.travel_preferences,
                    preferred_climate: e.target.value
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="cold">Cold</option>
                <option value="cool">Cool</option>
                <option value="temperate">Temperate</option>
                <option value="warm">Warm</option>
                <option value="hot">Hot</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Interests</label>
            <div className="flex mb-3">
              <input
                type="text"
                value={currentInterest}
                onChange={(e) => setCurrentInterest(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Add interests (e.g. hiking, beaches)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="bg-blue-500 text-white px-6 rounded-r-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.travel_preferences.interests.map((interest: string) => (
                <span 
                  key={interest} 
                  className="bg-white border border-gray-300 px-3 py-1 rounded-full flex items-center text-sm shadow-sm"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      travel_preferences: {
                        ...formData.travel_preferences,
                        interests: formData.travel_preferences.interests.filter((i: string) => i !== interest)
                      }
                    })}
                    className="ml-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="proximity-notifications"
                checked={formData.proximity_notifications_enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  proximity_notifications_enabled: e.target.checked
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="proximity-notifications" className="ml-3 text-sm font-medium text-gray-700">
                Enable Proximity Notifications
              </label>
            </div>
            
            {formData.proximity_notifications_enabled && (
              <div>
                <label className="block text-sm font-medium mb-2">Notification Radius (km)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.proximity_radius_km ?? ''}
                  onChange={(e) => setFormData({
                      ...formData,
                      proximity_radius_km: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter radius in kilometers"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : (
              isUpgrade ? 'Complete Upgrade' : 'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}