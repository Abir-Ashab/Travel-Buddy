import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, DollarSign, Clock, MessageSquare, Plus, Eye, UserPlus, Check, X, Send } from 'lucide-react';
import api from "../../services/api";

// types.ts - Interface definitions
interface TripStatus {
  id: string;
  name: 'planning' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  description?: string;
  created_at?: Date;
}

interface TravelPlan {
  id: string;
  creator_id: string;
  location_id: string;
  trip_name: string;
  start_date: Date;
  end_date: Date;
  total_budget: number;
  status_id: string;
  max_participants: number;
  created_at?: Date;
  updated_at?: Date;
  creator_name?: string;
  location_name?: string;
  status_name?: string;
  participants_count?: number;
  user_role?: 'creator' | 'participant';
  user_status?: 'invited' | 'joined' | 'declined';
}

interface TravelParticipant {
  id: string;
  trip_plan_id: string;
  user_id: string;
  role: 'creator' | 'participant';
  status: 'invited' | 'joined' | 'declined';
  joined_at?: Date;
  created_at?: Date;
  user_name?: string;
  user_email?: string;
  profile_picture?: string;
}

interface Message {
  id: string;
  trip_plan_id: string;
  sender_id: string;
  message: string;
  attachments?: any[];
  created_at?: Date;
  sender_name?: string;
  sender_profile_picture?: string;
}

interface InviteResponse {
  id: string;
  trip_name: string;
  creator_name: string;
  location_name: string;
  start_date: Date;
  end_date: Date;
  status: 'invited' | 'joined' | 'declined';
  created_at: Date;
}

// TripPlanningDashboard.tsx - Main dashboard component
const TripPlanningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-trips' | 'create' | 'invites'>('my-trips');
  const [selectedTrip, setSelectedTrip] = useState<TravelPlan | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trip Planning</h1>
          <p className="text-gray-600 mt-2">Plan your adventures and collaborate with fellow travelers</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-md">
          <button
            onClick={() => setActiveTab('my-trips')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-trips'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Trips
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Trip
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'invites'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Invites
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'my-trips' && <MyTripsComponent onTripSelect={setSelectedTrip} />}
            {activeTab === 'create' && <CreateTripComponent />}
            {activeTab === 'invites' && <TripInvitesComponent />}
          </div>
          
          {selectedTrip && activeTab === 'my-trips' && (
            <div className="lg:col-span-1">
              <TripDetailsComponent trip={selectedTrip} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MyTripsComponent.tsx - Component for displaying user's trips
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
      // Handle different response structures
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

// CreateTripComponent.tsx - Component for creating new trips
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

// TripInvitesComponent.tsx - Component for managing trip invites
const TripInvitesComponent: React.FC = () => {
  const [invites, setInvites] = useState<InviteResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await api.get('/trips/invites');
      const invitesData = response.data.data.trips;
      // Handle different response structures
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
      const response = await api.put(`/trips/${tripId}/status`, { status });

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
                  onClick={() => handleInviteResponse(invite.id, 'joined')}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </button>
                <button
                  onClick={() => handleInviteResponse(invite.id, 'declined')}
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

// TripDetailsComponent.tsx - Component for displaying trip details
const TripDetailsComponent: React.FC<{ trip: TravelPlan }> = ({ trip }) => {
  const [participants, setParticipants] = useState<TravelParticipant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trip.id) {
      fetchTripDetails();
    }
  }, [trip.id]);

  const fetchTripDetails = async () => {
    try {
      const [participantsRes, messagesRes] = await Promise.all([
        api.get(`/trips/${trip.id}/participants`),
        api.get(`/trips/${trip.id}/messages`)
      ]);
      
      // Handle participants data
      const participantsData = participantsRes.data;
      if (Array.isArray(participantsData)) {
        setParticipants(participantsData);
      } else if (participantsData && Array.isArray(participantsData.participants)) {
        setParticipants(participantsData.participants);
      } else {
        setParticipants([]);
      }

      // Handle messages data
      const messagesData = messagesRes.data;
      if (Array.isArray(messagesData)) {
        setMessages(messagesData);
      } else if (messagesData && Array.isArray(messagesData.messages)) {
        setMessages(messagesData.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setParticipants([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/trips/${trip.id}/messages`, { message: newMessage });

      if (response.status === 200 || response.status === 201) {
        setNewMessage('');
        fetchTripDetails(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading trip details...</div>;
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">{trip.trip_name}</h3>
        <p className="text-sm text-gray-600 mt-1">{trip.location_name}</p>
      </div>
      
      {/* Participants */}
      <div className="p-6 border-b">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Participants ({participants.length}/{trip.max_participants})
        </h4>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {participant.user_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{participant.user_name}</p>
                  <p className="text-xs text-gray-500">{participant.role}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                participant.status === 'joined' ? 'bg-green-100 text-green-800' :
                participant.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {participant.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex flex-col h-96">
        <div className="p-4 border-b">
          <h4 className="text-sm font-medium text-gray-900">Messages</h4>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">
                    {message.sender_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{message.sender_name}</span>
                    <span className="text-xs text-gray-500">
                      {message.created_at ? new Date(message.created_at).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{message.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={sendMessage}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanningDashboard;