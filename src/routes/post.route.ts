// src/routes/post.routes.ts
import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth';
import { USER_Role } from '../interfaces/user.interface';

const router = Router();

// Public routes
router.get('/', postController.getAllPosts);
router.get('/featured', postController.getFeaturedPosts);
router.get('/trending', postController.getTrendingPosts);
router.get('/:id', postController.getPost);

// Protected routes (require authentication)
// router.use(authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER));

// User routes
router.get('/saved', postController.getSavedPosts);
router.post('/:id/like', postController.toggleLike);
router.get('/:id/likes', postController.getPostLikes);
router.post('/:id/save', postController.toggleSave);
router.post('/:id/report', postController.reportPost);
router.post('/:id/share', postController.sharePost);

// Traveler only routes
router.post('/', postController.createPost);
router.put('/:id', authMiddleware(USER_Role.TRAVELER), postController.updatePost);


export const createPostRoutes = router;