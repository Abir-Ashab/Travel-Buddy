// components/wishlists/WishlistDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Heart, Users, Settings, Eye, Share2, Edit, Trash2 } from 'lucide-react';
import { wishlistApi, type Wishlist } from './wishlistApi';
import CreateWishlist from './createWishlist';
import WishlistDetails from './wishlistDetails';

const WishlistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [myWishlists, setMyWishlists] = useState<Wishlist[]>([]);
  const [publicWishlists, setPublicWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWishlists();
  }, [activeTab]);

  const loadWishlists = async () => {
    try {
      setLoading(true);
      if (activeTab === 'my') {
        const data = await wishlistApi.getUserWishlists();
        setMyWishlists(data);
      } else {
        const data = await wishlistApi.getPublicWishlists();
        console.log("public wishlist: ", data);
        setPublicWishlists(data);
      }
    } catch (err) {
      setError('Failed to load wishlists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWishlist = async (data: {
      name: string;
      description?: string;
      grouping_type: 'region' | 'theme' | 'budget' | 'season';
      isPublic?: boolean;
    }) => {
    try {
      await wishlistApi.createWishlist(data);
      setShowCreateForm(false);
      if (activeTab === 'my') {
        loadWishlists();
      }
    } catch (err) {
      console.error('Failed to create wishlist:', err);
    }
  };

  const handleDeleteWishlist = async (id: string) => {
    if (confirm('Are you sure you want to delete this wishlist?')) {
      try {
        await wishlistApi.deleteWishlist(id);
        loadWishlists();
      } catch (err) {
        console.error('Failed to delete wishlist:', err);
      }
    }
  };

  const handleShareWishlist = async (id: string) => {
    try {
      const result = await wishlistApi.shareWishlist(id);
      alert(`Wishlist shared! Share link: ${result.share_url}`);
    } catch (err) {
      console.error('Failed to share wishlist:', err);
    }
  };

  const WishlistCard: React.FC<{ wishlist: Wishlist; showActions?: boolean }> = ({ 
    wishlist, 
    showActions = false 
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{wishlist.name}</h3>
          {wishlist.description && (
            <p className="text-gray-600 mt-1">{wishlist.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {wishlist.is_public ? (
            <Users className="h-5 w-5 text-green-500">
              <title>Public</title>
            </Users>
          ) : (
            <Heart className="h-5 w-5 text-red-500">
              <title>Private</title>
            </Heart>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {wishlist.itemCount || wishlist.items?.length || 0} items
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedWishlist(wishlist)}
            className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
          {showActions && (
            <>
              <button
                onClick={() => handleShareWishlist(wishlist.id)}
                className="flex items-center px-3 py-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </button>
              <button
                onClick={() => handleDeleteWishlist(wishlist.id)}
                className="flex items-center px-3 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (selectedWishlist) {
    return (
      <WishlistDetails 
        wishlist={selectedWishlist} 
        onBack={() => setSelectedWishlist(null)}
        onUpdate={loadWishlists}
      />
    );
  }

  if (showCreateForm) {
    return (
      <CreateWishlist
        onSubmit={handleCreateWishlist}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Wishlists</h1>
        {activeTab === 'my' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Wishlist
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'my'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          My Wishlists
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'public'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Public Wishlists
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'my' 
                  ? myWishlists.map((wishlist) => (
                      <WishlistCard 
                        key={wishlist.id} 
                        wishlist={wishlist} 
                        showActions={true}
                      />
                    ))
                  : publicWishlists.map((wishlist) => (
                      <WishlistCard 
                        key={wishlist.id} 
                        wishlist={wishlist} 
                        showActions={false}
                      />
                    ))
                }
                {((activeTab === 'my' && myWishlists.length === 0) || 
                  (activeTab === 'public' && publicWishlists.length === 0)) && (
                  <div className="col-span-full text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-500 mb-2">
                      {activeTab === 'my' ? 'No wishlists yet' : 'No public wishlists found'}
                    </h3>
                    <p className="text-gray-400">
                      {activeTab === 'my' 
                        ? 'Create your first wishlist to get started!'
                        : 'Check back later for public wishlists from other travelers.'
                      }
                </p>
            </div>
        )}
      </div>
      )}
    </div>
  );
};

export default WishlistDashboard;