import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ProfileForm from "./profileForm"; 

interface UserProfile {
  name: string;
  number: string | null;
  bio: string;
  status: string;
  profile_picture: string;
  travel_preferences: {
    budget: string;
    preferred_climate: string;
    interests: string[];
  };
  proximity_notifications_enabled: boolean;
  proximity_radius_km: number | null;
  current_latitude: number | null;
  current_longitude: number | null;
  location_updated_at: string | null;
  geom: {
    type: string;
    coordinates: number[];
  } | null;
}

interface ProfileFormState {
  name: string;
  number: string | null;
  bio: string;
  status: string;
  profile_picture: File | null;
  travel_preferences: {
    budget: string;
    preferred_climate: string;
    interests: string[];
  };
  proximity_notifications_enabled: boolean;
  proximity_radius_km: number | null;
  current_latitude: number | null;
  current_longitude: number | null;
  location_updated_at: string | null;
  geom: {
    type: string;
    coordinates: number[];
  } | null;
}

export default function EditProfile() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        setUser(response.data.data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setError("Failed to load profile data");
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (formData: ProfileFormState) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {   
      const data = new FormData();  
      data.append("name", formData.name);
      if (formData.number) data.append("number", formData.number);
      data.append("bio", formData.bio);
      data.append("status", formData.status);
      
      if (formData.profile_picture) {
        data.append("image", formData.profile_picture); 
      }

      data.append("travel_preferences[budget]", formData.travel_preferences.budget);
      data.append("travel_preferences[preferred_climate]", formData.travel_preferences.preferred_climate);
      formData.travel_preferences.interests.forEach((interest, i) => {
        data.append(`travel_preferences[interests][${i}]`, interest);
      });

      data.append("proximity_notifications_enabled", String(formData.proximity_notifications_enabled));
      if (formData.proximity_radius_km !== null) {
        data.append("proximity_radius_km", String(formData.proximity_radius_km));
      }
      
      if (formData.current_latitude !== null) {
        data.append("current_latitude", String(formData.current_latitude));
      }
      if (formData.current_longitude !== null) {
        data.append("current_longitude", String(formData.current_longitude));
      }
      if (formData.location_updated_at !== null) {
        data.append("location_updated_at", formData.location_updated_at);
      }

      const response = await api.put("/users/profile", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUser(response.data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Update error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Update Your Profile</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Profile updated successfully!
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <ProfileForm 
        initialData={user} 
        onSubmit={handleSubmit} 
        loading={loading}
      />
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Debug Info</h3>
          <details>
            <summary className="cursor-pointer text-sm">View current form data</summary>
            <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded border max-h-64">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}