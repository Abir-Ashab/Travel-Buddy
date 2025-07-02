import { useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiLogOut, FiX, FiSettings, FiBell, FiHelpCircle } from "react-icons/fi";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

interface User {
  name?: string;
  email?: string;
  role?: string;
  profile_picture?: string;
}

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
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

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`} 
        onClick={onClose} 
      />
      
      {/* Sidebar */}
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
                <p className="text-sm font-medium text-slate-700">Jan 2024</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-200/60">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">12</div>
              <div className="text-xs text-slate-500">Stories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">45</div>
              <div className="text-xs text-slate-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">8</div>
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

          <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-200 group">
            <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
              <FiSettings className="text-slate-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-slate-800">Settings</div>
              <div className="text-sm text-slate-500">Preferences & privacy</div>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-200 group">
            <div className="p-2 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
              <FiBell className="text-amber-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-slate-800">Notifications</div>
              <div className="text-sm text-slate-500">Manage alerts</div>
            </div>
          </button>

          {/* <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-200 group">
            <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
              <FiHelpCircle className="text-emerald-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-slate-800">Help & Support</div>
              <div className="text-sm text-slate-500">Get assistance</div>
            </div>
          </button> */}
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