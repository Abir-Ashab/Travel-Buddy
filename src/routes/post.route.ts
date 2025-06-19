import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/',  PostController.getPosts);
router.get('/featured', PostController.getFeaturedPosts);
router.get('/:id', PostController.getPostById);
router.get('/:id/details', PostController.getPostWithDetails);

router.post('/',  PostController.createPost);
router.put('/:id',  PostController.updatePost);
router.delete('/:id', PostController.deletePost);

router.post('/:id/like', PostController.likePost);
router.delete('/:id/like', PostController.unlikePost);
router.post('/:id/save', PostController.savePost);
router.delete('/:id/save', PostController.unsavePost);
router.post('/:id/share', PostController.sharePost);

router.get('/user/my-posts', PostController.getUserPosts);
router.get('/user/liked-posts', PostController.getUserLikedPosts);
router.get('/user/saved-posts', PostController.getUserSavedPosts);

router.post('/:id/report', PostController.reportPost);

router.patch('/:id/feature', PostController.toggleFeaturePost);
router.get('/admin/reports', PostController.getReports);
router.patch('/admin/reports/:reportId/resolve', PostController.resolveReport);

export const createPostRoutes = router;
