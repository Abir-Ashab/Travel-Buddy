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
  geom: {
    type: string;
    coordinates: number[];
  } | null;
}

export default function EditProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Fetch user data on mount
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

  // In your ProfileUpdate component, modify the handleSubmit function:
const handleSubmit = async (formData: UserProfile) => {
  setLoading(true);
  setError(null);
  setSuccess(false);

  try {
    // Convert string numbers to actual numbers
    const current_latitude = formData.current_latitude !== null 
      ? Number(formData.current_latitude) 
      : null;
    const current_longitude = formData.current_longitude !== null 
      ? Number(formData.current_longitude) 
      : null;

    const payload = {
      ...formData,
      current_latitude,
      current_longitude,
      proximity_radius_km: formData.proximity_radius_km !== null 
        ? Number(formData.proximity_radius_km) 
        : null,
      geom: (current_latitude !== null && current_longitude !== null) 
        ? {
            type: "Point",
            coordinates: [
              Number(current_longitude), 
              Number(current_latitude)
            ]
          } 
        : null
    };

    console.log("Submitting payload:", payload);
    const response = await api.put("/users/profile", payload);
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
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Update Your Profile</h1>
      
      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Profile updated successfully!
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Profile Form */}
      <ProfileForm 
        initialData={user} 
        onSubmit={handleSubmit} 
        loading={loading}
      />
      
      {/* Debugging section (remove in production) */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Debug Info</h3>
        <details>
          <summary className="cursor-pointer text-sm">View current form data</summary>
          <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}