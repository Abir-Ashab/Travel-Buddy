import { useState } from 'react';
import api from '../../services/api';
import { type CreateTripRequest } from '../../types';
import LocationSearch from '../globalFiles/locationSearch';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {FiUser} from "react-icons/fi";
import axios from 'axios';

interface CreateTripModalProps {
  onClose: () => void;
  onCreateSuccess: (tripId: string) => void;
}

const CreateTripComponent: React.FC = () => {
  const [formData, setFormData] = useState({
    trip_name: '',
    start_date: '',
    end_date: '',
    total_budget: '',
    status_id: '',
    max_participants: '',
    location: {
      name: '',
      country: '',
      region: '',
      latitude: '',
      longitude: '',
      timezone: ''
    }
  });

const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('explorer');
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/profile");
        const userRole = response.data.data.role;
        setRole(userRole)
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        ...formData,
        total_budget: Number(formData.total_budget),
        max_participants: Number(formData.max_participants),
        location: {
          ...formData.location,
          latitude: Number(formData.location.latitude),
          longitude: Number(formData.location.longitude)
        }
      };

      const response = await api.post('/trips', payload);

      if (response.status === 200 || response.status === 201) {
        setFormData({
          trip_name: '',
          start_date: '',
          end_date: '',
          total_budget: '',
          status_id: '',
          max_participants: '',
          location: {
            name: '',
            country: '',
            region: '',
            latitude: '',
            longitude: '',
            timezone: ''
          }
        });
        alert('Trip created successfully!');
      } else {
        alert('Failed to create trip');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        const { message, errorSources } = data;

        console.error("Status:", status);
        console.error("Message:", message);
        console.error("Sources:", errorSources);
        alert(message)
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('location.')) {
      const locField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

    const handleLocationSelect = (lat: number, lon: number, displayName: string) => {
    const parts = displayName.split(', ');
    const name = parts[0] || '';
    const region = parts.length > 1 ? parts[1] : '';
    const country = parts.length > 2 ? parts[parts.length - 1] : '';
    
    setFormData(prev => ({
      ...prev,
      location: {
        name: name,
        country: country,
        region: region,
        latitude: lat.toString(),
        longitude: lon.toString(),
        timezone: 'UTC' 
      }
    }));
  };

  if (role === "explorer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiUser className="text-purple-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Be a Traveler To Create Travel-Plan!</h2>
            <p className="text-slate-600 mb-6">
              Upgrade your account to Traveler status to share your adventures and stories with our community.
            </p>
            <button
              className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg transition-all duration-200"
            >
              <Link to="/upgrade">
                Upgrade Account
              </Link>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Trip</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
          <input
            type="text"
            name="trip_name"
            value={formData.trip_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter trip name"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
            <input
              type="number"
              name="total_budget"
              value={formData.total_budget}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
            <input
              type="number"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="1"
              min="1"
              required
            />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Location
            </label>
            <LocationSearch 
              onLocationSelect={handleLocationSelect}
              placeholder="Search for a location (e.g., Chimbuk, Bandarban)"
            />
        </div>
        {formData.location.name && (
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-medium text-sm mb-2">Selected Location:</h4>
            <p className="text-sm">
              {formData.location.name}, {formData.location.region}, {formData.location.country}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {formData.location.latitude}, {formData.location.longitude}
            </p>
          </div>
        )}

        <h3 className="text-lg font-medium mt-6">Location Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="location.name"
              value={formData.location.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Hills"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              name="location.country"
              value={formData.location.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Bangladesh"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input
              type="text"
              name="location.region"
              value={formData.location.region}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="ctg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                name="location.latitude"
                value={formData.location.latitude}
                onChange={handleChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="22.9711"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                name="location.longitude"
                value={formData.location.longitude}
                onChange={handleChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="78.85686"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <input
              type="text"
              name="location.timezone"
              value={formData.location.timezone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Asia/Dhaka"
              required
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Trip'}
        </button>
      </div>
    </div>
  );
};

export default CreateTripComponent;