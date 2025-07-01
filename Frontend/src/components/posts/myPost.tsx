import { useEffect, useState } from "react";
import api from "../../services/api";
import { 
  FiEdit3, 
  FiTrash2, 
  FiEye, 
  FiLoader, 
  FiAlertCircle, 
  FiPlus,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiStar,
  FiHeart,
  FiBookmark,
  FiShare2,
  FiMoreVertical,
  FiX
} from "react-icons/fi";
import { useOutletContext, Link } from "react-router-dom";

interface MyPost {
  id: string;
  title: string;
  description: string;
  total_cost?: number;
  duration_days?: number;
  effort_level?: number;
  is_featured: boolean;
  status: string;
  likes_count: number;
  saves_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  author_id?: string;
  user_id?: string;
  created_by?: string;
}

interface User {
  id?: string;
  role: string;
  name?: string;
  email?: string;
}

export default function MyPosts() {
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const { user } = useOutletContext<{ user: User | null }>();

  async function fetchMyPosts() {
    setLoading(true);
    try {
      // Fetch all posts from the general posts endpoint
      const res = await api.get("/posts");
      const allPosts = res.data.data.posts || res.data.posts || [];
      
      // Filter posts to show only the current user's posts
      // This assumes the post has author_id, user_id, or created_by field that matches current user's id
      const myPosts = allPosts.filter((post: MyPost) => {
        // Check different possible field names for the post author
        const postAuthorId = post.author_id || post.user_id || post.created_by;
        const currentUserId = user?.id;
        
        return postAuthorId === currentUserId;
      });
      
      setPosts(myPosts);
      
      // Clear error if successful
      setError(null);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setError("Failed to load your posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(postId: string) {
    setDeleteLoading(postId);
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
      setShowDeleteModal(null);
    } catch (err) {
      console.error("Failed to delete post", err);
      setError("Failed to delete post. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "private":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getEffortColor = (level?: number) => {
    if (!level) return "bg-gray-100 text-gray-600";
    if (level <= 2) return "bg-emerald-100 text-emerald-700";
    if (level <= 3) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getEffortLabel = (level?: number) => {
    if (!level) return "Not specified";
    if (level <= 2) return "Easy";
    if (level <= 3) return "Moderate";
    return "Challenging";
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  // Delete Modal Component
  const DeleteModal = ({ postId, postTitle }: { postId: string; postTitle: string }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <FiTrash2 className="text-red-600" size={18} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Delete Story</h3>
        </div>
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete "<span className="font-medium">{postTitle}</span>"? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowDeleteModal(null)}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            disabled={deleteLoading === postId}
          >
            Cancel
          </button>
          <button
            onClick={() => deletePost(postId)}
            disabled={deleteLoading === postId}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleteLoading === postId ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Action Menu Component
  const ActionMenu = ({ post }: { post: MyPost }) => (
    <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
      <Link
        to={`/posts/${post.id}`}
        className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
        onClick={() => setActionMenuOpen(null)}
      >
        <FiEye size={16} />
        View Details
      </Link>
      <Link
        to={`/edit-post/${post.id}`}
        className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
        onClick={() => setActionMenuOpen(null)}
      >
        <FiEdit3 size={16} />
        Edit Story
      </Link>
      <button
        onClick={() => {
          setShowDeleteModal(post.id);
          setActionMenuOpen(null);
        }}
        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
      >
        <FiTrash2 size={16} />
        Delete Story
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                My Travel Stories
              </h1>
              <p className="text-slate-600 mt-2">Manage and track your shared adventures</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/create-post"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FiPlus size={18} />
                New Story
              </Link>
              <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                <span className="text-sm font-medium text-slate-600">
                  {posts.length} {posts.length === 1 ? "story" : "stories"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-slate-600 mt-4 font-medium">Loading your stories...</p>
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
                onClick={fetchMyPosts}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiEdit3 className="text-blue-500 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No stories yet</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Ready to share your first adventure? Your story could inspire someone's next journey!
            </p>
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FiPlus size={18} />
              Create Your First Story
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors">
                          <Link to={`/posts/${post.id}`}>{post.title}</Link>
                        </h3>
                        {post.is_featured && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            <FiStar size={12} />
                            Featured
                          </div>
                        )}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === post.id ? null : post.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <FiMoreVertical size={18} />
                      </button>
                      {actionMenuOpen === post.id && <ActionMenu post={post} />}
                    </div>
                  </div>

                  {/* Post Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {post.total_cost && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <FiDollarSign className="text-green-600" size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">${post.total_cost}</p>
                          <p className="text-xs text-slate-500">Total Cost</p>
                        </div>
                      </div>
                    )}
                    {post.duration_days && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiCalendar className="text-blue-600" size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{post.duration_days} days</p>
                          <p className="text-xs text-slate-500">Duration</p>
                        </div>
                      </div>
                    )}
                    {post.effort_level && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FiTrendingUp className="text-orange-600" size={14} />
                        </div>
                        <div>
                          <p className={`font-medium text-xs px-2 py-1 rounded-full ${getEffortColor(post.effort_level)}`}>
                            {getEffortLabel(post.effort_level)}
                          </p>
                          <p className="text-xs text-slate-500">Effort Level</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-purple-600" size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{formatDate(post.created_at)}</p>
                        <p className="text-xs text-slate-500">Created</p>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <FiHeart size={16} />
                        <span className="font-medium">{post.likes_count}</span>
                        <span>likes</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <FiBookmark size={16} />
                        <span className="font-medium">{post.saves_count}</span>
                        <span>saves</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <FiShare2 size={16} />
                        <span className="font-medium">{post.shares_count}</span>
                        <span>shares</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/posts/${post.id}`}
                        className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
                      >
                        View
                      </Link>
                      <Link
                        to={`/edit-post/${post.id}`}
                        className="px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors font-medium text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteModal 
            postId={showDeleteModal} 
            postTitle={posts.find(p => p.id === showDeleteModal)?.title || ""}
          />
        )}

        {/* Click outside to close action menu */}
        {actionMenuOpen && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setActionMenuOpen(null)}
          />
        )}
      </div>
    </div>
  );
}