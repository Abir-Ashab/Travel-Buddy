// components/travelPlans/TripInvites.tsx
import { useEffect, useState } from 'react';
import { type InviteResponse } from '../../types';
import api from '../../services/api';

export default function TripInvites() {
  const [invites, setInvites] = useState<InviteResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const response = await api.get('/trips/invites');
        setInvites(response.data);
      } catch (error) {
        console.error('Error fetching invites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvites();
  }, []);

  const handleRespondToInvite = async (tripId: string, status: 'joined' | 'declined') => {
    try {
      await api.put(`/trips/${tripId}/status`, { status });
      setInvites(invites.filter(invite => invite.id !== tripId));
    } catch (error) {
      console.error('Error responding to invite:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Trip Invites</h2>
      
      {!invites ? (
        <div className="text-center py-10">
          <p className="text-gray-500">You don't have any trip invites at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invites.map(invite => (
            <div key={invite.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{invite.trip_name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  Invited
                </span>
              </div>
              
              <p className="text-gray-600 mb-2">
                Organized by: {invite.creator_name}
              </p>
              
              <p className="text-gray-600 mb-2">
                Location: {invite.location_name}
              </p>
              
              <p className="text-gray-600 mb-4">
                {new Date(invite.start_date).toLocaleDateString()} - {new Date(invite.end_date).toLocaleDateString()}
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRespondToInvite(invite.id, 'joined')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespondToInvite(invite.id, 'declined')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}