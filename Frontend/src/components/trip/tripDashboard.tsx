import React, { useState, useEffect } from 'react';
import { type TravelPlan } from '../../types';
import MyTripsComponent from './myTrips';
import CreateTripComponent from './createTrip';
import TripInvitesComponent from './tripInvites';
import TripDetailsComponent from './tripDetails';

const TripPlanningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-trips' | 'create' | 'invites'>('my-trips');
  const [selectedTrip, setSelectedTrip] = useState<TravelPlan | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-[25%] max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trip Planning</h1>
          <p className="text-gray-600 mt-2">Plan your adventures and collaborate with fellow travelers</p>
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'my-trips' && <MyTripsComponent />}
            {activeTab === 'create' && <CreateTripComponent />}
            {activeTab === 'invites' && <TripInvitesComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanningDashboard;