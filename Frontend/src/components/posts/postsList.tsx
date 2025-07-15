import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  FiAlertCircle, 
  FiUser, 
  FiZap, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp, 
  FiEye,
  FiHeart,
  FiBookmark,
  FiFlag,
  FiShare2,
  FiMoreVertical,
  FiImage
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
  featured_image?: string;
  image_gallery?: string[];
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const { user } = useOutletContext<{ user: User | null }>();

  const generateTravelImage = (postId: string, index: number = 0) => {
    const travelCategories = [
      'travel', 'landscape', 'city', 'beach', 'mountain', 'forest', 
      'architecture', 'culture', 'food', 'adventure', 'nature', 'sunset'
    ];
    const category = travelCategories[Math.floor(Math.random() * travelCategories.length)];
    return `https://picsum.photos/600/400?random=${postId}-${index}&${category}`;
  };

  const generateImageGallery = (postId: string, count: number = 3) => {
    return Array.from({ length: count }, (_, i) => generateTravelImage(postId, i + 1));
  };

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      const postsWithImages = res.data.data.posts.map((post: Post) => ({
        ...post,
        featured_image: generateTravelImage(post.id),
        image_gallery: generateImageGallery(post.id, Math.floor(Math.random() * 4) + 2)
      }));
      setPosts(postsWithImages);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set(prev).add(imageUrl));
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
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                is_liked: !isLiked,
                likes_count: isLiked 
                  ? (post.likes_count || 0) - 1 
                  : (post.likes_count || 0) + 1
              }
            : post
        )
      );
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
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, is_saved: !isSaved }
            : post
        )
      );
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
      { value: 'false_info', label: 'False Information' }
    ];

    const reason = prompt(
      `Please select a reason for reporting this post:\n\n` +
      reportReasons.map((r, i) => `${i + 1}. ${r.label}`).join('\n') +
      `\n\nEnter the number (1-3):`
    );

    if (!reason) return;

    const reasonIndex = parseInt(reason) - 1;
    if (reasonIndex < 0 || reasonIndex >= reportReasons.length) {
      alert("Please enter a valid number between 1 and 3.");
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

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
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
                onClick={() => {
                  setError(null);
                  fetchPosts();
                }}
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
                {/* Featured Image Section */}
                <div className="relative h-64 md:h-80 overflow-hidden">
                  {post.featured_image && !imageLoadErrors.has(post.featured_image) ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(post.featured_image!)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <FiImage className="text-slate-400 text-4xl" />
                    </div>
                  )}
                  
                  {/* Image Gallery Preview */}
                  {post.image_gallery && post.image_gallery.length > 0 && (
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      {post.image_gallery.slice(0, 3).map((img, imgIndex) => (
                        <div
                          key={imgIndex}
                          className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm opacity-80 hover:opacity-100 transition-opacity"
                        >
                          {!imageLoadErrors.has(img) ? (
                            <img
                              src={img}
                              alt={`Gallery ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(img)}
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                              <FiImage className="text-slate-400 text-xs" />
                            </div>
                          )}
                        </div>
                      ))}
                      {post.image_gallery.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                          +{post.image_gallery.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Featured Badge */}
                  {post.is_featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
                        FEATURED
                      </span>
                    </div>
                  )}

                  {/* Cost Badge */}
                  {post.total_cost && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-90 rounded-full shadow-lg">
                        <FiDollarSign className="text-emerald-600 text-sm" />
                        <span className="font-bold text-emerald-700">${post.total_cost}</span>
                      </div>
                    </div>
                  )}
                </div>

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
                        </div>
                        {post.created_at && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <FiCalendar className="text-xs" />
                            <span className="text-sm">{formatDate(post.created_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
                      {user && (
                        <>
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
                        </>
                      )}
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
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}