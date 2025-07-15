import { useState, useEffect } from "react";
import { FiImage, FiPlus, FiTrash2, FiSave, FiX, FiUpload, FiEye } from "react-icons/fi";
import api from "../../services/api";

interface Media {
  id?: string;
  post_id: string;
  image_url?: string;
  file?: File;
}

interface MediaDetailsProps {
  postId: string;
  onClose: () => void;
}

export default function MediaDetails({ postId, onClose }: MediaDetailsProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch existing media for the post
  const fetchMedia = async () => {
    try {
      const response = await api.get(`/medias/post/${postId}`);
      setMedia(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch media:", err);
      setError("Failed to load existing media");
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [postId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} is not a valid image type`);
        return false;
      }
      
      if (file.size > maxSize) {
        setError(`${file.name} is too large (max 10MB)`);
        return false;
      }
      
      return true;
    });
    
    setNewFiles(prevFiles => [...prevFiles, ...validFiles]);
    setError(null);
  };

  const removeNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const deleteExistingMedia = async (mediaId: string) => {
    try {
      await api.delete(`/medias/${mediaId}`);
      setMedia(media.filter(m => m.id !== mediaId));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to delete media");
    }
  };

  const uploadNewFiles = async () => {
    if (newFiles.length === 0) return;

    setUploadLoading(true);
    setError(null);

    try {
      const uploadPromises = newFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await api.post(`/medias/post/${postId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data.data;
      });

      await Promise.all(uploadPromises);
      
      setSuccess(true);
      setNewFiles([]);
      await fetchMedia(); // Refresh media list
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload media");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await uploadNewFiles();
  };

  return (
    <div className="fixed ml-[15%] inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FiImage className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Media Gallery</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <FiX className="text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <FiSave className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">Media Updated Successfully!</h3>
                <p className="text-emerald-700 text-sm">Your media has been saved to your post.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Existing Media */}
          {media.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Current Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {media.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden">
                      <img
                        src={item.image_url}
                        alt="Media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-2xl flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={() => window.open(item.image_url, '_blank')}
                          className="p-2 bg-white rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => item.id && deleteExistingMedia(item.id)}
                          className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* File Upload Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Media</h3>
              
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <FiUpload className="text-blue-600 text-2xl" />
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium mb-2">Upload Images</p>
                    <p className="text-slate-500 text-sm mb-4">
                      Supported formats: JPEG, PNG, GIF, WebP (Max 10MB each)
                    </p>
                    <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors cursor-pointer">
                      <FiPlus />
                      Choose Files
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview New Files */}
            {newFiles.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">New Files to Upload</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-black bg-opacity-75 text-white p-2 rounded-lg">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-xs text-slate-300">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              {newFiles.length > 0 && (
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className={`px-6 py-3 rounded-2xl font-semibold text-white transition-colors ${
                    uploadLoading 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {uploadLoading ? 'Uploading...' : `Upload ${newFiles.length} File${newFiles.length > 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}