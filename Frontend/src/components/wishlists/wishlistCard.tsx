import React from 'react';
import { Eye, Share2, Trash2, Heart, Users } from 'lucide-react';
import { type Wishlist } from './wishlistApi';

interface WishlistCardProps {
  wishlist: Wishlist;
  showActions?: boolean;
  onView: (wishlist: Wishlist) => void;
  onShare?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const WishlistCard: React.FC<WishlistCardProps> = ({
  wishlist,
  showActions = false,
  onView,
  onShare,
  onDelete,
}) => {
  return (
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
            onClick={() => onView(wishlist)}
            className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
          {showActions && (
            <>
              <button
                onClick={() => onShare && onShare(wishlist.id)}
                className="flex items-center px-3 py-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </button>
              <button
                onClick={() => onDelete && onDelete(wishlist.id)}
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
};

export default WishlistCard;
