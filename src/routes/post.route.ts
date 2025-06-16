import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { USER_Role } from '../interfaces/user.interface';

const router = Router();

router.get('/', postController.getAllPosts);
router.get('/featured', postController.getFeaturedPosts);
router.get('/trending', postController.getTrendingPosts);

router.get('/:id/saved', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.getSavedPosts);
router.post('/:id/like', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.toggleLike);
router.get('/:id/likes', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.getPostLikes);
router.post('/:id/save', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER), postController.toggleSave);

router.post('/', authMiddleware(USER_Role.TRAVELER, USER_Role.ADMIN, USER_Role.SUPER_ADMIN), postController.createPost);
router.put('/:id', authMiddleware(USER_Role.TRAVELER, USER_Role.ADMIN, USER_Role.SUPER_ADMIN), postController.updatePost);
router.post('/:id/report', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.TRAVELER), postController.reportPost);
router.post('/:id/share', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.TRAVELER), postController.sharePost); 

router.delete('/:id', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN), postController.deletePost);
router.get('/reported', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN), postController.getReportedPosts);
router.put('/reports/:id', authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN), postController.updateReportStatus);

router.get('/:id', postController.getPost); // It must be the last route to avoid conflicts
export const createPostRoutes = router;

