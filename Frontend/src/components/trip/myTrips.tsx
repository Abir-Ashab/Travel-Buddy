import { useEffect, useState } from 'react';
import { type TravelPlan } from '../../types';
import api from '../../services/api';
import { Calendar, Users, MapPin, DollarSign, Clock, MessageSquare, Plus, Eye, UserPlus, Check, X, Send } from 'lucide-react';

const MyTripsComponent: React.FC<{ onTripSelect: (trip: TravelPlan) => void }> = ({ onTripSelect }) => {
  const [trips, setTrips] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTrips();
  }, []);

  const fetchMyTrips = async () => {
    try {
      const response = await api.get('/trips/my-trips');
      console.log("get trip: ", response)
      const tripsData = response.data.data.trips;
      if (Array.isArray(tripsData)) {
        setTrips(tripsData);
      } else if (tripsData && Array.isArray(tripsData.trips)) {
        setTrips(tripsData.trips);
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <div className="text-center py-8">Loading your trips...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Trips</h2>
        <span className="text-sm text-gray-500">{trips.length} trips</span>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first trip!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onTripSelect(trip)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-gray-900">{trip.trip_name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status_name || 'planning')}`}>
                  {trip.status_name || 'Planning'}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{trip.location_name}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{trip.participants_count}/{trip.max_participants}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>${trip.total_budget}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTripsComponent;