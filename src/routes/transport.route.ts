import { Router } from 'express';
import { TransportController } from "../controllers/transport.controller"
// import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/post/:postId', TransportController.getTransportsByPost);
router.get('/:id', TransportController.getTransportById);
router.post('/post/:postId', TransportController.createTransport);
router.put('/:id', TransportController.updateTransport);
router.delete('/:id', TransportController.deleteTransport);

export { router as transportRoutes };