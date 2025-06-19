import { Router } from 'express';
import { DiningController } from '../controllers/dining.controller';
// import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/post/:postId', DiningController.getDiningsByPost);
router.get('/:id', DiningController.getDiningById);
router.post('/post/:postId',  DiningController.createDining);
router.put('/:id',  DiningController.updateDining);
router.delete('/:id',  DiningController.deleteDining);

export { router as diningRoutes };