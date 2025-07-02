import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import api from "../../services/api";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface User {
  name?: string;
  email?: string;
  role?: string;
  profile_picture?: string;
}

export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/users/profile");
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Loading TravelStory</h2>
            <p className="text-slate-600">Preparing your adventure dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex">
        <Navbar />
        <main className="flex-1 min-h-screen relative">
            <button
              onClick={toggleSidebar}
              className="fixed top-7 left-6 z-40 items-center justify-center w-10 h-10 rounded-full border border-slate-200 shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-200 transition-all"
            > 
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                    />
                  </svg>
                </div>
              )}
            </button>


          <div className="pb-20 md:pb-0">
            <Outlet context={{ user }} />
          </div>
        </main>
        
        {/* Conditional Sidebar */}
        {sidebarOpen && (
          <Sidebar 
            user={user} 
            isOpen={sidebarOpen} 
            onClose={closeSidebar} 
          />
        )}
      </div>
    </div>
  );
}