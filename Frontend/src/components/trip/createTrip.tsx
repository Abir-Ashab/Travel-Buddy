// components/travelPlans/CreateTripModal.tsx
import { useState } from 'react';
import api from '../../services/api';
import { type CreateTripRequest } from '../../types';

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
      console.error('Error creating trip:', error);
      alert('Error creating trip');
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status ID</label>
          <input
            type="text"
            name="status_id"
            value={formData.status_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter status ID"
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