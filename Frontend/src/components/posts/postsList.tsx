import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FiAlertCircle, FiUser, FiZap, FiCalendar, FiDollarSign, FiTrendingUp, FiEye } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";

interface Post {
  id: string;
  title: string;
  description: string;
  total_cost?: number;
  duration_days?: number;
  effort_level?: number;
  user_name?: string;
  user_profile_picture?: string | null;
  created_at?: string;
}

interface User {
  role: string;
  name?: string;
  email?: string;
}

export default function PostsList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useOutletContext<{ user: User | null }>();

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(res.data.data.posts);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEffortColor = (level?: number) => {
    if (!level) return "bg-gray-100 text-gray-600";
    if (level <= 2) return "bg-emerald-100 text-emerald-700";
    if (level <= 3) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getEffortLabel = (level?: number) => {
    if (!level) return "Unknown";
    if (level <= 2) return "Easy";
    if (level <= 3) return "Moderate";
    return "Challenging";
  };

  const handleViewDetails = (postId: string) => {
    navigate(`/posts/${postId}`);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Travel Stories
              </h1>
              <p className="text-slate-600 mt-2">Discover amazing adventures from fellow travelers</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                <span className="text-sm font-medium text-slate-600">
                  {posts.length} {posts.length === 1 ? "story" : "stories"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-slate-600 mt-4 font-medium">Loading amazing stories...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="text-red-500 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchPosts}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiZap className="text-blue-500 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No stories yet</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              {user?.role === "traveler"
                ? "Ready to share your first adventure? Your story could inspire someone's next journey!"
                : "Upgrade to Traveler status to share your incredible experiences with the community"}
            </p>
            {user?.role === "traveler" && (
              <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Share Your Story
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/50"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {post.user_profile_picture ? (
                          <img
                            src={post.user_profile_picture}
                            alt={post.user_name}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <FiUser className="text-slate-500 text-lg" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{post.user_name || "Anonymous Traveler"}</p>
                        {post.created_at && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <FiCalendar className="text-xs" />
                            <span className="text-sm">{formatDate(post.created_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {post.total_cost && (
                      <div className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200">
                        <FiDollarSign className="text-emerald-600 text-sm" />
                        <span className="font-bold text-emerald-700">${post.total_cost}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    {post.duration_days && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                        <FiCalendar className="text-blue-600 text-sm" />
                        <span className="text-sm font-medium text-blue-700">
                          {post.duration_days} {post.duration_days === 1 ? "day" : "days"}
                        </span>
                      </div>
                    )}
                    {post.effort_level && (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getEffortColor(post.effort_level)} border-opacity-50`}>
                        <FiTrendingUp className="text-sm" />
                        <span className="text-sm font-medium">
                          {getEffortLabel(post.effort_level)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleViewDetails(post.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FiEye className="text-sm" />
                      View Details
                    </button>
                  </div>
                </div>

                {/* Hover Effect Bar */}
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}