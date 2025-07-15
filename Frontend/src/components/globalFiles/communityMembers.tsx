import { useEffect, useState } from 'react';
import { Users, MapPin, Globe, Award, UserPlus, MessageCircle, Search, Filter, Grid, List, RefreshCw, Star, Calendar, Phone, Mail, Shield, Crown } from 'lucide-react';
import api from '../../services/api';
import DynamicBackground from './dynamicBackground';

interface CommunityMember {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  role: string;
  status: string;
  number?: string;
  current_latitude?: number;
  current_longitude?: number;
  location_updated_at?: string;
  proximity_notifications_enabled: boolean;
  proximity_radius_km: number;
  travel_preferences?: any;
  geom?: any;
}

const CommunityMembersComponent: React.FC = () => {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCommunityMembers();
  }, []);

  const fetchCommunityMembers = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      
      const response = await api.get('users/travelers');
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setMembers(response.data.data);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching community members:', error);
      setError('Failed to fetch community members');
      setMembers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.bio && member.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25';
      case 'moderator': return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25';
      case 'traveler': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25';
      case 'explorer': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg shadow-gray-500/25';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3 mr-1" />;
      case 'moderator': return <Shield className="w-3 h-3 mr-1" />;
      case 'traveler': return <Globe className="w-3 h-3 mr-1" />;
      case 'explorer': return <MapPin className="w-3 h-3 mr-1" />;
      default: return <Users className="w-3 h-3 mr-1" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLocationString = (member: CommunityMember) => {
    if (member.current_latitude && member.current_longitude) {
      return `${member.current_latitude}, ${member.current_longitude}`;
    }
    return 'Location not set';
  };

  const isVerified = (member: CommunityMember) => {
    return member.role === 'admin' || member.role === 'moderator';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <DynamicBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-purple-300/30 border-t-purple-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Community Members</h2>
            <p className="text-white/80">Connecting travelers worldwide...</p>
          </div>
        </div>
      </DynamicBackground>
    );
  }

  if (error) {
    return (
      <DynamicBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 shadow-2xl">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
              <p className="text-white/80 mb-6">{error}</p>
              <button 
                onClick={fetchCommunityMembers}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-500/25"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DynamicBackground>
    );
  }

  return (
    <DynamicBackground>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg shadow-purple-500/25">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      Community Members
                    </h1>
                    <p className="text-white/80">
                      {members.length} {members.length === 1 ? 'member' : 'members'} • Growing every day
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchCommunityMembers}
                    disabled={refreshing}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 shadow-lg shadow-purple-500/25"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  
                  <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-white/20 text-white shadow-lg' 
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-white/20 text-white shadow-lg' 
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/60"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-4 h-4 w-4 text-white/60" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-12 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="traveler">Traveler</option>
                <option value="explorer">Explorer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members Grid/List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                <Users className="h-12 w-12 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No members found</h3>
              <p className="text-white/80 max-w-md mx-auto">
                {searchTerm || selectedRole !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Be the first to join this amazing travel community!'}
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
            }>
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className={`bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-105 hover:bg-white/15 ${
                    viewMode === 'list' ? 'flex items-center p-6' : 'p-6'
                  }`}
                >
                  <div className={`${viewMode === 'list' ? 'flex items-center space-x-6 flex-1' : ''}`}>
                    {/* Profile Section */}
                    <div className={`relative ${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                      <div className="relative">
                        {member.profile_picture ? (
                          <img
                            src={member.profile_picture}
                            alt={member.name}
                            className={`${viewMode === 'list' ? 'w-16 h-16' : 'w-20 h-20'} rounded-full object-cover border-4 border-white/20 shadow-xl`}
                          />
                        ) : (
                          <div className={`${viewMode === 'list' ? 'w-16 h-16' : 'w-20 h-20'} bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-white/20 shadow-xl`}>
                            <span className={`${viewMode === 'list' ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
                              {getInitials(member.name)}
                            </span>
                          </div>
                        )}
                        {isVerified(member) && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1.5 border-2 border-white/20 shadow-lg">
                            <Award className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white/20 shadow-lg ${
                          member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                        <div>
                          <h3 className={`${viewMode === 'list' ? 'text-lg' : 'text-xl'} font-bold text-white mb-2`}>
                            {member.name}
                          </h3>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(member.role)}`}>
                              {getRoleIcon(member.role)}
                              {member.role}
                            </span>
                            {member.status === 'active' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                                Online
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {viewMode === 'list' && (
                          <div className="flex space-x-2">
                            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25">
                              <UserPlus className="h-4 w-4" />
                              <span>Connect</span>
                            </button>
                            <button className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20">
                              <MessageCircle className="h-4 w-4" />
                              <span>Message</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-white/80">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-white/60" />
                          <span>Joined {formatDate(member.created_at)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-white/60" />
                          <span className="truncate">{getLocationString(member)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-white/60" />
                          <span>
                            {member.proximity_notifications_enabled ? 'Notifications On' : 'Notifications Off'} • 
                            {member.proximity_radius_km}km radius
                          </span>
                        </div>

                        {member.number && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-white/60" />
                            <span>{member.number}</span>
                          </div>
                        )}
                      </div>

                      {member.bio && (
                        <p className="text-sm text-white/80 mt-3 line-clamp-2 bg-white/5 rounded-lg p-3 border border-white/10">
                          {member.bio}
                        </p>
                      )}

                      {viewMode === 'grid' && (
                        <div className="flex space-x-2 mt-4">
                          <button className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25">
                            <UserPlus className="h-4 w-4" />
                            <span>Connect</span>
                          </button>
                          <button className="flex-1 flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm text-white py-2 px-3 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20">
                            <MessageCircle className="h-4 w-4" />
                            <span>Message</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DynamicBackground>
  );
};

export default CommunityMembersComponent;