import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FiHome, FiGlobe, FiPlusSquare, FiList, FiMap, FiInfo, FiUser, 
  FiChevronDown, FiBell, FiX, FiHeart, FiBookmark, FiUsers, 
  FiTarget, FiShare2, FiCheck, FiTrash2, FiSettings, FiLogOut,
  FiEye, FiEyeOff
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

const notificationIcons = {
  like: FiHeart,
  save: FiBookmark,
  trip_invite: FiUsers,
  match_found: FiTarget,
  wishlist_share: FiShare2
};

const notificationColors = {
  like: 'text-red-500 bg-red-50',
  save: 'text-blue-500 bg-blue-50',
  trip_invite: 'text-green-500 bg-green-50',
  match_found: 'text-purple-500 bg-purple-50',
  wishlist_share: 'text-orange-500 bg-orange-50'
};

export default function Navbar({ user, onToggleSidebar }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { path: "/posts", icon: <FiHome size={20} />, label: "Stories", description: "Discover adventures" },
    { path: "/create-post", icon: <FiPlusSquare size={20} />, label: "Create", description: "Share your journey" },
    { path: "/wishlists", icon: <FiList size={20} />, label: "Wishlist", description: "Dream destinations" },
    { path: "/travel-plans", icon: <FiMap size={20} />, label: "Travel Plans", description: "Your itineraries" },
    { path: "/my-posts", icon: <FiInfo size={20} />, label: "My Posts", description: "My posts" },
    { path: "/travel-places", icon: <FiGlobe size={20} />, label: "Travel Places", description: "Travel Places" }   
  ];

  const fetchNotifications = async () => {
    try {
      if (!user?.id) return;
      
      setNotificationsLoading(true);
      const response = await api.get(`/notifications/user/`);
      const notificationData = response.data.data || [];
      
      setNotifications(notificationData);
      const unread = notificationData.filter((n: Notification) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => api.patch(`/notifications/${n.id}/read`))
      );
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate to related post if available
    if (notification.metadata?.post_id) {
      setShowNotifications(false);
      navigate(`/posts/${notification.metadata.post_id}`);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up polling for real-time updates
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('refreshNotifications', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex md:flex-col md:w-64 h-screen bg-white border-r border-slate-200/60 shadow-sm fixed left-0 top-0 z-30">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <img src="compass.png" alt="Travel Buddy" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Travel-Buddy</h1>
                <p className="text-xs text-slate-500">Adventure awaits</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm border border-blue-200/50 scale-[0.98]" 
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:scale-[0.98]"
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "bg-blue-100 text-blue-600 shadow-sm" 
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:scale-105"
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{item.label}</div>
                      <div className="text-xs text-slate-500 truncate">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex-shrink-0 p-6 border-t border-slate-100 space-y-3">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all duration-300 hover:shadow-md group"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <FiBell className="w-5 h-5 text-white" />
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center animate-pulse">
                      <span className="text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-slate-800 truncate">Notifications</div>
                  <div className="text-xs text-slate-500 truncate">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </div>
                </div>
                <FiChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-300 flex-shrink-0 ${showNotifications ? 'rotate-180' : ''}`} />
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200/60 max-h-96 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <FiX size={16} className="text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <FiBell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No notifications yet</p>
                        <p className="text-xs text-slate-400 mt-1">You'll see updates here when they arrive</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const IconComponent = notificationIcons[notification.type] || FiBell;
                        const iconStyles = notificationColors[notification.type];
                        
                        return (
                          <div
                            key={notification.id}
                            className={`group border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-all duration-200 ${
                              !notification.is_read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${iconStyles} flex-shrink-0`}>
                                  <IconComponent size={14} />
                                </div>
                                
                                <div 
                                  className="flex-1 min-w-0"
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-slate-800 text-sm truncate">
                                      {notification.title}
                                    </p>
                                    {!notification.is_read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  
                                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                    {notification.message}
                                  </p>
                                  
                                  {notification.metadata?.post_title && (
                                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                                      📝 {notification.metadata.post_title}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500">
                                      {formatRelativeTime(notification.created_at)}
                                    </p>
                                    
                                    {notification.metadata?.user_name && (
                                      <p className="text-xs text-slate-500 truncate">
                                        by {notification.metadata.user_name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notification.is_read && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                      className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                      title="Mark as read"
                                    >
                                      <FiCheck size={14} className="text-green-600" />
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete notification"
                                  >
                                    <FiTrash2 size={14} className="text-red-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

                        {/* User Profile */}
            <button
              onClick={onToggleSidebar}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all duration-300 hover:shadow-md group"
            >
              <div className="relative flex-shrink-0">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all duration-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-slate-800 truncate text-sm">
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