import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiBell, FiSave, FiArrowLeft, FiLoader } from "react-icons/fi";
import api from "../../services/api";

interface ProximitySettings {
  id?: string;
  user_id?: string;
  proximity_radius_km: number;
  enable_wishlist_alerts: boolean;
  enable_trip_participant_alerts: boolean;
  enable_featured_post_alerts: boolean;
  enable_attraction_alerts: boolean;
  enable_accommodation_alerts: boolean;
  enable_dining_alerts: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ProximitySettings() {
  const [settings, setSettings] = useState<ProximitySettings>({
    proximity_radius_km: 10,
    enable_wishlist_alerts: true,
    enable_trip_participant_alerts: true,
    enable_featured_post_alerts: true,
    enable_attraction_alerts: true,
    enable_accommodation_alerts: true,
    enable_dining_alerts: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isNewSettings, setIsNewSettings] = useState(false);
  const navigate = useNavigate();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {  
    fetchProximitySettings();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchProximitySettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/proximity/settings");
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setSettings({
          ...data,
          proximity_radius_km: parseFloat(data.proximity_radius_km) || 10
        });
        setIsNewSettings(false);
      } else {
        setIsNewSettings(true);
      }
    } catch (err: any) {
      console.error("Failed to fetch proximity settings", err);
      if (err.response?.status === 404) {
        setIsNewSettings(true);
      } else {
        setError("Failed to load proximity settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        proximity_radius_km: Number(settings.proximity_radius_km),
        enable_wishlist_alerts: settings.enable_wishlist_alerts,
        enable_trip_participant_alerts: settings.enable_trip_participant_alerts,
        enable_featured_post_alerts: settings.enable_featured_post_alerts,
        enable_attraction_alerts: settings.enable_attraction_alerts,
        enable_accommodation_alerts: settings.enable_accommodation_alerts,
        enable_dining_alerts: settings.enable_dining_alerts
      };

      console.log("Submitting payload:", payload);

      let response;
      if (isNewSettings) {
        response = await api.post("/proximity/settings", payload);
      } else {
        response = await api.put("/proximity/settings", payload);
      }

      if (response.data.success) {
        const data = response.data.data;
        setSettings({
          ...data,
          proximity_radius_km: parseFloat(data.proximity_radius_km) || 10
        });
        setIsNewSettings(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error("Update error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to update proximity settings");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProximitySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWishlistAlertsChange = (checked: boolean) => {
    handleInputChange('enable_wishlist_alerts', checked);
    // No need to call callProcessRoute here - the useEffect will handle starting/stopping the interval
  };

  const alertOptions = [
    {
      key: 'enable_wishlist_alerts',
      label: 'Wishlist Alerts',
      description: 'Get notified when someone nearby has similar wishlist items',
      icon: '💝',
      special: true 
    },
    {
      key: 'enable_trip_participant_alerts',
      label: 'Trip Participant Alerts',
      description: 'Get notified about nearby trip participants',
      icon: '👥'
    },
    {
      key: 'enable_featured_post_alerts',
      label: 'Featured Post Alerts',
      description: 'Get notified about featured posts in your area',
      icon: '⭐'
    },
    {
      key: 'enable_attraction_alerts',
      label: 'Attraction Alerts',
      description: 'Get notified about popular attractions nearby',
      icon: '🏛️'
    },
    {
      key: 'enable_accommodation_alerts',
      label: 'Accommodation Alerts',
      description: 'Get notified about accommodation recommendations',
      icon: '🏨'
    },
    {
      key: 'enable_dining_alerts',
      label: 'Dining Alerts',
      description: 'Get notified about dining recommendations nearby',
      icon: '🍽️'
    }
  ];

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-slate-600" size={32} />
          <p className="ml-4 text-slate-600">Loading proximity settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <FiArrowLeft size={20} />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FiMapPin className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Proximity Settings</h1>
            <p className="text-slate-600">
              {isNewSettings ? "Create your proximity preferences" : "Manage your proximity preferences"}
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-700 font-medium">Settings saved successfully!</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FiMapPin className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Proximity Radius</h3>
              <p className="text-sm text-slate-600">Set how far you want to be notified about nearby activities</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Radius: {settings.proximity_radius_km} km
              </label>
              <input
                type="range"
                min="1"
                max="1000"
                step="1"
                value={settings.proximity_radius_km}
                onChange={(e) => handleInputChange('proximity_radius_km', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 km</span>
                <span>50 km</span>
                <span>100 km</span>
                <span>500 km</span>
                <span>1000 km</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-xl">
              <FiBell className="text-amber-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Alert Types</h3>
              <p className="text-sm text-slate-600">Choose which types of notifications you want to receive</p>
            </div>
          </div>

          <div className="space-y-4">
            {alertOptions.map((option) => (
              <div key={option.key} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-slate-800">{option.label}</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[option.key as keyof ProximitySettings] as boolean}
                          onChange={(e) => {
                            if (option.key === 'enable_wishlist_alerts') {
                              handleWishlistAlertsChange(e.target.checked);
                            } else {
                              handleInputChange(option.key as keyof ProximitySettings, e.target.checked);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {option.description}
                      {option.key === 'enable_wishlist_alerts' && settings.enable_wishlist_alerts && (
                        <span className="block text-xs text-green-600 mt-1">
                          ✓ Auto-processing every 10 seconds
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <FiSave size={20} />
                {isNewSettings ? 'Create Settings' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Debug Info</h3>
        <details>
          <summary className="cursor-pointer text-sm">View current settings data</summary>
          <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </details>
        {settings.enable_wishlist_alerts && (
          <div className="mt-2 text-xs text-green-600">
            🟢 Wishlist processing is active (every 10 seconds)
          </div>
        )}
      </div>
    </div>
  );
}