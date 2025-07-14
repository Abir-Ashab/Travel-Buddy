import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Calendar, Star } from 'lucide-react';
import LocationSearch from "../globalFiles/locationSearch";

import { 
  FiMapPin, 
  FiGlobe, 
  FiClock,
  FiType,
  FiNavigation,
} from "react-icons/fi";

interface WishlistItemFormData {
  priority_level: number;
  notes: string;
  estimated_budget: number | '';
  preferred_start_date: string;
  preferred_end_date: string;
  location: {
    name: string;
    country: string;
    region: string;
    latitude: number | '';
    longitude: number | '';
    timezone: string;
  };
}

interface WishlistItem {
  id: string;
  priority_level: number;
  notes: string;
  estimated_budget?: number;
  preferred_start_date: string;
  preferred_end_date: string;
  location: {
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  createdAt?: string;
}

interface WishlistItemFormProps {
  isEditing?: boolean;
  editingItem?: WishlistItem | null;
  onSubmit: (formData: WishlistItemFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const WishlistItemForm: React.FC<WishlistItemFormProps> = ({
  isEditing = false,
  editingItem,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<WishlistItemFormData>({
    priority_level: 1,
    notes: '',
    estimated_budget: '',
    preferred_start_date: '',
    preferred_end_date: '',
    location: {
      name: '',
      country: 'Bangladesh',
      region: '',
      latitude: '',
      longitude: '',
      timezone: 'Asia/Dhaka'
    }
  });

  useEffect(() => {
    if (isEditing && editingItem) {
      setFormData({
        priority_level: editingItem.priority_level,
        notes: editingItem.notes,
        estimated_budget: editingItem.estimated_budget || '',
        preferred_start_date: editingItem.preferred_start_date,
        preferred_end_date: editingItem.preferred_end_date,
        location: {
          name: editingItem.location.name,
          country: editingItem.location.country,
          region: editingItem.location.region,
          latitude: editingItem.location.latitude,
          longitude: editingItem.location.longitude,
          timezone: editingItem.location.timezone
        }
      });
    } else {
      setFormData({
        priority_level: 1,
        notes: '',
        estimated_budget: '',
        preferred_start_date: '',
        preferred_end_date: '',
        location: {
          name: '',
          country: 'Bangladesh',
          region: '',
          latitude: '',
          longitude: '',
          timezone: 'Asia/Dhaka'
        }
      });
    }
  }, [isEditing, editingItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: locationField === 'latitude' || locationField === 'longitude' 
            ? (value === '' ? '' : parseFloat(value)) 
            : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'priority_level' 
          ? parseInt(value) 
          : name === 'estimated_budget' 
            ? (value === '' ? '' : parseFloat(value))
            : value
      }));
    }
  };

  const handleLocationFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location.name.trim()) {
      alert('Location name is required');
      return;
    }
    
    const submitData: WishlistItemFormData = {
      ...formData,
      notes: formData.notes.trim(),
      location: {
        ...formData.location,
        name: formData.location.name.trim(),
        region: formData.location.region.trim(),
        latitude: formData.location.latitude === '' ? 0 : Number(formData.location.latitude),
        longitude: formData.location.longitude === '' ? 0 : Number(formData.location.longitude)
      }
    };

    await onSubmit(submitData);
  };

  const priorityOptions = [
    { value: 1, label: '★ Low Priority', color: 'text-gray-500' },
    { value: 2, label: '★★ Medium Priority', color: 'text-yellow-500' },
    { value: 3, label: '★★★ High Priority', color: 'text-red-500' }
  ];

  const handleLocationSelect = (lat: number, lon: number, displayName: string) => {
    const parts = displayName.split(', ');
    const name = parts[0] || '';
    const region = parts.length > 1 ? parts[1] : '';
    const country = parts.length > 2 ? parts[parts.length - 1] : '';

    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        name: name,
        country: country,
        region: region,
        timezone: 'UTC', // or use a real timezone if available
        latitude: lat,
        longitude: lon
      }
    }));
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        {isEditing ? 'Edit Wishlist Item' : 'Add New Wishlist Item'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level *
            </label>
            <select
              name="priority_level"
              value={formData.priority_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Estimated Budget ($)
            </label>
            <input
              type="number"
              name="estimated_budget"
              value={formData.estimated_budget}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter estimated budget"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Preferred Start Date
            </label>
            <input
              type="date"
              name="preferred_start_date"
              value={formData.preferred_start_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Preferred End Date
            </label>
            <input
              type="date"
              name="preferred_end_date"
              value={formData.preferred_end_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="Search for a location (e.g., Everest)"
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  <FiGlobe className="inline mr-1" />
                  Country
                </label>
                <input
                  type="text"
                  required
                  value={formData.location.country} // Fixed: use formData.location
                  onChange={(e) => handleLocationFieldChange('country', e.target.value)} // Fixed: use new handler
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
                  value={formData.location.region} 
                  onChange={(e) => handleLocationFieldChange('region', e.target.value)} 
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
                  value={formData.location.timezone} 
                  onChange={(e) => handleLocationFieldChange('timezone', e.target.value)} 
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
                  value={formData.location.latitude} 
                  onChange={(e) => handleLocationFieldChange('latitude', e.target.value === '' ? '' : parseFloat(e.target.value))} // Fixed: use new handler
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
                  value={formData.location.longitude}
                  onChange={(e) => handleLocationFieldChange('longitude', e.target.value === '' ? '' : parseFloat(e.target.value))} // Fixed: use new handler
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="e.g., 86.9250"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional notes about this wishlist item..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WishlistItemForm;