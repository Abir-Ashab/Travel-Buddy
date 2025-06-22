import { Router } from 'express';
import {WishlistController} from '../controllers/wishlist.controller';

const router = Router();

router.post('/', WishlistController.createWishlist);
router.get('/my-wishlists', WishlistController.getUserWishlists);
router.get('/public', WishlistController.getPublicWishlists);
router.get('/:id', WishlistController.getWishlistById);
router.put('/:id', WishlistController.updateWishlist);
router.delete('/:id', WishlistController.deleteWishlist);

router.post('/:id/share', WishlistController.shareWishlist);
router.get('/shared/:id', WishlistController.getSharedWishlist);

router.post('/:wishlistId/items', WishlistController.addWishlistItem);
router.put('/items/:itemId', WishlistController.updateWishlistItem);
router.delete('/items/:itemId', WishlistController.deleteWishlistItem);

export { router as wishlistRoutes };
