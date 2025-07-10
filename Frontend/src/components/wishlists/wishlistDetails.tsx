// components/wishlists/WishlistDetails.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, MapPin, DollarSign, Calendar, Star, Loader2 } from 'lucide-react';
import { wishlistApi, type Wishlist } from './wishlistApi';
import WishlistItemForm from './wishlistItemForm';
import { useParams } from 'react-router-dom';

interface WishlistItem {
  id: string;
  priority_level: number;
  notes: string;
  estimated_budget?: number;
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
  createdAt?: string;
}

interface WishlistItemFormData {
  priority_level: number;
  notes: string;
  estimated_budget: number | '';
  preferred_start_date: string;
  preferred_end_date: string;
  location: {
    name: string;
    country: string;
    region: string;
    latitude: number | '';
    longitude: number | '';
    timezone: string;
  };
}

interface WishlistDetailsProps {
  wishlist: Wishlist | null;
  wishlistId?: string;
  onBack: () => void;
  onUpdate: () => void;
}

const WishlistDetails: React.FC<WishlistDetailsProps> = ({ 
  wishlist: initialWishlist, 
  wishlistId, 
  onBack, 
  onUpdate 
}) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(initialWishlist);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!initialWishlist);
  const [error, setError] = useState<string | null>(null);

  const refreshWishlist = async () => {
    if (!wishlistId && !wishlist?.id) return;
    
    try {
      setError(null);
      const id = wishlistId || wishlist?.id;
      const fetchedWishlist = await wishlistApi.getWishlistById(id!);
      setWishlist(fetchedWishlist);
      setItems(fetchedWishlist.items || []);
    } catch (err) {
      console.error('Failed to refresh wishlist:', err);
      setError('Failed to refresh wishlist. Please try again.');
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      // If no wishlist ID available, show error
      if (!wishlistId && !initialWishlist?.id) {
        setError('No wishlist ID provided');
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        setError(null);
        const id = wishlistId || initialWishlist?.id;
        const fetchedWishlist = await wishlistApi.getWishlistById(id!);
        setWishlist(fetchedWishlist);
        setItems(fetchedWishlist.items || []);
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
        setError('Failed to load wishlist. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };

    // Always fetch from API to get latest data
    fetchWishlist();
  }, [wishlistId, initialWishlist?.id]);

  const handleAddItem = async (formData: WishlistItemFormData) => {
    if (!wishlist) return;

    try {
      setLoading(true);
      setError(null);
      
      const apiPayload: WishlistItemFormData = {
        priority_level: formData.priority_level,
        notes: formData.notes,
        estimated_budget: formData.estimated_budget === '' ? '' : Number(formData.estimated_budget),
        preferred_start_date: formData.preferred_start_date,
        preferred_end_date: formData.preferred_end_date,
        location: {
          name: formData.location.name,
          country: formData.location.country,
          region: formData.location.region,
          latitude: formData.location.latitude === '' ? 0 : Number(formData.location.latitude),
          longitude: formData.location.longitude === '' ? 0 : Number(formData.location.longitude),
          timezone: formData.location.timezone
        }
      };

      const newItem = await wishlistApi.addWishlistItem(wishlist.id, apiPayload);
      
      // Update items state optimistically
      setItems(prev => {
        const updatedItems = [...prev, newItem];
        console.log('Items updated:', updatedItems);
        return updatedItems;
      });
      
      // Update wishlist state to reflect the new item
      setWishlist(prev => prev ? {
        ...prev,
        items: [...(prev.items || []), newItem]
      } : null);
      
      setShowAddForm(false);
      
      // Refresh from server to ensure consistency
      await refreshWishlist();
      
      onUpdate();
    } catch (error) {
      console.error('Failed to add item:', error);
      setError('Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (formData: WishlistItemFormData) => {
    if (!editingItem) return;

    try {
      setLoading(true);
      setError(null);
      
      const apiPayload: WishlistItemFormData = {
        priority_level: formData.priority_level,
        notes: formData.notes,
        estimated_budget: formData.estimated_budget === '' ? '' : Number(formData.estimated_budget),
        preferred_start_date: formData.preferred_start_date,
        preferred_end_date: formData.preferred_end_date,
        location: {
          name: formData.location.name,
          country: formData.location.country,
          region: formData.location.region,
          latitude: formData.location.latitude === '' ? 0 : Number(formData.location.latitude),
          longitude: formData.location.longitude === '' ? 0 : Number(formData.location.longitude),
          timezone: formData.location.timezone
        }
      };

      const updatedItem = await wishlistApi.updateWishlistItem(editingItem.id, apiPayload);
      
      // Update items state optimistically
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ));
      
      // Update wishlist state
      setWishlist(prev => prev ? {
        ...prev,
        items: prev.items?.map(item => 
          item.id === editingItem.id ? updatedItem : item
        )
      } : null);
      
      setEditingItem(null);
      
      // Refresh from server to ensure consistency
      await refreshWishlist();
      
      onUpdate(); 
    } catch (error) {
      console.error('Failed to update item:', error);
      setError('Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      setLoading(true);
      setError(null);
      await wishlistApi.deleteWishlistItem(itemId);
      
      // Update items state optimistically
      setItems(prev => prev.filter(item => item.id !== itemId));
      
      // Update wishlist state
      setWishlist(prev => prev ? {
        ...prev,
        items: prev.items?.filter(item => item.id !== itemId)
      } : null);
      
      // Refresh from server to ensure consistency
      await refreshWishlist();
      
      onUpdate();
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError('Failed to delete item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityDisplay = (level: number) => {
    switch (level) {
      case 1:
        return { text: 'Low Priority', color: 'text-gray-500', stars: '★' };
      case 2:
        return { text: 'Medium Priority', color: 'text-yellow-500', stars: '★★' };
      case 3:
        return { text: 'High Priority', color: 'text-red-500', stars: '★★★' };
      default:
        return { text: 'Unknown', color: 'text-gray-400', stars: '?' };
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate && !endDate) return null;
    
    const start = startDate ? new Date(startDate).toLocaleDateString() : '';
    const end = endDate ? new Date(endDate).toLocaleDateString() : '';
    
    if (start && end) {
      return start === end ? start : `${start} - ${end}`;
    }
    return start || end;
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading wishlist...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !wishlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
        <div className="text-center text-red-600 py-12">
          <p className="text-lg mb-2">Error loading wishlist</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No wishlist found
  if (!wishlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">Wishlist not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{wishlist.name}</h1>
            {wishlist.description && (
              <p className="text-gray-600 mt-1">{wishlist.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          Add Item
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <WishlistItemForm
            onSubmit={handleAddItem}
            onCancel={() => setShowAddForm(false)}
            loading={loading}
          />
        </div>
      )}

      {editingItem && (
        <div className="mb-8">
          <WishlistItemForm
            isEditing={true}
            editingItem={editingItem}
            onSubmit={handleUpdateItem}
            onCancel={() => setEditingItem(null)}
            loading={loading}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const priority = getPriorityDisplay(item.priority_level);
          const dateRange = formatDateRange(item.preferred_start_date, item.preferred_end_date);
          
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <div className={`flex items-center text-sm font-medium ${priority.color}`}>
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  {priority.text}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  {item.location?.name || ''}
                </h3>
                
                <div className="text-sm text-gray-600 mb-3">
                  {item.location?.region && (
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                      {item.location.region}
                    </span>
                  )}
                  <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                    {item.location?.country || ''}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.notes}</p>
                )}
                <div className="space-y-2 mb-4">
                  {item.estimated_budget && (
                    <div className="flex items-center text-sm text-green-600 font-medium">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {typeof item.estimated_budget === 'number' 
                        ? item.estimated_budget.toLocaleString(undefined, { 
                            style: 'currency', 
                            currency: 'USD' 
                          })
                        : `$${item.estimated_budget}`
                      }
                    </div>
                  )}
                  
                  {dateRange && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {dateRange}
                    </div>
                  )}
                  
                  {item.createdAt && (
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      Added {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-3 border-t">
                  <button
                    onClick={() => setEditingItem(item)}
                    disabled={loading}
                    className="p-2 rounded-full hover:bg-gray-100 text-blue-600 transition-colors disabled:opacity-50"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={loading}
                    className="p-2 rounded-full hover:bg-gray-100 text-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {items.length === 0 && !initialLoading && (
          <div className="col-span-full text-center text-gray-500 py-12">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No items in this wishlist yet</p>
            <p className="text-sm">Click "Add Item" to start building your wishlist!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistDetails;