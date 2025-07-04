import React, { useState, useEffect } from 'react';
import { Plus, Heart, Users, Navigation } from 'lucide-react';
import { wishlistApi, type Wishlist } from './wishlistApi';
import CreateWishlist from './createWishlist';
import WishlistDetails from './wishlistDetails';
import WishlistCard from './wishlistCard';
import NearbyWishlistComponent from './NearbyWishlist';

const WishlistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'public' | 'nearby'>('my');
  const [myWishlists, setMyWishlists] = useState<Wishlist[]>([]);
  const [publicWishlists, setPublicWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'my' || activeTab === 'public') {
      loadWishlists();
    }
  }, [activeTab]);

  const loadWishlists = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 'my') {
        const data = await wishlistApi.getUserWishlists();
        setMyWishlists(data);
      } else if (activeTab === 'public') {
        const data = await wishlistApi.getPublicWishlists();
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
      if (activeTab === 'my') loadWishlists();
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wishlists</h1>
              <p className="text-gray-600 mt-1">Discover and organize your dream destinations</p>
            </div>
            {activeTab === 'my' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Wishlist
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-2 mb-8">
          <div className="flex space-x-1">
            {[
              { tab: 'my', label: 'My Wishlists', Icon: Heart },
              { tab: 'public', label: 'Public Wishlists', Icon: Users },
              { tab: 'nearby', label: 'Nearby Wishlists', Icon: Navigation },
            ].map(({ tab, label, Icon }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading && (activeTab !== 'nearby') ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading wishlists...</p>
            </div>
          </div>
        ) : error && (activeTab !== 'nearby') ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadWishlists}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            {activeTab === 'nearby' && (
              <NearbyWishlistComponent />
            )}

            {(activeTab === 'my' || activeTab === 'public') && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                {((activeTab === 'my' && myWishlists.length === 0) ||
                  (activeTab === 'public' && publicWishlists.length === 0)) ? (
                  <div className="text-center py-16">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-500 mb-2">
                      {activeTab === 'my' ? 'No wishlists yet' : 'No public wishlists found'}
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      {activeTab === 'my'
                        ? 'Create your first wishlist to get started!'
                        : 'Check back later for public wishlists or create your own and share!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeTab === 'my' ? myWishlists : publicWishlists).map((wishlist) => (
                      <WishlistCard
                        key={wishlist.id}
                        wishlist={wishlist}
                        showActions={activeTab === 'my'}
                        onView={setSelectedWishlist}
                        onShare={handleShareWishlist}
                        onDelete={handleDeleteWishlist}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistDashboard;
