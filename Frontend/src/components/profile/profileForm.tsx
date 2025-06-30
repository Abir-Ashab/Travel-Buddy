import { useState } from "react";
import { FiUser, FiMapPin, FiDollarSign, FiSun, FiCamera, FiPhone, FiGlobe, FiNavigation } from "react-icons/fi";

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

const handleLocationChange = (field: 'current_latitude' | 'current_longitude', value: string) => {
  const numValue = value === '' ? null : parseFloat(value);
  
  setFormData(prev => {
    const newData = {
      ...prev,
      [field]: numValue,
      location_updated_at: new Date().toISOString()
    };
    
    // Only create geom if both coordinates exist
    if (numValue !== null) {
      newData.geom = {
        type: "Point",
        coordinates: [
          field === 'current_longitude' ? numValue : (prev.current_longitude ?? 0),
          field === 'current_latitude' ? numValue : (prev.current_latitude ?? 0)
        ]
      };
    } else {
      newData.geom = null;
    }
    
    return newData;
  });
};

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
        ...formData,
        geom: formData.current_latitude && formData.current_longitude ? {
        type: "Point",
        coordinates: [formData.current_longitude, formData.current_latitude]
        } : null
    };

    await onSubmit(submitData);
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center">
            <FiUser className="mr-2" /> Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex items-center">
            <FiPhone className="mr-2" /> Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.number ?? ''}
            onChange={(e) => setFormData({
                ...formData,
                number: e.target.value || null  // Convert empty string to null
            })}
            className="w-full p-2 border rounded"
            placeholder="+8801700000000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center">
            <FiCamera className="mr-2" /> Profile Picture URL
          </label>
          <input
            type="url"
            value={formData.profile_picture}
            onChange={(e) => setFormData({...formData, profile_picture: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="https://example.com/profile.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Account Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="active">Active</option>
            <option value="away">Away</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Bio Section */}
      <div>
        <label className="block text-sm font-medium mb-1">Bio *</label>
        <textarea
          required
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Tell us about yourself and your travel experiences..."
        />
      </div>

      {/* Location Section */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-4 flex items-center">
          <FiNavigation className="mr-2" /> Current Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={formData.current_latitude ?? ''}
              onChange={(e) => handleLocationChange('current_latitude', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="23.8103"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={formData.current_longitude ?? ''}
              onChange={(e) => handleLocationChange('current_longitude', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="90.4125"
            />
          </div>
        </div>
      </div>

      {/* Travel Preferences Section */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-4 flex items-center">
          <FiMapPin className="mr-2" /> Travel Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center">
              <FiDollarSign className="mr-2" /> Budget
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
              className="w-full p-2 border rounded"
            >
              <option value="low">Budget</option>
              <option value="medium">Mid-range</option>
              <option value="high">Luxury</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center">
              <FiSun className="mr-2" /> Preferred Climate
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
              className="w-full p-2 border rounded"
            >
              <option value="cold">Cold</option>
              <option value="cool">Cool</option>
              <option value="temperate">Temperate</option>
              <option value="warm">Warm</option>
              <option value="hot">Hot</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Interests</label>
          <div className="flex mb-2">
            <input
              type="text"
              value={currentInterest}
              onChange={(e) => setCurrentInterest(e.target.value)}
              className="flex-1 p-2 border rounded-l"
              placeholder="Add interests (e.g. hiking, beaches)"
              onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="bg-blue-500 text-white px-3 rounded-r"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.travel_preferences.interests.map((interest: string) => (
              <span key={interest} className="bg-gray-100 px-2 py-1 rounded flex items-center">
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
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-4">Notification Settings</h3>
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
              className="mr-2"
            />
            <label htmlFor="proximity-notifications">Enable Proximity Notifications</label>
          </div>
          
          {formData.proximity_notifications_enabled && (
            <div>
              <label className="block text-sm font-medium mb-1">Notification Radius (km)</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.proximity_radius_km ?? ''}
                onChange={(e) => setFormData({
                    ...formData,
                    proximity_radius_km: e.target.value ? parseInt(e.target.value) : null
                })}
                className="w-full p-2 border rounded"
                />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? 'Saving...' : isUpgrade ? 'Complete Upgrade' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}