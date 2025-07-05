import React, { useState } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {FiUser, FiPlus} from "react-icons/fi";

interface CreateWishlistProps {
  onSubmit: (data: { 
    name: string; 
    description?: string; 
    grouping_type: 'region' | 'theme' | 'budget' | 'season';
    is_public?: boolean 
  }) => Promise<void>;
  onCancel: () => void;
}
const CreateWishlist: React.FC<CreateWishlistProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        grouping_type: 'theme' as 'region' | 'theme' | 'budget' | 'season', // default value
        is_public: false,
    });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const newErrors: { [key: string]: string } = {};
  if (!formData.name.trim()) {
    newErrors.name = 'Wishlist name is required';
  }
  if (!formData.grouping_type) {
    newErrors.grouping_type = 'Grouping type is required';
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    setLoading(true);
    await onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      grouping_type: formData.grouping_type,
      is_public: formData.is_public,
    });
  } catch (error) {
    console.error('Failed to create wishlist:', error);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (role === "explorer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiUser className="text-purple-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Be a Traveler To Create Wishlist!</h2>
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onCancel}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Create New Wishlist</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Wishlist Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter wishlist name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your wishlist..."
              />
            </div>
            {/* Grouping Type Field */}
            <div>
                <label htmlFor="grouping_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Grouping Type *
                </label>
                <select
                    id="grouping_type"
                    name="grouping_type"
                    value={formData.grouping_type}
                    onChange={(e) => setFormData(prev => ({
                    ...prev,
                    grouping_type: e.target.value as 'region' | 'theme' | 'budget' | 'season'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="region">Region</option>
                    <option value="theme">Theme</option>
                    <option value="budget">Budget</option>
                    <option value="season">Season</option>
                </select>
            </div>
            {/* Privacy Setting */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                name="is_public"
                checked={formData.is_public}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                Make this wishlist public (others can view it)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Wishlist'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWishlist;