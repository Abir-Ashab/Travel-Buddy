import { useEffect, useState } from 'react'
import { FiMapPin, FiHome, FiCamera, FiCoffee, FiTruck, FiSearch, FiFilter, FiLoader, FiStar, FiDollarSign, FiCalendar, FiTrendingUp, FiUser, FiImage } from 'react-icons/fi'
import api from '../../services/api'

interface Location {
  id: string
  name: string
  country: string
  region: string
  latitude: string
  longitude: string
  timezone: string
  created_at: string
  geom: string | null
}

interface Post {
  id: string
  title: string
  description: string
  featured_image?: string
  location_id: string
  user_name: string
  user_profile_picture?: string | null
  created_at: string
  total_cost?: number
  duration_days?: number
  effort_level?: number
  likes_count?: number
  saves_count?: number
  shares_count?: number
  media?: any[]
}

interface Accommodation {
  id: string
  name: string
  accommodation_type: string
  cost_per_night: string
  rating: string
  review: string
  notes: string
  amenities: Record<string, boolean>
  check_in_date: string
  check_out_date: string
  post_id: string
}

interface Attraction {
  id: string
  attraction_name: string
  attraction_type: string
  entry_cost: string
  rating: string
  review: string
  time_spent_hours: number
  best_time_to_visit: string
  recommended: boolean
  tips: string
  notes: string
  visit_date: string
  post_id: string
}

interface Dining {
  id: string
  restaurant_name: string
  cuisine_type: string
  meal_type: string
  cost: string
  rating: string
  review: string
  dishes_tried: Record<string, boolean>
  notes: string
  visit_date: string
  post_id: string
}

interface Transport {
  id: string
  transport_type: string
  provider: string
  cost: string
  notes: string
  post_id: string
}

type FilterType = 'all' | 'posts' | 'accommodations' | 'attractions' | 'dining' | 'transport'

export default function TravelExplorer() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [posts, setPosts] = useState<Post[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [dining, setDining] = useState<Dining[]>([])
  const [transport, setTransport] = useState<Transport[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const response = await api.get('/locations')
        console.log("response: ", response);
        
        if (response.data.success) {
          setLocations(response.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch locations', err)
        setError('Failed to load locations. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  useEffect(() => {
    if (selectedLocation) {
      fetchLocationData(selectedLocation.id)
    }
  }, [selectedLocation])

  const fetchLocationData = async (locationId: string) => {
    try {
      setDataLoading(true)
      
      const postsResponse = await api.get(`/posts?location_id=${locationId}`)
      const locationPosts = postsResponse.data.success ? postsResponse.data : []
      console.log("locations post: ", locationPosts);
      
      setPosts(locationPosts.data.posts)

      const postIds = locationPosts.data.posts.map((post: Post) => post.id)
      console.log("postIds: ", postIds)
      if (postIds.length > 0) {
        const [accomData, attractData, diningData, transportData] = await Promise.all([
          Promise.all(postIds.map((id: string) => api.get(`/accomodations/post/${id}`).catch(() => ({ data: [] })))),
          Promise.all(postIds.map((id: string) => api.get(`/attractions/post/${id}`).catch(() => ({ data: [] })))),
          Promise.all(postIds.map((id: string) => api.get(`/dinings/post/${id}`).catch(() => ({ data: [] })))),
          Promise.all(postIds.map((id: string) => api.get(`/transports/post/${id}`).catch(() => ({ data: [] }))))
        ])
        
        console.log("accom: ", accomData);
        console.log("attr: ", attractData)
        setAccommodations(accomData.flatMap(res => res.data.data || []))
        setAttractions(attractData.flatMap(res => res.data.data || []))
        setDining(diningData.flatMap(res => res.data.data || []))
        setTransport(transportData.flatMap(res => res.data.data || []))
      }
    } catch (err) {
      console.error('Failed to fetch location data', err)
    } finally {
      setDataLoading(false)
    }
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.region.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderFilteredData = () => {
    if (dataLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <FiLoader className="animate-spin text-2xl text-blue-600" />
        </div>
      )
    }

    switch (filterType) {
      case 'posts':
        return <PostsList posts={posts} />
      case 'accommodations':
        return <AccommodationsList accommodations={accommodations} />
      case 'attractions':
        return <AttractionsList attractions={attractions} />
      case 'dining':
        return <DiningList dining={dining} />
      case 'transport':
        return <TransportList transport={transport} />
      default:
        return (
          <div className="space-y-8">
            <PostsList posts={posts} />
            <AccommodationsList accommodations={accommodations} />
            <AttractionsList attractions={attractions} />
            <DiningList dining={dining} />
            <TransportList transport={transport} />
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading locations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Locations</h3>
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Travel Places</h1>
          <p className="text-slate-600 mb-6">Discover amazing travel destinations and experiences</p>

          <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`p-6 border rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  selectedLocation?.id === location.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center mb-3">
                  <FiMapPin className="text-blue-600 mr-3 text-lg" />
                  <h3 className="font-semibold text-slate-800 text-lg">{location.name}</h3>
                </div>
                <p className="text-slate-600 font-medium">{location.country}</p>
                <p className="text-sm text-slate-500">{location.region}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedLocation && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-800">
                  {selectedLocation.name}, {selectedLocation.country}
                </h2>
                <div className="flex items-center space-x-3">
                  <FiFilter className="text-slate-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All</option>
                    <option value="posts">Posts</option>
                    <option value="accommodations">Accommodations</option>
                    <option value="attractions">Attractions</option>
                    <option value="dining">Dining</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>
              </div>

              {renderFilteredData()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PostsList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FiCamera className="text-blue-600" />
        Travel Posts ({posts.length})
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {post.user_profile_picture ? (
                  <img
                    src={post.user_profile_picture}
                    alt={post.user_name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-white"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <FiUser className="text-slate-600" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-slate-800">{post.title}</h4>
                  <p className="text-sm text-slate-600">by {post.user_name}</p>
                </div>
              </div>
              
              <p className="text-slate-600 mb-4 line-clamp-3">{post.description}</p>
              
              {post.media && post.media.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiImage className="text-blue-600" />
                    <span className="text-sm text-slate-600">{post.media.length} photos</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-3">
                {post.total_cost && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <FiDollarSign className="text-blue-600 mb-1" />
                    <div className="text-lg font-bold text-blue-700">${post.total_cost}</div>
                    <div className="text-xs text-blue-600">Total Cost</div>
                  </div>
                )}
                {post.duration_days && (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <FiCalendar className="text-emerald-600 mb-1" />
                    <div className="text-lg font-bold text-emerald-700">{post.duration_days}</div>
                    <div className="text-xs text-emerald-600">Days</div>
                  </div>
                )}
                {post.effort_level && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <FiTrendingUp className="text-amber-600 mb-1" />
                    <div className="text-lg font-bold text-amber-700">{post.effort_level}/5</div>
                    <div className="text-xs text-amber-600">Effort Level</div>
                  </div>
                )}
              </div>
              
              {post.likes_count !== undefined && (
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <FiStar className="text-purple-500" />
                    {post.likes_count} likes
                  </span>
                  {post.saves_count !== undefined && (
                    <span>{post.saves_count} saves</span>
                  )}
                  {post.shares_count !== undefined && (
                    <span>{post.shares_count} shares</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AccommodationsList({ accommodations }: { accommodations: Accommodation[] }) {
  if (accommodations.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FiHome className="text-emerald-600" />
        Accommodations ({accommodations.length})
      </h3>
      <div className="space-y-4">
        {accommodations.map((acc) => (
          <div key={acc.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">{acc.name}</h4>
                <p className="text-slate-600 capitalize">{acc.accommodation_type}</p>
                <div className="flex items-center gap-1 mt-1">
                  <FiStar className="text-yellow-500" />
                  <span className="font-medium">{acc.rating}</span>
                </div>
              </div>
              <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                ${acc.cost_per_night}/night
              </span>
            </div>
            
            {acc.review && (
              <p className="text-slate-600 mb-3 italic">"{acc.review}"</p>
            )}
            
            {acc.notes && (
              <p className="text-slate-600 mb-3">{acc.notes}</p>
            )}
            
            <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
              <span>📅 Check-in: {new Date(acc.check_in_date).toLocaleDateString()}</span>
              <span>📅 Check-out: {new Date(acc.check_out_date).toLocaleDateString()}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(acc.amenities).map(([amenity, available]) => (
                available && (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm capitalize"
                  >
                    {amenity.replace('_', ' ')}
                  </span>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AttractionsList({ attractions }: { attractions: Attraction[] }) {
  if (attractions.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FiMapPin className="text-purple-600" />
        Attractions ({attractions.length})
      </h3>
      <div className="space-y-4">
        {attractions.map((attraction) => (
          <div key={attraction.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">{attraction.attraction_name}</h4>
                <p className="text-slate-600 capitalize">{attraction.attraction_type}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-500" />
                    <span className="font-medium">{attraction.rating}</span>
                  </div>
                  {attraction.recommended && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Recommended
                    </span>
                  )}
                </div>
              </div>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
                ${attraction.entry_cost}
              </span>
            </div>
            
            {attraction.review && (
              <p className="text-slate-600 mb-3 italic">"{attraction.review}"</p>
            )}
            
            {attraction.tips && (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-3">
                <p className="text-yellow-800"><strong>Tips:</strong> {attraction.tips}</p>
              </div>
            )}
            
            {attraction.notes && (
              <p className="text-slate-600 mb-3">{attraction.notes}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>⏱️ {attraction.time_spent_hours}h spent</span>
              <span>🕐 Best time: {attraction.best_time_to_visit}</span>
              <span>📅 Visited: {new Date(attraction.visit_date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DiningList({ dining }: { dining: Dining[] }) {
  if (dining.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FiCoffee className="text-amber-600" />
        Dining ({dining.length})
      </h3>
      <div className="space-y-4">
        {dining.map((restaurant) => (
          <div key={restaurant.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">{restaurant.restaurant_name}</h4>
                <p className="text-slate-600">{restaurant.cuisine_type} • {restaurant.meal_type}</p>
                <div className="flex items-center gap-1 mt-1">
                  <FiStar className="text-yellow-500" />
                  <span className="font-medium">{restaurant.rating}</span>
                </div>
              </div>
              <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-medium">
                ${restaurant.cost}
              </span>
            </div>
            
            {restaurant.review && (
              <p className="text-slate-600 mb-3 italic">"{restaurant.review}"</p>
            )}
            
            {restaurant.notes && (
              <p className="text-slate-600 mb-3">{restaurant.notes}</p>
            )}
            
            <div className="mb-3 text-sm text-slate-600">
              📅 Visited: {new Date(restaurant.visit_date).toLocaleDateString()}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(restaurant.dishes_tried).map(([dish, tried]) => (
                tried && (
                  <span
                    key={dish}
                    className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm capitalize"
                  >
                    {dish.replace('_', ' ')}
                  </span>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransportList({ transport }: { transport: Transport[] }) {
  if (transport.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FiTruck className="text-blue-600" />
        Transportation ({transport.length})
      </h3>
      <div className="space-y-4">
        {transport.map((trans) => (
          <div key={trans.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">{trans.transport_type}</h4>
                <p className="text-slate-600">{trans.provider}</p>
              </div>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                ${trans.cost}
              </span>
            </div>
            
            {trans.notes && (
              <p className="text-slate-600">{trans.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}