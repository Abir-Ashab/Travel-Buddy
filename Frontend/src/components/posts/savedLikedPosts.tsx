import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  FiAlertCircle, 
  FiUser, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp, 
  FiEye,
  FiHeart,
  FiBookmark,
  FiFlag,
  FiShare2,
  FiMoreVertical,
  FiGrid,
  FiList
} from "react-icons/fi";
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
  likes_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
  is_featured?: boolean;
}

interface User {
  role: string;
  name?: string;
  email?: string;
}

type TabType = 'saved' | 'liked';

export default function SavedLikedPosts() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('saved');
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const { user } = useOutletContext<{ user: User | null }>();

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts/user/saved-posts");
      setSavedPosts(res.data.data.posts || []);
    } catch (err) {
      console.error("Failed to fetch saved posts", err);
      setError("Failed to load saved posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts/user/liked-posts");
      setLikedPosts(res.data.data.posts || []);
    } catch (err) {
      console.error("Failed to fetch liked posts", err);
      setError("Failed to load liked posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'saved' && savedPosts.length === 0) {
      fetchSavedPosts();
    } else if (tab === 'liked' && likedPosts.length === 0) {
      fetchLikedPosts();
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    
    setActionLoading(`like-${postId}`);
    try {
      if (isLiked) {
        await api.delete(`/posts/${postId}/like`);
      } else {
        await api.post(`/posts/${postId}/like`);
      }
      
      // Update both arrays
      const updatePost = (post: Post) => 
        post.id === postId
          ? {
              ...post,
              is_liked: !isLiked,
              likes_count: isLiked 
                ? (post.likes_count || 0) - 1 
                : (post.likes_count || 0) + 1
            }
          : post;

      setSavedPosts(prev => prev.map(updatePost));
      setLikedPosts(prev => prev.map(updatePost));
      
      // If unliking from liked tab, remove from array
      if (activeTab === 'liked' && isLiked) {
        setLikedPosts(prev => prev.filter(post => post.id !== postId));
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
      setError("Failed to update like status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (postId: string, isSaved: boolean) => {
    if (!user) return;
    
    setActionLoading(`save-${postId}`);
    try {
      if (isSaved) {
        await api.delete(`/posts/${postId}/save`);
      } else {
        await api.post(`/posts/${postId}/save`);
      }
      
      // Update both arrays
      const updatePost = (post: Post) => 
        post.id === postId
          ? { ...post, is_saved: !isSaved }
          : post;

      setSavedPosts(prev => prev.map(updatePost));
      setLikedPosts(prev => prev.map(updatePost));
      
      // If unsaving from saved tab, remove from array
      if (activeTab === 'saved' && isSaved) {
        setSavedPosts(prev => prev.filter(post => post.id !== postId));
      }
    } catch (err) {
      console.error("Failed to toggle save", err);
      setError("Failed to update save status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async (postId: string) => {
    setActionLoading(`share-${postId}`);
    try {
      await api.post(`/posts/${postId}/share`);
      
      const postUrl = `${window.location.origin}/posts/${postId}`;
      await navigator.clipboard.writeText(postUrl);
      
      alert("Post link copied to clipboard!");
    } catch (err) {
      console.error("Failed to share post", err);
      setError("Failed to share post. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReport = async (postId: string) => {
    if (!user || (user.role !== "admin" && user.role !== "traveler")) {
      alert("You need to be a traveler or admin to report posts.");
      return;
    }

    const reportReasons = [
      { value: 'spam', label: 'Spam' },
      { value: 'inappropriate', label: 'Inappropriate Content' },
      { value: 'false_info', label: 'False Information' },
    ];

    const reason = prompt(
      `Please select a reason for reporting this post:\n\n` +
      reportReasons.map((r, i) => `${i + 1}. ${r.label}`).join('\n') +
      `\n\nEnter the number (1-3):`
    );

    if (!reason) return;

    const reasonIndex = parseInt(reason) - 1;
    if (reasonIndex < 0 || reasonIndex >= reportReasons.length) {
      alert("Please enter a valid number between 1 and 4.");
      return;
    }

    const selectedReason = reportReasons[reasonIndex].value;

    const description = prompt("Please provide additional details about the issue:");
    if (!description) return;

    setActionLoading(`report-${postId}`);
    try {
      await api.post(`/posts/${postId}/report`, { 
        reason: selectedReason,
        description: description || undefined
      });
      alert("Post reported successfully. Thank you for helping keep our community safe.");
      setShowDropdown(null);
    } catch (err) {
      console.error("Failed to report post", err);
      setError("Failed to report post. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

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

  const formatLikesCount = (count?: number) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  };

  const getCurrentPosts = () => {
    return activeTab === 'saved' ? savedPosts : likedPosts;
  };

  const getCurrentPostsCount = () => {
    return activeTab === 'saved' ? savedPosts.length : likedPosts.length;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Fetch saved posts by default
    fetchSavedPosts();
  }, [user, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Saved & Liked
              </h1>
              <p className="text-slate-600 mt-2">Your saved and liked travel stories</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                <span className="text-sm font-medium text-slate-600">
                  {getCurrentPostsCount()} {getCurrentPostsCount() === 1 ? "story" : "stories"}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-sm border border-slate-200">
            <button
              onClick={() => handleTabChange('saved')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FiBookmark className="text-sm" />
              Saved Posts
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === 'saved' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {savedPosts.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('liked')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'liked'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FiHeart className="text-sm" />
              Liked Posts
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === 'liked' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {likedPosts.length}
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-slate-600 mt-4 font-medium">
              Loading your {activeTab} stories...
            </p>
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
                onClick={() => {
                  setError(null);
                  activeTab === 'saved' ? fetchSavedPosts() : fetchLikedPosts();
                }}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : getCurrentPosts().length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
              activeTab === 'saved' 
                ? 'bg-gradient-to-br from-blue-50 to-indigo-100' 
                : 'bg-gradient-to-br from-red-50 to-pink-100'
            }`}>
              {activeTab === 'saved' ? (
                <FiBookmark className="text-blue-500 text-3xl" />
              ) : (
                <FiHeart className="text-red-500 text-3xl" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              No {activeTab} stories yet
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              {activeTab === 'saved' 
                ? "Start saving stories that inspire you! Use the bookmark button on any post to save it here."
                : "Like posts that resonate with you! Use the heart button on any post to add it to your liked collection."
              }
            </p>
            <button 
              onClick={() => navigate('/posts')}
              className={`px-8 py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
              }`}
            >
              Explore Stories
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {getCurrentPosts().map((post, index) => (
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
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{post.user_name || "Anonymous Traveler"}</p>
                          {post.is_featured && (
                            <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                              FEATURED
                            </span>
                          )}
                        </div>
                        {post.created_at && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <FiCalendar className="text-xs" />
                            <span className="text-sm">{formatDate(post.created_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {post.total_cost && (
                        <div className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200">
                          <FiDollarSign className="text-emerald-600 text-sm" />
                          <span className="font-bold text-emerald-700">${post.total_cost}</span>
                        </div>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(showDropdown === post.id ? null : post.id);
                          }}
                          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <FiMoreVertical className="text-slate-500" />
                        </button>
                        {showDropdown === post.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
                            <div className="py-2">
                              <button
                                onClick={() => handleShare(post.id)}
                                disabled={actionLoading === `share-${post.id}`}
                                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 transition-colors disabled:opacity-50"
                              >
                                <FiShare2 className="text-slate-500" />
                                <span className="text-slate-700">Share</span>
                              </button>
                              {user && (user.role === "admin" || user.role === "traveler") && (
                                <button
                                  onClick={() => handleReport(post.id)}
                                  disabled={actionLoading === `report-${post.id}`}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <FiFlag className="text-red-500" />
                                  <span className="text-red-700">Report</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
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

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id, post.is_liked || false)}
                        disabled={actionLoading === `like-${post.id}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 ${
                          post.is_liked
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        }`}
                      >
                        <FiHeart className={`text-sm ${post.is_liked ? "fill-current" : ""}`} />
                        <span>{formatLikesCount(post.likes_count)}</span>
                      </button>
                      <button
                        onClick={() => handleSave(post.id, post.is_saved || false)}
                        disabled={actionLoading === `save-${post.id}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 ${
                          post.is_saved
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        }`}
                      >
                        <FiBookmark className={`text-sm ${post.is_saved ? "fill-current" : ""}`} />
                        <span>{post.is_saved ? "Saved" : "Save"}</span>
                      </button>
                    </div>
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
    </div>
  );
}