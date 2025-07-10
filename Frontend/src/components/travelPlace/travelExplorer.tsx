import { useEffect, useState } from 'react'
import { MapPin, Heart, Plus, Check, X, Search, Filter, Loader, Star, DollarSign, Calendar, TrendingUp, User, Image, Home, Coffee, Truck, Camera, Globe, Navigation } from 'lucide-react'
import api from '../../services/api'
import { wishlistApi, type Wishlist } from '../wishlists/wishlistApi'

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
  description?: string
  total_posts?: number
  total_accommodations?: number
  total_attractions?: number
  total_dining?: number
  total_transport?: number
  featured_image?: string
}

interface WishlistItemFormData {
  priority_level: number
  notes: string
  estimated_budget: number | ""
  preferred_start_date: string
  preferred_end_date: string
  location: {
    name: string
    country: string
    region: string
    latitude: number
    longitude: number
    timezone: string
  }
}

interface AddToWishlistModalProps {
  location: Location
  userWishlists: Wishlist[]
  onClose: () => void
  onAdd: (wishlistId: string, formData: WishlistItemFormData) => Promise<void>
}

const AddToWishlistModal: React.FC<AddToWishlistModalProps> = ({ 
  location, 
  userWishlists, 
  onClose, 
  onAdd 
}) => {
  const [selectedWishlists, setSelectedWishlists] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [addedWishlists, setAddedWishlists] = useState<string[]>([])
  const [formData, setFormData] = useState({
    priority_level: 3,
    notes: '',
    estimated_budget: '',
    preferred_start_date: '',
    preferred_end_date: ''
  })

  const handleWishlistToggle = (wishlistId: string) => {
    setSelectedWishlists(prev => 
      prev.includes(wishlistId)
        ? prev.filter(id => id !== wishlistId)
        : [...prev, wishlistId]
    )
  }

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString.split('T')[0]
    }
  }

  const handleAddToWishlists = async () => {
    if (selectedWishlists.length === 0) return

    setIsAdding(true)
    const successfulAdds: string[] = []

    // Create the wishlist item data with form data
    const wishlistItemData: WishlistItemFormData = {
      priority_level: formData.priority_level,
      notes: formData.notes || `Added ${location.name} from travel dashboard`,
      estimated_budget: formData.estimated_budget !== '' ? Number(formData.estimated_budget) : "",
      preferred_start_date: formatDateForAPI(formData.preferred_start_date),
      preferred_end_date: formatDateForAPI(formData.preferred_end_date),
      location: {
        name: location.name,
        country: location.country,
        region: location.region,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        timezone: location.timezone
      }
    }

    for (const wishlistId of selectedWishlists) {
      try {
        await onAdd(wishlistId, wishlistItemData)
        successfulAdds.push(wishlistId)
      } catch (error) {
        console.error(`Failed to add to wishlist ${wishlistId}:`, error)
      }
    }

    setAddedWishlists(successfulAdds)
    setIsAdding(false)

    if (successfulAdds.length === selectedWishlists.length) {
      setTimeout(() => {
        onClose()
      }, 1500)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Add to Wishlist</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-lg">{location.name}</h4>
          <p className="text-gray-600">{location.region}, {location.country}</p>
          {location.description && (
            <p className="text-sm text-gray-500 mt-1">{location.description}</p>
          )}
        </div>

        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level (1-5)
              </label>
              <select
                value={formData.priority_level}
                onChange={(e) => setFormData({...formData, priority_level: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium Low</option>
                <option value={3}>3 - Medium</option>
                <option value={4}>4 - High</option>
                <option value={5}>5 - Very High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Budget ($)
              </label>
              <input
                type="number"
                value={formData.estimated_budget}
                onChange={(e) => setFormData({...formData, estimated_budget: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Start Date
              </label>
              <input
                type="date"
                value={formData.preferred_start_date}
                onChange={(e) => setFormData({...formData, preferred_start_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred End Date
              </label>
              <input
                type="date"
                value={formData.preferred_end_date}
                onChange={(e) => setFormData({...formData, preferred_end_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this destination..."
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Select wishlists to add to:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {userWishlists.map((wishlist) => (
              <label
                key={wishlist.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedWishlists.includes(wishlist.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  addedWishlists.includes(wishlist.id)
                    ? 'border-green-500 bg-green-50'
                    : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedWishlists.includes(wishlist.id)}
                  onChange={() => handleWishlistToggle(wishlist.id)}
                  className="mr-3"
                  disabled={addedWishlists.includes(wishlist.id)}
                />
                <div className="flex-1">
                  <div className="font-medium">{wishlist.name}</div>
                  {wishlist.description && (
                    <div className="text-sm text-gray-600">{wishlist.description}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {wishlist.itemCount || 0} items
                  </div>
                </div>
                {addedWishlists.includes(wishlist.id) && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isAdding}
          >
            Cancel
          </button>
          <button
            onClick={handleAddToWishlists}
            disabled={selectedWishlists.length === 0 || isAdding}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isAdding ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to {selectedWishlists.length} Wishlist{selectedWishlists.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TravelDashboard() {
  const [locations, setLocations] = useState<Location[]>([])
  const [userWishlists, setUserWishlists] = useState<Wishlist[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'accommodations' | 'attractions' | 'dining' | 'transport'>('all')

  useEffect(() => {
    fetchLocations()
    fetchUserWishlists()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/locations')
      console.log("response: ", response)
      
      if (response.data.success) {
        const locationsWithStats = response.data.data.map((location: Location) => ({
          ...location,
          description: `Explore ${location.name} in ${location.region}, ${location.country}. A beautiful destination with rich culture and amazing experiences.`,
          total_posts: Math.floor(Math.random() * 50) + 1,
          total_accommodations: Math.floor(Math.random() * 20) + 1,
          total_attractions: Math.floor(Math.random() * 30) + 1,
          total_dining: Math.floor(Math.random() * 25) + 1,
          total_transport: Math.floor(Math.random() * 15) + 1,
          featured_image: `https://picsum.photos/400/300?random=${location.id}`
        }))
        setLocations(locationsWithStats)
      }
    } catch (err) {
      console.error('Failed to fetch locations', err)
      setError('Failed to load locations. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserWishlists = async () => {
    try {
      const wishlists = await wishlistApi.getUserWishlists()
      setUserWishlists(wishlists)
    } catch (error) {
      console.error('Error fetching user wishlists:', error)
    }
  }

  const handleAddToWishlist = async (wishlistId: string, formData: WishlistItemFormData) => {
    console.log("Adding to wishlist:", wishlistId, formData)
    await wishlistApi.addWishlistItem(wishlistId, formData)
  }

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.region.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'all') return matchesSearch
    
    switch (filterType) {
      case 'posts':
        return matchesSearch && location.total_posts! > 0
      case 'accommodations':
        return matchesSearch && location.total_accommodations! > 0
      case 'attractions':
        return matchesSearch && location.total_attractions! > 0
      case 'dining':
        return matchesSearch && location.total_dining! > 0
      case 'transport':
        return matchesSearch && location.total_transport! > 0
      default:
        return matchesSearch
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading travel destinations...</p>
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
              <Search className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Destinations</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchLocations}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Travel Places</h1>
          <p className="text-slate-600 mb-8">Discover amazing destinations and add them to your wishlist</p>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              >
                <option value="all">All Destinations</option>
                <option value="posts">With Posts</option>
                <option value="accommodations">With Accommodations</option>
                <option value="attractions">With Attractions</option>
                <option value="dining">With Dining</option>
                <option value="transport">With Transport</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={location.featured_image}
                    alt={location.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => {
                        setSelectedLocation(location)
                        setShowModal(true)
                      }}
                      className="p-2 bg-white bg-opacity-90 rounded-full shadow-md hover:bg-opacity-100 transition-all"
                      disabled={userWishlists.length === 0}
                    >
                      <Heart className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <h3 className="text-xl font-semibold text-slate-800">{location.name}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-600">{location.region}, {location.country}</p>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {location.description}
                  </p>
                  
                  <button
                    onClick={() => {
                      setSelectedLocation(location)
                      setShowModal(true)
                    }}
                    disabled={userWishlists.length === 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Wishlist
                  </button>
                  
                  {userWishlists.length === 0 && (
                    <p className="text-xs text-slate-500 text-center mt-2">
                      Create a wishlist to save destinations
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No destinations found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedLocation && (
        <AddToWishlistModal
          location={selectedLocation}
          userWishlists={userWishlists}
          onClose={() => {
            setShowModal(false)
            setSelectedLocation(null)
          }}
          onAdd={handleAddToWishlist}
        />
      )}
    </div>
  )
}