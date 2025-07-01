import { Link, useLocation } from "react-router-dom";
import { FiHome, FiPlusSquare, FiList, FiMap, FiUser, FiCompass, FiInfo } from "react-icons/fi";

export default function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: "/posts", icon: <FiHome size={20} />, label: "Stories", description: "Discover adventures" },
    { path: "/create-post", icon: <FiPlusSquare size={20} />, label: "Create", description: "Share your journey" },
    { path: "/wishlists", icon: <FiList size={20} />, label: "Wishlist", description: "Dream destinations" },
    { path: "/travel-plans", icon: <FiMap size={20} />, label: "Plans", description: "Your itineraries" },
    { path: "/my-posts", icon: <FiInfo size={20} />, label: "My Posts", description: "My posts" },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex md:flex-col md:w-64 md:min-h-screen bg-white border-r border-slate-200/60 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <FiCompass className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">TravelBuddy</h1>
              <p className="text-xs text-slate-500">Adventure awaits</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm border border-blue-200/50" 
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-colors ${
                    isActive 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="mt-auto p-6">
          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">Share Your Story</h3>
            <p className="text-sm text-slate-600 mb-3">Inspire others with your adventures</p>
            <Link 
              to="/create-post" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              <FiPlusSquare size={14} />
              Create Post
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-2xl">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-slate-600"
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors mb-1 ${
                  isActive 
                    ? "bg-blue-100" 
                    : "bg-transparent"
                }`}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}