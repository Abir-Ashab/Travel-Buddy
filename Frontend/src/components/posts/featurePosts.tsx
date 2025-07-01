import { useEffect, useState } from 'react'
import api from '../../services/api'
import { FiStar, FiMapPin, FiDollarSign, FiCalendar, FiUser } from 'react-icons/fi'
import { Link } from 'react-router-dom'

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
}

export default function FeaturedPosts() {
  const [posts, setPosts] = useState<FeaturedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true)
        const res = await api.get('/posts/featured')
        console.log("featured: ", res)
        setPosts(res.data.data)
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center max-w-md">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center max-w-md">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiStar className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">No featured posts yet</h3>
          <p className="text-gray-500 mt-1">Check back later for featured travel adventures</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flex items-center justify-center">
          <FiStar className="text-yellow-500 mr-2" />
          Featured Adventures
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition w-full max-w-md">
            {post.featured_image && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.featured_image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                  <Link to={`/posts/${post.id}`} className="hover:text-indigo-600">
                    {post.title}
                  </Link>
                </h3>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {post.description}
              </p>

              <div className="flex items-center space-x-3 mb-4">
                {post.user_profile_picture ? (
                  <img 
                    src={post.user_profile_picture} 
                    alt={post.user_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <FiUser className="text-gray-500" />
                  </div>
                )}
                <span className="text-sm text-gray-700">{post.user_name}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2 text-sm">
                  {post.location && (
                    <span className="flex items-center text-gray-600">
                      <FiMapPin className="mr-1" /> {post.location}
                    </span>
                  )}
                  {post.duration_days && (
                    <span className="flex items-center text-gray-600">
                      <FiCalendar className="mr-1" /> {post.duration_days} {post.duration_days === 1 ? 'day' : 'days'}
                    </span>
                  )}
                  {post.total_cost && (
                    <span className="flex items-center text-gray-600">
                      <FiDollarSign className="mr-1" /> ${post.total_cost.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}