import { Router } from 'express';
import { ProximityController } from "../controllers/proximity.controller";

const router = Router();

router.get('/settings', ProximityController.getProximitySettings);
router.post('/settings', ProximityController.createProximitySettings);
router.put('/settings', ProximityController.updateProximitySettings);

router.put('/location', ProximityController.updateUserLocation);
router.get('/location', ProximityController.getUserLocation);


router.get('/alerts', ProximityController.getProximityAlerts);
router.get('/alerts/history', ProximityController.getProximityHistory);
router.delete('/alerts/:id', ProximityController.deleteProximityAlert);

// Get live nearby items (wishlists, attractions, etc.) based on current location
router.get('/nearby/wishlists', ProximityController.getNearbyWishlistLocations);
router.get('/nearby/participants', ProximityController.getNearbyTripParticipants);
router.get('/nearby/posts', ProximityController.getNearbyFeaturedPosts);
router.get('/nearby/attractions', ProximityController.getNearbyAttractions);
router.get('/nearby/accommodations', ProximityController.getNearbyAccommodations);
router.get('/nearby/dining', ProximityController.getNearbyDining);

router.post('/process', ProximityController.processProximityAlerts); // create new alerts for all types on user real time location changes

export { router as proximityRoutes };