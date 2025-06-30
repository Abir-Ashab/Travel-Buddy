import { useState } from "react";
import api from "../../services/api";

interface PostCreateProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: PostCreateProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [durationDays, setDurationDays] = useState(1);
  const [effortLevel, setEffortLevel] = useState(1);
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

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const userRes = await api.get("/users/profile");
    const userId = userRes.data.data.id; 

    await api.post("/posts", {
      title,
      description,
      total_cost: parseFloat(totalCost),
      duration_days: durationDays,
      effort_level: effortLevel,
      status: "published",
      user_id: userId, 
      location: {
        name: location.name || title,
        country: location.country,
        region: location.region,
        timezone: location.timezone || "UTC",
        latitude: location.latitude,
        longitude: location.longitude
      }
    });
  } catch (err: any) {
    setError(err.response?.data?.message || "Failed to create post");
  } finally {
    setLoading(false);
  }
}

  return (
    <form onSubmit={handleSubmit} className="max-w-xl p-6 bg-white rounded shadow mb-8">
      <h3 className="text-xl font-semibold mb-4">Create New Post</h3>

      <label className="block mb-2">
        Title
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          placeholder="Post title"
        />
      </label>

      <label className="block mb-2">
        Description
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          placeholder="Post description"
        />
      </label>

      <label className="block mb-2">
        Total Cost (USD)
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={totalCost}
          onChange={(e) => setTotalCost(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          placeholder="e.g. 450.75"
        />
      </label>

      <label className="block mb-2">
        Duration (days)
        <input
          type="number"
          min="1"
          max="365"
          required
          value={durationDays}
          onChange={(e) => setDurationDays(parseInt(e.target.value))}
          className="w-full mt-1 p-2 border rounded"
        />
      </label>

      <label className="block mb-2">
        Effort Level (1-5)
        <input
          type="number"
          min="1"
          max="5"
          required
          value={effortLevel}
          onChange={(e) => setEffortLevel(parseInt(e.target.value))}
          className="w-full mt-1 p-2 border rounded"
        />
      </label>

      <div className="mb-4 border-t pt-4">
        <h4 className="font-medium mb-2">Location Details</h4>
        
        <label className="block mb-2">
          Location Name
          <input
            type="text"
            value={location.name}
            onChange={(e) => setLocation({...location, name: e.target.value})}
            className="w-full mt-1 p-2 border rounded"
            placeholder="e.g. Nepal"
          />
        </label>

        <label className="block mb-2">
          Country
          <input
            type="text"
            required
            value={location.country}
            onChange={(e) => setLocation({...location, country: e.target.value})}
            className="w-full mt-1 p-2 border rounded"
            placeholder="e.g. Nepal"
          />
        </label>

        <label className="block mb-2">
          Region
          <input
            type="text"
            value={location.region}
            onChange={(e) => setLocation({...location, region: e.target.value})}
            className="w-full mt-1 p-2 border rounded"
            placeholder="e.g. Southeast Asia"
          />
        </label>

        <label className="block mb-2">
          Timezone
          <input
            type="text"
            value={location.timezone}
            onChange={(e) => setLocation({...location, timezone: e.target.value})}
            className="w-full mt-1 p-2 border rounded"
            placeholder="e.g. Asia/Kathmandu"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block mb-2">
            Latitude
            <input
              type="number"
              step="0.0001"
              value={location.latitude}
              onChange={(e) => setLocation({...location, latitude: parseFloat(e.target.value)})}
              className="w-full mt-1 p-2 border rounded"
              placeholder="e.g. 27.7172"
            />
          </label>

          <label className="block mb-2">
            Longitude
            <input
              type="number"
              step="0.0001"
              value={location.longitude}
              onChange={(e) => setLocation({...location, longitude: parseFloat(e.target.value)})}
              className="w-full mt-1 p-2 border rounded"
              placeholder="e.g. 85.3240"
            />
          </label>
        </div>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}