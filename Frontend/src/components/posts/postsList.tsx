import { useEffect, useState } from "react";
import api from "../../services/api";
import CreatePost from "./createPost";
import { useNavigate } from "react-router-dom";
import { FiPlusCircle, FiLoader, FiAlertCircle, FiUser, FiZap } from "react-icons/fi";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  async function fetchUserProfile() {
    try {
      const res = await api.get("/users/profile");
      setUser(res.data.data);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      setUser(null);
    }
  }

  const navigate = useNavigate();
  const handleUpgrade = () => {
    navigate('/upgrade-traveler');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Travel Experiences</h1>
          <p className="text-gray-600">
            {user ? `Welcome back, ${user.name || "Traveler"}!` : "Loading profile..."}
          </p>
        </div>
        
        {user?.role === "traveler" && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FiPlusCircle size={18} />
            {showCreateForm ? "Cancel" : "New Post"}
          </button>
        )}
      </header>

      {/* Create Post Form */}
      {showCreateForm && user?.role === "traveler" && (
        <div className="mb-8">
          <CreatePost 
            onPostCreated={() => {
              fetchPosts();
              setShowCreateForm(false);
            }} 
          />
        </div>
      )}

      {/* Upgrade Banner */}
      {user?.role === "explorer" && (
        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-800 mb-1">
                <FiZap className="text-amber-600" />
                Upgrade Your Account
              </h3>
              <p className="text-amber-700">
                Traveler status allows you to create and share your own adventure posts.
              </p>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg transition min-w-[180px]"
            >
              {upgrading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiZap />
                  Upgrade to Traveler
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-3 text-red-600">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Posts Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Adventures
          </h2>
          <div className="text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <FiLoader className="animate-spin text-gray-400 text-2xl" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg text-red-600">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiUser className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No posts yet</h3>
            <p className="text-gray-500 mt-1">
              {user?.role === "traveler"
                ? "Be the first to share your adventure!"
                : "Upgrade to Traveler to share your experiences"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {post.user_profile_picture ? (
                      <img
                        src={post.user_profile_picture}
                        alt={post.user_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{post.user_name || "Anonymous"}</p>
                      {post.created_at && (
                        <p className="text-xs text-gray-500">
                          {formatDate(post.created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  {post.total_cost && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      ${post.total_cost}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.description}</p>

                <div className="flex flex-wrap gap-3 text-sm">
                  {post.duration_days && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {post.duration_days} {post.duration_days === 1 ? "day" : "days"}
                    </span>
                  )}
                  {post.effort_level && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                      Effort: {post.effort_level}/5
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}