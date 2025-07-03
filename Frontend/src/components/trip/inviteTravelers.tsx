import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Send, X, Check, Search, Loader2 } from 'lucide-react';
import api from "../../services/api";

interface Traveler {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  location?: string;
}

interface InviteTravelersProps {
  tripId: string;
  onClose: () => void;
  onInviteSuccess: () => void;
}

export default function InviteTravelersComponent({ tripId, onClose, onInviteSuccess }: InviteTravelersProps) {
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [selectedTravelers, setSelectedTravelers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTravelers();
  }, []);

  const fetchTravelers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/users/travelers');
      const travelersData = response.data.data;
      
      setTravelers(
        Array.isArray(travelersData) ? travelersData : 
        travelersData?.travelers || []
      );
    } catch (error) {
      console.error('Error fetching travelers:', error);
      setError('Failed to load travelers. Please try again.');
      setTravelers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTravelerSelect = (travelerId: string) => {
    setSelectedTravelers(prev => 
      prev.includes(travelerId) 
        ? prev.filter(id => id !== travelerId)
        : [...prev, travelerId]
    );
  };

  const handleInvite = async () => {
    if (selectedTravelers.length === 0) return;

    try {
      setInviting(true);
      setError(null);

      const response = await api.post(`/trips/${tripId}/invite`, {
        user_ids: selectedTravelers
      });

      if (response.status === 200 || response.status === 201) {
        onInviteSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error inviting travelers:', error);
      setError('Failed to send invitations. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const filteredTravelers = travelers.filter(traveler =>
    traveler.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    traveler.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserPlus className="h-6 w-6 mr-2 text-blue-600" />
            Invite Travelers
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search travelers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600 mr-3" />
                <span className="text-gray-600">Loading travelers...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                  onClick={fetchTravelers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredTravelers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'No travelers found matching your search' : 'No travelers available'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96 p-6">
              <div className="space-y-3">
                {filteredTravelers.map((traveler) => (
                  <div
                    key={traveler.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedTravelers.includes(traveler.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTravelerSelect(traveler.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {traveler.profile_picture ? (
                          <img
                            src={traveler.profile_picture}
                            alt={traveler.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {getInitials(traveler.name)}
                          </div>
                        )}
                        {selectedTravelers.includes(traveler.id) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{traveler.name}</h3>
                        <p className="text-sm text-gray-500">{traveler.email}</p>
                        {traveler.location && (
                          <p className="text-xs text-gray-400 mt-1">{traveler.location}</p>
                        )}
                        {traveler.bio && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{traveler.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedTravelers.includes(traveler.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedTravelers.includes(traveler.id) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedTravelers.length} traveler{selectedTravelers.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={selectedTravelers.length === 0 || inviting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                {inviting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Invitations</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}