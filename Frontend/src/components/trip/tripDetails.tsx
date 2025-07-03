import { Calendar, Users, MapPin, DollarSign, Clock, MessageSquare, Plus, Eye, UserPlus, Check, X, Send } from 'lucide-react';
import api from "../../services/api";
import React, { useState, useEffect } from 'react';
import type{ TravelPlan, TravelParticipant, Message } from '../../types';

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
      
      console.log("data: ", participantsRes)
      const participantsData = participantsRes.data.data;
      if (Array.isArray(participantsData)) {
        setParticipants(participantsData);
      } else if (participantsData && Array.isArray(participantsData.participants)) {
        setParticipants(participantsData.participants);
      } else {
        setParticipants([]);
      }

      const messagesData = messagesRes.data.data;
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
        fetchTripDetails(); 
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

export default TripDetailsComponent;