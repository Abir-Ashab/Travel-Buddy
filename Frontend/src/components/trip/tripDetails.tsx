import { Calendar, Users, MapPin, DollarSign, Clock, MessageSquare, Plus, Eye, UserPlus, Check, X, Send } from 'lucide-react';
import api from "../../services/api";
import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import type { TravelPlan, TravelParticipant, Message } from '../../types';
import InviteTravelersComponent from './inviteTravelers';

export default function TripDetailsComponent() {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<TravelParticipant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [trip, setTrip] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTripDetails();
    }
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const tripResponse = await api.get(`/trips/${id}`);
      const tripData = tripResponse.data.data;   
      setTrip(tripData); 

      const [participantsRes, messagesRes] = await Promise.all([
        api.get(`/trips/${id}/participants`),
        api.get(`/trips/${id}/messages`)
      ]);

      const participantsData = participantsRes.data.data;
      setParticipants(
        Array.isArray(participantsData) ? participantsData :
        participantsData?.participants || []
      );
      const messagesData = messagesRes.data.data;
      setMessages(
        Array.isArray(messagesData) ? messagesData :
        messagesData?.messages || []
      );
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setError('Failed to load trip details. Please try again.');
      setParticipants([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/trips/${id}/messages`, { 
        message: newMessage 
      });

      if (response.status === 200 || response.status === 201) {
        setNewMessage('');
        const messagesRes = await api.get(`/trips/${id}/messages`);
        const messagesData = messagesRes.data.data;
        setMessages(
          Array.isArray(messagesData) ? messagesData :
          messagesData?.messages || []
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleInviteSuccess = () => {
    // Refresh participants after successful invite
    fetchTripDetails();
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name: any) => {
    return name?.split(' ').map((n: any) => n[0]).join('').toUpperCase() || 'U';
  };

 if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading trip details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchTripDetails}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg">Trip not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{trip.trip_name}</h1>
            <div className="flex items-center text-blue-100 mb-3">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-base">{trip.location_name}</span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Budget: ${trip.total_budget}</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Users className="h-4 w-4 mr-2" />
                <span>{participants.length}/{trip.max_participants} Participants</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Participants
            </h2>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Invite Travelers"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No participants yet</p>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Invite Travelers
                </button>
              </div>
            ) : (
              participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(participant.user_name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{participant.user_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{participant.role}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    participant.status === 'joined' ? 'bg-green-100 text-green-700' :
                    participant.status === 'invited' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {participant.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              Messages
            </h2>
            <div className="text-sm text-gray-500">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </div>
          </div>
 
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex space-x-3 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0">         
                    {
                      message.sender_profile_picture? (
                        <img
                          src={message.sender_profile_picture}
                          alt={message.sender_name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white"
                        />
                      ) : getInitials(message.sender_name)
                    }    
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{message.sender_name}</span>
                      <span className="text-xs text-gray-500">
                        {message.created_at
                          ? new Date(message.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Unknown date'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-md p-3 max-w-md">
                      <p className="text-gray-800 text-sm">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 font-medium"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Travelers Modal */}
      {showInviteModal && (
        <InviteTravelersComponent
          tripId={id!}
          onClose={() => setShowInviteModal(false)}
          onInviteSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
}