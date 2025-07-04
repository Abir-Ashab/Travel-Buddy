import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Calendar, Star } from 'lucide-react';

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

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        {isEditing ? 'Edit Wishlist Item' : 'Add New Wishlist Item'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Priority and Budget Row */}
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

        {/* Date Range */}
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

        {/* Location Section */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                name="location.name"
                value={formData.location.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Hills, Cox's Bazar, Dhaka"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <input
                type="text"
                name="location.region"
                value={formData.location.region}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ctg, dhk, syl"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                name="location.latitude"
                value={formData.location.latitude}
                onChange={handleInputChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 25.8311"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                name="location.longitude"
                value={formData.location.longitude}
                onChange={handleInputChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 93.3686"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              name="location.timezone"
              value={formData.location.timezone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Dhaka">Asia/Dhaka</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        {/* Notes */}
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

        {/* Form Actions */}
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