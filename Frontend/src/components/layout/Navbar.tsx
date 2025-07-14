import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiHome, FiGlobe, FiPlusSquare, FiList, FiMap, FiInfo, FiUser, 
  FiChevronDown, FiBell
} from "react-icons/fi";
import api from "../../services/api";

interface User {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  profile_picture?: string;
}

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'like' | 'save' | 'trip_invite' | 'match_found' | 'wishlist_share';
  metadata?: {
    post_id?: number;
    post_title?: string;
    user_name?: string;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
}

interface NavbarProps {
  user: User | null;
  onToggleSidebar: () => void;
}

export default function Navbar({ user, onToggleSidebar }: NavbarProps) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { path: "/posts", icon: <FiHome size={18} />, label: "Stories", description: "Discover adventures" },
    { path: "/create-post", icon: <FiPlusSquare size={18} />, label: "Create", description: "Share your journey" },
    { path: "/wishlists", icon: <FiList size={18} />, label: "Wishlist", description: "Dream destinations" },
    { path: "/travel-plans", icon: <FiMap size={18} />, label: "Travel Plans", description: "Your itineraries" },
    { path: "/my-posts", icon: <FiInfo size={18} />, label: "My Posts", description: "My posts" },
    { path: "/travel-places", icon: <FiGlobe size={18} />, label: "Travel Places", description: "Travel Places" },
    { path: "/notifications", icon: <FiBell size={18} />, label: "Notifications", description: "Stay updated", hasNotifications: true }
  ];

  const fetchNotificationCount = async () => {
    try {
      if (!user?.id) return;
      
      const response = await api.get(`/notifications/user/`);
      const notificationData = response.data.data || [];
      
      const unread = notificationData.filter((n: Notification) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
      setUnreadCount(0);
    }
  };

  const runProcess = async () => {
    try {
      const response = await api.post("/proximity/process");
    } catch (err: any) {
      console.error("Failed to fetch proximity settings", err);
    } 
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      const interval = setInterval(fetchNotificationCount, 100000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      let interval: NodeJS.Timeout;
      const timeout = setTimeout(() => {
        runProcess();
        interval = setInterval(runProcess, 100000);
      }, 10000);
      
      return () => {
        clearTimeout(timeout);
        if (interval) clearInterval(interval);
      };
    }
  }, [user]);

  useEffect(() => {
    const handleRefresh = () => fetchNotificationCount();
    window.addEventListener('refreshNotifications', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, []);

  return (
    <>
      <nav className="hidden md:flex md:flex-col md:w-64 h-screen bg-white border-r border-slate-200/60 shadow-sm fixed left-0 top-0 z-30">
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <img src="compass.png" alt="Travel Buddy" className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Travel-Buddy</h1>
                <p className="text-xs text-slate-500">Adventure awaits</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const showNotificationBadge = item.hasNotifications && unreadCount > 0;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm border border-blue-200/50" 
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 relative ${
                      isActive 
                        ? "bg-blue-100 text-blue-600 shadow-sm" 
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    }`}>
                      {item.icon}
                      {showNotificationBadge && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate text-sm">{item.label}</div>
                        {showNotificationBadge && (
                          <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {item.hasNotifications && unreadCount > 0 
                          ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                          : item.description
                        }
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex-shrink-0 p-4 border-t border-slate-100">
            <button
              onClick={onToggleSidebar}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all duration-300 hover:shadow-md group"
            >
              <div className="relative flex-shrink-0">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all duration-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-slate-800 truncate text-sm">
                  {user?.name || "Guest User"}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {user?.email || "guest@example.com"}
                </div>
              </div>
              <FiChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-300 group-hover:rotate-180 flex-shrink-0" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}