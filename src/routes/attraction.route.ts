import { Router } from 'express';
import { AttractionController } from "../controllers/attraction.controller"
// import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/post/:postId', AttractionController.getAttractionsByPost);
router.get('/:id', AttractionController.getAttractionById);
router.post('/post/:postId',  AttractionController.createAttraction);
router.put('/:id',  AttractionController.updateAttraction);
router.delete('/:id',  AttractionController.deleteAttraction);

export { router as attractionRoutes };