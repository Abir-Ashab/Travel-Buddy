import { useEffect, useState } from 'react';
import { MapPin, Navigation, Globe, Clock, Heart, Map, Plus, Check } from 'lucide-react';
import api from '../../services/api';
import { wishlistApi, type Wishlist } from './wishlistApi';

interface Location {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface WishlistItem {
  id: string;
  name: string;
  priority_level: number;
  notes: string;
  estimated_budget: number | null;
  preferred_start_date: string;
  preferred_end_date: string;
  location: Location;
  distance_km: number;
}

interface WishlistItemFormData {
  priority_level: number;
  notes: string;
  estimated_budget: number | ""; // Changed from number | null to number | ""
  preferred_start_date: string;
  preferred_end_date: string;
  location: {
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

interface AddToWishlistModalProps {
  item: WishlistItem;
  userWishlists: Wishlist[];
  onClose: () => void;
  onAdd: (wishlistId: string, item: WishlistItem) => Promise<void>;
}

const AddToWishlistModal: React.FC<AddToWishlistModalProps> = ({ 
  item, 
  userWishlists, 
  onClose, 
  onAdd 
}) => {
  const [selectedWishlists, setSelectedWishlists] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [addedWishlists, setAddedWishlists] = useState<string[]>([]);

  const handleWishlistToggle = (wishlistId: string) => {
    setSelectedWishlists(prev => 
      prev.includes(wishlistId)
        ? prev.filter(id => id !== wishlistId)
        : [...prev, wishlistId]
    );
  };

  const handleAddToWishlists = async () => {
    if (selectedWishlists.length === 0) return;

    setIsAdding(true);
    const successfulAdds: string[] = [];

    for (const wishlistId of selectedWishlists) {
      try {
        await onAdd(wishlistId, item);
        successfulAdds.push(wishlistId);
      } catch (error) {
        console.error(`Failed to add to wishlist ${wishlistId}:`, error);
      }
    }

    setAddedWishlists(successfulAdds);
    setIsAdding(false);

    // Close modal after 2 seconds if all additions were successful
    if (successfulAdds.length === selectedWishlists.length) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Add to Wishlist</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm text-gray-600">{item.location.name}</p>
          <p className="text-xs text-gray-500">
            {item.location.region}, {item.location.country}
          </p>
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
  );
};

const NearbyWishlistComponent: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [userWishlists, setUserWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchNearbyWishlists();
    fetchUserWishlists();
  }, []);

  const fetchNearbyWishlists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('proximity/nearby/wishlists');
      console.log("nearby wishlists: ", response);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setWishlistItems(response.data.data);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching nearby wishlists:', error);
      setError('Failed to fetch nearby wishlists');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWishlists = async () => {
    try {
      const wishlists = await wishlistApi.getUserWishlists();
      setUserWishlists(wishlists);
    } catch (error) {
      console.error('Error fetching user wishlists:', error);
    }
  };

const handleAddToWishlist = async (wishlistId: string, item: any) => {
  const formatDateForAPI = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; 
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString.split('T')[0]; 
    }
  };
  console.log("item is: ", item);
  
  const wishlistItemData: any = {
    priority_level: item.priority_level,
    notes: item.notes,
    estimated_budget: item.estimated_budget !== null && item.estimated_budget !== undefined ? Number(item.estimated_budget) : "",
    preferred_start_date: formatDateForAPI(item.preferred_start_date),
    preferred_end_date: formatDateForAPI(item.preferred_end_date),
    location: {
      name: item.location.name,
      country: item.location.country,
      region: item.location.region,
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      timezone: item.location.timezone
    }
  };
  console.log("final item: ", wishlistItemData);
  await wishlistApi.addWishlistItem(wishlistId, wishlistItemData);
};

  const handleItemClick = (item: WishlistItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getDistanceColor = (distance: number) => {
    if (distance < 1) return 'text-green-600';
    if (distance < 5) return 'text-blue-600';
    if (distance < 10) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading nearby wishlists...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
        <button 
          onClick={fetchNearbyWishlists}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Nearby Wishlist</h2>
        </div>
        <span className="text-sm text-gray-500">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'location' : 'locations'}
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Map className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No nearby wishlists</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add locations to your wishlist to see them here when you're nearby!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Navigation className={`h-4 w-4 ${getDistanceColor(item.distance_km)}`} />
                    <span className={`text-sm font-medium ${getDistanceColor(item.distance_km)}`}>
                      {formatDistance(item.distance_km)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleItemClick(item)}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={userWishlists.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{item.location.name}</span>
                </div>
                
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{item.location.region}, {item.location.country}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <span>
                    {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {wishlistItems.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={fetchNearbyWishlists}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Refresh Location
          </button>
        </div>
      )}

      {showModal && selectedItem && (
        <AddToWishlistModal
          item={selectedItem}
          userWishlists={userWishlists}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
          onAdd={handleAddToWishlist}
        />
      )}
    </div>
  );
};

export default NearbyWishlistComponent;