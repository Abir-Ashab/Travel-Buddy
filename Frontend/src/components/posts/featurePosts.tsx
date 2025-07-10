import { useEffect, useState } from 'react'
import { FiStar, FiMapPin, FiDollarSign, FiCalendar, FiUser, FiArrowRight, FiImage } from 'react-icons/fi'
import api from '../../services/api'
import DynamicBackground from '../globalFiles/dynamicBackground'

interface FeaturedPost {
  id: string
  title: string
  description: string
  featured_image: string
  total_cost?: number
  duration_days?: number
  user_name: string
  user_profile_picture?: string
  created_at: string
  location: string
  image_gallery?: string[]
}

export default function FeaturedPosts() {
  const [posts, setPosts] = useState<FeaturedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())

  // Function to generate beautiful travel images
  const generateTravelImage = (postId: string, index: number = 0) => {
    const travelCategories = [
      'travel', 'landscape', 'city', 'beach', 'mountain', 'forest', 
      'architecture', 'culture', 'food', 'adventure', 'nature', 'sunset'
    ]
    const category = travelCategories[Math.floor(Math.random() * travelCategories.length)]
    return `https://picsum.photos/600/400?random=${postId}-${index}&${category}`
  }

  const generateImageGallery = (postId: string, count: number = 3) => {
    return Array.from({ length: count }, (_, i) => generateTravelImage(postId, i + 1))
  }

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set(prev).add(imageUrl))
  }

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true)
        const res = await api.get('/posts/featured')
        console.log("featured: ", res)
        const postsWithImages = res.data.data.map((post: FeaturedPost) => ({
          ...post,
          featured_image: post.featured_image || generateTravelImage(post.id),
          image_gallery: post.image_gallery || generateImageGallery(post.id, Math.floor(Math.random() * 4) + 2)
        }))
        setPosts(postsWithImages)
      } catch (err) {
        console.error('Failed to fetch featured posts', err)
        setError('Failed to load featured posts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPosts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"></div>
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-ping opacity-20"></div>
            </div>
            <div className="mt-8 text-center">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full w-48 animate-pulse"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full w-32 mt-3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center items-center h-96">
            <div className="bg-white/80 backdrop-blur-sm border border-red-200 p-8 rounded-2xl shadow-2xl text-center max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center items-center h-96">
            <div className="text-center max-w-lg">
              <div className="relative mx-auto w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-10"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-20"></div>
                <div className="absolute inset-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FiStar className="text-white text-4xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No featured adventures yet</h3>
              <p className="text-gray-600 text-lg">Check back later for incredible travel stories and adventures</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DynamicBackground>
          <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <FiStar className="text-white text-2xl" />
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Featured Adventures
          </h2>
          <p className="text-xl text-white-600 max-w-2xl mx-auto">
            Discover extraordinary journeys and unforgettable experiences from our community of adventurers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-64 overflow-hidden">
                {post.featured_image && !imageLoadErrors.has(post.featured_image) ? (
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    onError={() => handleImageError(post.featured_image)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                    <FiImage className="text-white text-4xl" />
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
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Floating Action Button */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white cursor-pointer">
                  <FiArrowRight className="text-indigo-600 text-xl" />
                </div>
                
                {/* Cost Badge */}
                {post.total_cost && (
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-95 rounded-full shadow-lg backdrop-blur-sm">
                      <FiDollarSign className="text-emerald-600 text-sm" />
                      <span className="font-bold text-emerald-700">${post.total_cost.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Content Section */}
              <div className="p-8">
                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                  {post.description}
                </p>

                {/* User Info */}
                <div className="flex items-center space-x-4 mb-6">
                  {post.user_profile_picture ? (
                    <img 
                      src={post.user_profile_picture} 
                      alt={post.user_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <FiUser className="text-white text-xl" />
                    </div>
                  )}
                  <div>
                    <p className="text-gray-900 font-semibold">{post.user_name}</p>
                    <p className="text-gray-500 text-sm">Adventure Creator</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>

                {/* Stats */}
                <div className="space-y-3">
                  {post.location && (
                    <div className="flex items-center text-gray-600">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                        <FiMapPin className="text-blue-600 text-sm" />
                      </div>
                      <span className="text-sm font-medium">{post.location}</span>
                    </div>
                  )}
                  
                  {post.duration_days && (
                    <div className="flex items-center text-gray-600">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                        <FiCalendar className="text-green-600 text-sm" />
                      </div>
                      <span className="text-sm font-medium">
                        {post.duration_days} {post.duration_days === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  )}
                  
                  {post.total_cost && (
                    <div className="flex items-center text-gray-600">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                        <FiDollarSign className="text-purple-600 text-sm" />
                      </div>
                      <span className="text-sm font-medium">${post.total_cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </DynamicBackground>
  )
}