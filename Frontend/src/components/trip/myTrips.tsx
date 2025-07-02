// components/travelPlans/MyTrips.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { type TravelPlan } from '../../types';
import { format } from 'date-fns';
import api from '../../services/api';

export default function MyTrips() {
  const [trips, setTrips] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get('/trips/my-trips');
        setTrips(response.data.trips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Trips</h2>
      
      {!trips? (
        <div className="text-center py-10">
          <p className="text-gray-500">You don't have any trips yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <Link 
              to={`/travel-plans/${trip.id}`} 
              key={trip.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{trip.trip_name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(trip.status_name || '')}`}>
                    {trip.status_name}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-2">
                  {format(new Date(trip.start_date), 'MMM d, yyyy')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                </p>
                
                <p className="text-gray-600 mb-2">
                  {trip.location_name}
                </p>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    {trip.participants_count || 0} participants
                  </span>
                  <span className="font-medium">
                    ${trip.total_budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}