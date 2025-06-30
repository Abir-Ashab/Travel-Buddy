import { NotificationController } from '../../src/controllers/notification.controller';
import { NotificationService } from '../../src/services/notification.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/notification.service');

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
};

describe('NotificationController', () => {
    let res: Response;

    beforeEach(() => {
        res = mockResponse();
        jest.clearAllMocks();
    });

    it('getNotificationById - should return 404 if not found', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        (NotificationService.getNotificationById as jest.Mock).mockResolvedValue(null);
        const next = jest.fn();
        await NotificationController.getNotificationById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Notification not found' });
    });

    it('getNotificationById - should return notification if found', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        const mockNotification = { id: 1, title: 'Test' };
        (NotificationService.getNotificationById as jest.Mock).mockResolvedValue(mockNotification);
        const next = jest.fn();
        await NotificationController.getNotificationById(req, res, next);

        expect(res.json).toHaveBeenCalledWith({ success: true, data: mockNotification });
    });

    it('createNotification - should return 201 and created notification id', async () => {
        const req = { body: { title: 'Test', user_id: '123' } } as unknown as Request;
        (NotificationService.createNotification as jest.Mock).mockResolvedValue('notif-1');
        const next = jest.fn();
        await NotificationController.createNotification(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { id: 'notif-1' },
            message: 'Notification created successfully',
        });
    });

    it('updateNotification - should return 404 if not found or unauthorized', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        (NotificationService.updateNotification as jest.Mock).mockResolvedValue(null);
        const next = jest.fn();
        await NotificationController.updateNotification(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Notification not found or unauthorized' });
    });

    it('updateNotification - should return updated notification if found', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        const mockNotification = { id: 1, title: 'Updated' };
        (NotificationService.updateNotification as jest.Mock).mockResolvedValue(mockNotification);
        const next = jest.fn();
        await NotificationController.updateNotification(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockNotification,
            message: 'Notification updated successfully',
        });
    });

    it('deleteNotification - should return 404 if not found or unauthorized', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        (NotificationService.deleteNotification as jest.Mock).mockResolvedValue(false);
        const next = jest.fn();
        await NotificationController.deleteNotification(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Notification not found or unauthorized' });
    });

    it('deleteNotification - should return success if deleted', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        (NotificationService.deleteNotification as jest.Mock).mockResolvedValue(true);
        const next = jest.fn();
        await NotificationController.deleteNotification(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Notification deleted successfully',
        });
    });

    it('markAsRead - should return 404 if not found or unauthorized', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        (NotificationService.markAsRead as jest.Mock).mockResolvedValue(false);
        const next = jest.fn();
        await NotificationController.markAsRead(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Notification not found or unauthorized' });
    });

    it('markAsRead - should return success if marked as read', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        (NotificationService.markAsRead as jest.Mock).mockResolvedValue(true);
        const next = jest.fn();
        await NotificationController.markAsRead(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Notification marked as read',
        });
    });

    it('markAllAsRead - should return updated count', async () => {
        const req = { params: { userId: '123' } } as unknown as Request;
        (NotificationService.markAllAsRead as jest.Mock).mockResolvedValue(5);
        const next = jest.fn();
        await NotificationController.markAllAsRead(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { updatedCount: 5 },
            message: '5 notifications marked as read',
        });
    });

    it('getUnreadCount - should return unread count', async () => {
        const req = { params: { userId: '123' } } as unknown as Request;
        (NotificationService.getUnreadCount as jest.Mock).mockResolvedValue(3);
        const next = jest.fn();
        await NotificationController.getUnreadCount(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { count: 3 },
        });
    });

    it('getNotificationsByUser - should return notifications', async () => {
        const req = { params: { userId: '123' }, query: {} } as unknown as Request;
        const mockNotifications = [{ id: 1, title: 'Test' }];
        (NotificationService.getNotificationsByUser as jest.Mock).mockResolvedValue(mockNotifications);
        const next = jest.fn();
        await NotificationController.getNotificationsByUser(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockNotifications,
        });
    });

    it('getNotificationsByType - should return notifications by type', async () => {
        const req = { params: { userId: '123', type: 'info' }, query: {} } as unknown as Request;
        const mockNotifications = [{ id: 1, type: 'info' }];
        (NotificationService.getNotificationsByType as jest.Mock).mockResolvedValue(mockNotifications);
        const next = jest.fn();
        await NotificationController.getNotificationsByType(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockNotifications,
        });
    });

    it('getRecentByType - should return recent notifications by type', async () => {
        const req = { params: { userId: '123', type: 'info' }, query: {} } as unknown as Request;
        const mockNotifications = [{ id: 1, type: 'info' }];
        (NotificationService.getRecentByType as jest.Mock).mockResolvedValue(mockNotifications);
        const next = jest.fn();
        await NotificationController.getRecentByType(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockNotifications,
        });
    });

    it('deleteMultiple - should return 400 if ids not provided', async () => {
        const req = { params: { userId: '123' }, body: { ids: [] } } as unknown as Request;
        const next = jest.fn();
        await NotificationController.deleteMultiple(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Please provide an array of notification IDs',
        });
    });

    it('deleteMultiple - should return deleted count', async () => {
        const req = { params: { userId: '123' }, body: { ids: ['1', '2'] } } as unknown as Request;
        (NotificationService.deleteMultiple as jest.Mock).mockResolvedValue(2);
        const next = jest.fn();
        await NotificationController.deleteMultiple(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { deletedCount: 2 },
            message: '2 notifications deleted successfully',
        });
    });

    it('deleteOldNotifications - should return deleted count', async () => {
        const req = { params: { userId: '123' }, query: {} } as unknown as Request;
        (NotificationService.deleteOldNotifications as jest.Mock).mockResolvedValue(4);
        const next = jest.fn();
        await NotificationController.deleteOldNotifications(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { deletedCount: 4 },
            message: '4 old notifications deleted successfully',
        });
    });

    it('getStatsByType - should return stats', async () => {
        const req = { params: { userId: '123' } } as unknown as Request;
        const mockStats = { info: 2, alert: 1 };
        (NotificationService.getStatsByType as jest.Mock).mockResolvedValue(mockStats);
        const next = jest.fn();
        await NotificationController.getStatsByType(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockStats,
        });
    });
});