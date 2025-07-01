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
          <div className="pb-20 md:pb-0">
            <Outlet context={{ user }} />
          </div>
        </main>
        <Sidebar user={user} />
      </div>
    </div>
  );
}