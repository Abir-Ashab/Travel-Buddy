import { Link, useLocation } from "react-router-dom";
import { FiHome, FiGlobe, FiPlusSquare, FiList, FiMap, FiInfo, FiUser, FiSettings, FiChevronDown } from "react-icons/fi";

interface User {
  name?: string;
  email?: string;
  role?: string;
  profile_picture?: string;
}

interface NavbarProps {
  user: User | null;
  onToggleSidebar: () => void;
}

export default function Navbar({ user, onToggleSidebar }: NavbarProps) {
  const location = useLocation();
  
  const navItems = [
    { path: "/posts", icon: <FiHome size={20} />, label: "Stories", description: "Discover adventures" },
    { path: "/create-post", icon: <FiPlusSquare size={20} />, label: "Create", description: "Share your journey" },
    { path: "/wishlists", icon: <FiList size={20} />, label: "Wishlist", description: "Dream destinations" },
    { path: "/travel-plans", icon: <FiMap size={20} />, label: "Travel Plans", description: "Your itineraries" },
    { path: "/my-posts", icon: <FiInfo size={20} />, label: "My Posts", description: "My posts" },
    { path: "/travel-places", icon: <FiGlobe size={20} />, label: "Travel Places", description: "Travel Places" }   
  ];

  return (
    <>
      <nav className="hidden md:flex md:flex-col md:w-64 md:min-h-screen bg-white border-r border-slate-200/60 shadow-sm fixed left-0 top-0 z-30">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <img src="compass.png" alt="" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Travel-Buddy</h1>
                <p className="text-xs text-slate-500">Adventure awaits</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
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
                    <div className="flex-1">
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100">
            <button
              onClick={onToggleSidebar}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all duration-300 hover:shadow-md group"
            >
              <div className="relative">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-slate-800 truncate">
                  {user?.name || "Guest User"}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {user?.email || "guest@example.com"}
                </div>
              </div>
              <FiChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-300 group-hover:rotate-180" />
            </button>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-2xl">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? "text-blue-600 bg-blue-50 scale-95" 
                    : "text-slate-600 hover:scale-95"
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 mb-1 ${
                  isActive 
                    ? "bg-blue-100 shadow-sm" 
                    : "bg-transparent hover:bg-slate-100"
                }`}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-1 animate-pulse"></div>
                )}
              </Link>
            );
          })}

          <button
            onClick={onToggleSidebar}
            className="flex flex-col items-center p-3 rounded-2xl transition-all duration-300 text-slate-600 hover:scale-95"
          >
            <div className="p-2 rounded-xl transition-all duration-300 mb-1 bg-transparent hover:bg-slate-100 relative">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <FiUser size={20} />
              )}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}