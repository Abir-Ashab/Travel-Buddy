import { Router } from 'express';
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

router.get('/user/:userId', NotificationController.getNotificationsByUser);
router.get('/:id', NotificationController.getNotificationById);
router.post('/', NotificationController.createNotification);
router.put('/:id', NotificationController.updateNotification);
router.delete('/:id', NotificationController.deleteNotification);
router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/user/:userId/read-all', NotificationController.markAllAsRead);
router.get('/user/:userId/unread-count', NotificationController.getUnreadCount);
router.get('/user/:userId/type/:type', NotificationController.getNotificationsByType);
router.get('/user/:userId/recent/:type', NotificationController.getRecentByType);
router.delete('/user/:userId/bulk', NotificationController.deleteMultiple);
router.delete('/user/:userId/cleanup', NotificationController.deleteOldNotifications);
router.get('/user/:userId/stats', NotificationController.getStatsByType);

export { router as notificationRoutes };
