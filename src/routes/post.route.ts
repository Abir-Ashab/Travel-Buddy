// src/routes/post.routes.ts
import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { USER_Role } from '../interfaces/user.interface';

const router = Router();

// Public routes
router.get('/', postController.getAllPosts);
router.get('/featured', postController.getFeaturedPosts);
router.get('/trending', postController.getTrendingPosts);
router.get('/:id', postController.getPost);

// User routes
router.get('/:id/saved', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.getSavedPosts);
router.post('/:id/like', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.toggleLike);
router.get('/:id/likes', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.getPostLikes);
router.post('/:id/save', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.toggleSave);
router.post('/:id/report', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.reportPost);
router.post('/:id/share', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.sharePost);

// Traveler only routes
router.post('/', authMiddleware(USER_Role.TRAVELER, USER_Role.ADMIN, USER_Role.SUPER_ADMIN), postController.createPost);
router.put('/:id', authMiddleware(USER_Role.TRAVELER, USER_Role.ADMIN, USER_Role.SUPER_ADMIN), postController.updatePost);

export const createPostRoutes = router;