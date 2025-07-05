import { Router } from 'express';
import { MediaController } from "../controllers/media.controller"
import { authMiddleware } from "../middlewares/auth.middleware";
import { USER_Role } from "../interfaces/user.interface";
import { uploadMiddleware } from "../middlewares/upload.middleware"

const router = Router();

router.get(
    '/post/:postId',
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    MediaController.getMediaByPost
);

router.get(
    '/:id',
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    MediaController.getMediaById
);

router.post(
    '/post/:postId',
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    uploadMiddleware.single('image'),
    MediaController.createMedia
);

router.put(
    '/:id',
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    uploadMiddleware.single('image'),
    MediaController.updateMedia
);

router.delete(
    '/:id',
    authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER, USER_Role.TRAVELER),
    MediaController.deleteMedia
);

export { router as mediaRoutes };
