import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FiSave,
  FiX,
  FiLoader,
  FiAlertCircle,
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiEye,
  FiEyeOff,
  FiStar
} from "react-icons/fi";

interface PostData {
  id: string;
  title: string;
  description: string;
  total_cost?: number;
  duration_days?: number;
  effort_level?: number;
  is_featured: boolean;
  status: string;
}

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<PostData>({
    id: "",
    title: "",
    description: "",
    total_cost: undefined,
    duration_days: undefined,
    effort_level: 1,
    is_featured: false,
    status: "draft"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!post.title.trim()) {
      newErrors.title = "Title is required";
    } else if (post.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (post.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }
    if (!post.description.trim()) {
      newErrors.description = "Description is required";
    } else if (post.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (post.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    if (post.total_cost && post.total_cost < 0) {
      newErrors.total_cost = "Cost cannot be negative";
    }

    if (post.duration_days && (post.duration_days < 1 || post.duration_days > 365)) {
      newErrors.duration_days = "Duration must be between 1 and 365 days";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchPost = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log("id: ", id);
      
      const response = await api.get(`/posts/${id}`);
      const postData = response.data.data;
      console.log(postData)
      setPost({
        id: postData.id,
        title: postData.title || "",
        description: postData.description || "",
        total_cost: parseInt(postData.total_cost) || undefined,
        duration_days: postData.duration_days || undefined,
        effort_level: postData.effort_level || 1,
        is_featured: postData.is_featured || false,
        status: postData.status || "draft"
      });
    } catch (err: any) {
      console.error("Failed to fetch post", err);
      setError(err.response?.data?.message || "Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      console.log("post is: ", post);
      
      await api.put(`/posts/${id}`, {
        title: post.title.trim(),
        description: post.description.trim(),
        total_cost: post.total_cost ? Number(post.total_cost) : undefined,
        duration_days: post.duration_days || null,
        effort_level: post.effort_level,
        is_featured: post.is_featured,
        status: post.status
      });
      
      navigate("/my-posts", { 
        state: { message: "Post updated successfully!" }
      });
    } catch (err: any) {
      console.error("Failed to update post", err);
      setError(err.response?.data?.message || "Failed to update post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PostData, value: any) => {
    setPost(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error && !post.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Post</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => navigate("/my-posts")}
                className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Go Back
              </button>
              <button 
                onClick={fetchPost}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/my-posts")}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Edit Story
              </h1>
              <p className="text-slate-600 mt-1">Update your travel adventure</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/my-posts")}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FiLoader className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <FiAlertCircle className="text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3">
                Basic Information
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter your story title..."
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-300 bg-red-50" : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {errors.title}
                  </p>
                )}
                <p className="text-slate-500 text-sm mt-1">
                  {post.title.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={post.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Tell us about your travel experience..."
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                    errors.description ? "border-red-300 bg-red-50" : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {errors.description}
                  </p>
                )}
                <p className="text-slate-500 text-sm mt-1">
                  {post.description.length}/2000 characters
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3">
                Trip Details
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FiDollarSign className="inline mr-1" size={16} />
                    Total Cost (USD)
                  </label>
                  <input
                    type="number"
                    value={post.total_cost || ""}
                    onChange={(e) => handleInputChange("total_cost", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.total_cost ? "border-red-300 bg-red-50" : "border-slate-300 focus:border-blue-500"
                    }`}
                  />
                  {errors.total_cost && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errors.total_cost}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FiCalendar className="inline mr-1" size={16} />
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={post.duration_days || ""}
                    onChange={(e) => handleInputChange("duration_days", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    min="1"
                    max="365"
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.duration_days ? "border-red-300 bg-red-50" : "border-slate-300 focus:border-blue-500"
                    }`}
                  />
                  {errors.duration_days && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      {errors.duration_days}
                    </p>
                  )}
                </div>

                {/* Effort Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FiTrendingUp className="inline mr-1" size={16} />
                    Effort Level
                  </label>
                  <select
                    value={post.effort_level}
                    onChange={(e) => handleInputChange("effort_level", Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>1 - Very Easy</option>
                    <option value={2}>2 - Easy</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Challenging</option>
                    <option value={5}>5 - Very Challenging</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3">
                Settings
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Publication Status
                  </label>
                  <select
                    value={post.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="private">Private</option>
                  </select>
                  <p className="text-slate-500 text-sm mt-1">
                    {post.status === "draft" && "Save as draft to continue editing later"}
                    {post.status === "published" && "Visible to all users"}
                    {post.status === "private" && "Only visible to you"}
                  </p>
                </div>

                {/* Featured Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Special Settings
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={post.is_featured}
                        onChange={(e) => handleInputChange("is_featured", e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <FiStar className="text-yellow-500" size={16} />
                        <span className="font-medium text-slate-800">Featured Story</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}