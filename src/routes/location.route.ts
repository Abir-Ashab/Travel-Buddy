import { Router } from 'express';
import { LocationController } from "../controllers/location.controller";
// import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', LocationController.getAllLocations);
router.get('/search', LocationController.searchLocations);
router.get('/:id', LocationController.getLocationById);
router.post('/', LocationController.createLocation);
router.put('/:id', LocationController.updateLocation);
router.delete('/:id', LocationController.deleteLocation);

export { router as locationRoutes };