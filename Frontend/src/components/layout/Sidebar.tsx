import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiLogOut, FiX, FiSettings, FiBell, FiHelpCircle, FiAward } from "react-icons/fi";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

interface User {
  name?: string;
  email?: string;
  role?: string;
  profile_picture?: string;
}

interface UserStats {
  total_stories: number;
  total_likes: number;
  total_saved: number;
  membership: string
}

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    total_stories: 0,
    total_likes: 0,
    total_saved: 0,
    membership: ''
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchUserStats = async () => {
    if (!user) return;
    
    setStatsLoading(true);
    try {

      const member = await api.get('/users/profile')
      const membership = member.data.data.created_at;
      const membershipDate = new Date(membership);
      const formattedDate = membershipDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const statsResponse = await api.get('/posts');
      const stats = statsResponse.data.data.posts;
      const storiesCount = stats.length;
      
      const savedResponse = await api.get('/posts/user/saved-posts');
      const savedCount = savedResponse.data.data.posts?.length || 0;
     
      const likedResponse = await api.get('/posts/user/liked-posts');
      const likedCount = likedResponse.data.data.posts?.length || 0;
      
      setUserStats({
        total_stories: storiesCount,
        total_likes: likedCount,
        total_saved: savedCount, 
        membership: formattedDate
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      setUserStats({
        total_stories: 0,
        total_likes: 0,
        total_saved: 0,
        membership: ''
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetchUserStats();
    }
  }, [user, isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleBadge = (role?: string) => {
    const roleConfig = {
      traveler: { 
        label: "Traveler", 
        color: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
        icon: "🌟"
      },
      explorer: { 
        label: "Explorer", 
        color: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
        icon: "🗺️"
      },
      admin: { 
        label: "Admin", 
        color: "bg-gradient-to-r from-purple-500 to-pink-600 text-white",
        icon: "👑"
      }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.explorer;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
    );
  };

  const formatCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`} 
        onClick={onClose} 
      />
      
      <aside className={`fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-2xl transform transition-all duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        
        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Account</h3>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <FiX size={20} className="text-slate-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user?.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-lg">
                    <FiUser className="text-slate-600 text-2xl" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-3 border-white shadow-sm"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-lg">{user?.name || "Guest User"}</h4>
                <p className="text-slate-600 text-sm">{user?.email || "welcome@travelstory.com"}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              {getRoleBadge(user?.role)}
              <div className="text-right">
                <p className="text-xs text-slate-500">Member since</p>
                <p className="text-sm font-medium text-slate-700">{userStats.membership}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-200/60">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {statsLoading ? (
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                ) : (
                  formatCount(userStats.total_stories)
                )}
              </div>
              <div className="text-xs text-slate-500">Stories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {statsLoading ? (
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin mx-auto"></div>
                ) : (
                  formatCount(userStats.total_likes)
                )}
              </div>
              <div className="text-xs text-slate-500">Liked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {statsLoading ? (
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                ) : (
                  formatCount(userStats.total_saved)
                )}
              </div>
              <div className="text-xs text-slate-500">Saved</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <Link 
            to="/edit-profile" 
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-200 group"
            onClick={onClose}
          >
            <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
              <FiUser className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-800">Edit Profile</div>
              <div className="text-sm text-slate-500">Manage your account</div>
            </div>
          </Link>

          <Link 
            to="/proximity-settings" 
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-200 group"
            onClick={onClose}
          >
            <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
              <FiSettings className="text-slate-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-slate-800">Proximity Settings</div>
              <div className="text-sm text-slate-500">Preferences & privacy</div>
            </div>
          </Link>

          <Link 
            to="/saved-liked-posts" 
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-200 group"
            onClick={onClose}
          >
            <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
              <FiAward className="text-slate-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-slate-800">Saved & Liked</div>
              <div className="text-sm text-slate-500">
                {statsLoading ? (
                  "Loading..."
                ) : (
                  `${userStats.total_saved} saved, ${userStats.total_likes} liked`
                )}
              </div>
            </div>
          </Link>
        </nav>

        <div className="mt-auto p-6 border-t border-slate-200/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 hover:bg-red-100 transition-all duration-200 group border border-red-200/50"
          >
            <div className="p-2 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
              <FiLogOut className="text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-red-800">Sign Out</div>
              <div className="text-sm text-red-600">See you next time!</div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}