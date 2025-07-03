// components/travelPlans/TripInvites.tsx
import { useEffect, useState } from 'react';
import { type InviteResponse } from '../../types';
import api from '../../services/api';
import { Calendar, Users, MapPin, DollarSign, Clock, MessageSquare, Plus, Eye, UserPlus, Check, X, Send } from 'lucide-react';

const TripInvitesComponent: React.FC = () => {
  const [invites, setInvites] = useState<InviteResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await api.get('/trips/invites');
      const invitesData = response.data.data
      console.log("invitesData: ", invitesData)
      if (Array.isArray(invitesData)) {
        setInvites(invitesData);
      } else if (invitesData && Array.isArray(invitesData.invites)) {
        setInvites(invitesData.invites);
      } else {
        setInvites([]);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteResponse = async (tripId: string, status: 'joined' | 'declined') => {
    try {
      const response = await api.put(`/trips/${tripId}/status`, { 'status' : status });

      if (response.status === 200) {
        setInvites(invites.filter(invite => invite.id !== tripId));
      }
    } catch (error) {
      console.error('Error responding to invite:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading invites...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Trip Invites</h2>
      
      {invites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending invites</h3>
          <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => (
            <div key={invite.id} className="bg-white p-6 rounded-lg border">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-gray-900">{invite.trip_name}</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Invited
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                Invited by <span className="font-medium">{invite.creator_name}</span>
              </p>
              
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="mr-4">{invite.location_name}</span>
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {new Date(invite.start_date).toLocaleDateString()} - {new Date(invite.end_date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleInviteResponse(invite.trip_plan_id, 'joined')}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </button>
                <button
                  onClick={() => handleInviteResponse(invite.trip_plan_id, 'declined')}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripInvitesComponent;