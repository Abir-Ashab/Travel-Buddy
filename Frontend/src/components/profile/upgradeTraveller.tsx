import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ProfileForm from "./profileForm";

export default function UpgradeTraveler() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/profile");
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setError("Failed to load profile data");
      }
    };
    fetchUser();
  }, []);

const handleSubmit = async (data: any) => {
  setLoading(true);
  setError(null);
  try {
    const submitData = {
      ...data,
      role: "traveler",
      number: data.number || null,
      current_latitude: data.current_latitude ?? null,
      current_longitude: data.current_longitude ?? null,
      proximity_radius_km: data.proximity_radius_km ?? null,
      geom: (data.current_latitude && data.current_longitude) ? {
        type: "Point",
        coordinates: [data.current_latitude, data.current_longitude]
      } : null
    };
    await api.put("/users/profile", submitData);
    navigate("/login", { state: { success: "Successfully upgraded to Traveler!" } });
  } catch (err: any) {
    setError(err.response?.data?.message || "Upgrade failed");
  } finally {
    setLoading(false);
  }
};

return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile To Be a Traveler</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {user ? (
        <ProfileForm 
          initialData={user} 
          onSubmit={handleSubmit} 
          loading={loading}
          isUpgrade={true}
        />
      ) : (
        <p>Loading your profile...</p>
      )}
    </div>
  );
}