import { Router } from 'express';
import { AccommodationController } from "../controllers/accommodation.controller";
// import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/post/:postId', AccommodationController.getAccommodationsByPost);
router.get('/:id', AccommodationController.getAccommodationById);
router.post('/post/:postId', AccommodationController.createAccommodation);
router.put('/:id', AccommodationController.updateAccommodation);
router.delete('/:id', AccommodationController.deleteAccommodation);

export { router as accommodationRoutes };