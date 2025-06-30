import { NotificationService } from '../../src/services/notification.service';
import { notificationModel } from '../../src/repositories/notification.repository';
import {
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationStats,
  ProximityNotificationPayload,
} from '../../src/interfaces/notification.interface';

jest.mock('../../src/repositories/notification.repository');

const mockNotification: Notification = {
  id: 'notif1',
  user_id: 'user1',
  title: 'Test Title',
  message: 'Test Message',
  type: 'like',
  is_read: false,
  created_at: new Date('2024-06-01T10:00:00Z'),
  metadata: { foo: 'bar' },
};

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotificationsByUser', () => {
    it('should return notifications for a user', async () => {
      (notificationModel.findByUserId as jest.Mock).mockResolvedValue([mockNotification]);
      const result = await NotificationService.getNotificationsByUser('user1', 10, 0, false);
      expect(result).toEqual([mockNotification]);
      expect(notificationModel.findByUserId).toHaveBeenCalledWith('user1', 10, 0, false);
    });
  });

  describe('getNotificationById', () => {
    it('should return a notification by id', async () => {
      (notificationModel.findById as jest.Mock).mockResolvedValue(mockNotification);
      const result = await NotificationService.getNotificationById('notif1');
      expect(result).toEqual(mockNotification);
      expect(notificationModel.findById).toHaveBeenCalledWith('notif1');
    });

    it('should return null if notification not found', async () => {
      (notificationModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await NotificationService.getNotificationById('notfound');
      expect(result).toBeNull();
    });
  });

  describe('createNotification', () => {
    const validData: CreateNotificationRequest = {
      user_id: 'user1',
      title: 'Test Title',
      message: 'Test Message',
      type: 'like',
    };

    it('should create a notification and return its id', async () => {
      (notificationModel.create as jest.Mock).mockResolvedValue('notif1');
      const result = await NotificationService.createNotification(validData);
      expect(notificationModel.create).toHaveBeenCalledWith(validData);
      expect(result).toBe('notif1');
    });

    it('should throw error for invalid type', async () => {
      await expect(
        NotificationService.createNotification({ ...validData, type: 'invalid' as any })
      ).rejects.toThrow('Invalid notification type');
    });

    it('should throw error if required fields are missing', async () => {
      await expect(
        NotificationService.createNotification({ ...validData, user_id: '' })
      ).rejects.toThrow('User ID, title, and message are required');
      await expect(
        NotificationService.createNotification({ ...validData, title: '' })
      ).rejects.toThrow('User ID, title, and message are required');
      await expect(
        NotificationService.createNotification({ ...validData, message: '' })
      ).rejects.toThrow('User ID, title, and message are required');
    });

    it('should throw error for duplicate proximity alert', async () => {
      const proximityData: CreateNotificationRequest = {
        user_id: 'user1',
        title: 'Proximity Alert',
        message: 'You are near!',
        type: 'proximity_alert',
        metadata: {
          location_id: 'loc1',
          trigger_type: 'wishlist_location',
        },
      };
      (notificationModel.findDuplicateProximityAlert as jest.Mock).mockResolvedValue(mockNotification);
      await expect(NotificationService.createNotification(proximityData)).rejects.toThrow(
        'Duplicate proximity alert detected. Please wait before sending another alert for this location.'
      );
    });
  });

  describe('updateNotification', () => {
    const updateData: UpdateNotificationRequest = { title: 'Updated', type: 'save' };

    it('should update and return updated notification', async () => {
      (notificationModel.findById as jest.Mock)
        .mockResolvedValueOnce(mockNotification)
        .mockResolvedValueOnce({ ...mockNotification, ...updateData });
      (notificationModel.update as jest.Mock).mockResolvedValue(undefined);

      const result = await NotificationService.updateNotification('notif1', 'user1', updateData);
      expect(result).toEqual({ ...mockNotification, ...updateData });
      expect(notificationModel.update).toHaveBeenCalledWith('notif1', 'user1', updateData);
    });

    it('should return null if notification not found or not owned by user', async () => {
      (notificationModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await NotificationService.updateNotification('notfound', 'user1', updateData);
      expect(result).toBeNull();

      (notificationModel.findById as jest.Mock).mockResolvedValue({ ...mockNotification, user_id: 'other' });
      const result2 = await NotificationService.updateNotification('notif1', 'user1', updateData);
      expect(result2).toBeNull();
    });

    it('should throw error for invalid type', async () => {
      (notificationModel.findById as jest.Mock).mockResolvedValue(mockNotification);
      await expect(
        NotificationService.updateNotification('notif1', 'user1', { type: 'invalid' as any })
      ).rejects.toThrow('Invalid notification type');
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification and return true', async () => {
      (notificationModel.delete as jest.Mock).mockResolvedValue(true);
      const result = await NotificationService.deleteNotification('notif1', 'user1');
      expect(result).toBe(true);
      expect(notificationModel.delete).toHaveBeenCalledWith('notif1', 'user1');
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      (notificationModel.markAsRead as jest.Mock).mockResolvedValue(true);
      const result = await NotificationService.markAsRead('notif1', 'user1');
      expect(result).toBe(true);
      expect(notificationModel.markAsRead).toHaveBeenCalledWith('notif1', 'user1');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      (notificationModel.markAllAsRead as jest.Mock).mockResolvedValue(5);
      const result = await NotificationService.markAllAsRead('user1');
      expect(result).toBe(5);
      expect(notificationModel.markAllAsRead).toHaveBeenCalledWith('user1');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      (notificationModel.getUnreadCount as jest.Mock).mockResolvedValue(3);
      const result = await NotificationService.getUnreadCount('user1');
      expect(result).toBe(3);
      expect(notificationModel.getUnreadCount).toHaveBeenCalledWith('user1');
    });
  });

  describe('getNotificationsByType', () => {
    it('should return notifications by type', async () => {
      (notificationModel.findByType as jest.Mock).mockResolvedValue([mockNotification]);
      const result = await NotificationService.getNotificationsByType('user1', 'like', 10);
      expect(result).toEqual([mockNotification]);
      expect(notificationModel.findByType).toHaveBeenCalledWith('user1', 'like', 10);
    });

    it('should throw error for invalid type', async () => {
      await expect(
        NotificationService.getNotificationsByType('user1', 'invalid', 10)
      ).rejects.toThrow('Invalid notification type');
    });
  });

  describe('getRecentByType', () => {
    it('should return recent notifications by type', async () => {
      (notificationModel.getRecentByType as jest.Mock).mockResolvedValue([mockNotification]);
      const result = await NotificationService.getRecentByType('user1', 'like', 24);
      expect(result).toEqual([mockNotification]);
      expect(notificationModel.getRecentByType).toHaveBeenCalledWith('user1', 'like', 24);
    });

    it('should throw error for invalid type', async () => {
      await expect(
        NotificationService.getRecentByType('user1', 'invalid', 24)
      ).rejects.toThrow('Invalid notification type');
    });

    it('should throw error for invalid hours', async () => {
      await expect(
        NotificationService.getRecentByType('user1', 'like', 0)
      ).rejects.toThrow('Hours must be between 1 and 8760 (1 year)');
      await expect(
        NotificationService.getRecentByType('user1', 'like', 9000)
      ).rejects.toThrow('Hours must be between 1 and 8760 (1 year)');
    });
  });

  describe('deleteMultiple', () => {
    it('should delete multiple notifications', async () => {
      (notificationModel.deleteMultiple as jest.Mock).mockResolvedValue(2);
      const result = await NotificationService.deleteMultiple(['id1', 'id2'], 'user1');
      expect(result).toBe(2);
      expect(notificationModel.deleteMultiple).toHaveBeenCalledWith(['id1', 'id2'], 'user1');
    });

    it('should throw error if ids array is empty', async () => {
      await expect(NotificationService.deleteMultiple([], 'user1')).rejects.toThrow(
        'Please provide an array of notification IDs'
      );
    });

    it('should throw error if more than 100 ids', async () => {
      const ids = Array(101).fill('id');
      await expect(NotificationService.deleteMultiple(ids, 'user1')).rejects.toThrow(
        'Cannot delete more than 100 notifications at once'
      );
    });
  });

  describe('deleteOldNotifications', () => {
    it('should delete old notifications', async () => {
      (notificationModel.deleteOldNotifications as jest.Mock).mockResolvedValue(4);
      const result = await NotificationService.deleteOldNotifications('user1', 30);
      expect(result).toBe(4);
      expect(notificationModel.deleteOldNotifications).toHaveBeenCalledWith('user1', 30);
    });

    it('should throw error for invalid daysOld', async () => {
      await expect(NotificationService.deleteOldNotifications('user1', 0)).rejects.toThrow(
        'Days must be between 1 and 365'
      );
      await expect(NotificationService.deleteOldNotifications('user1', 400)).rejects.toThrow(
        'Days must be between 1 and 365'
      );
    });
  });

  describe('getStatsByType', () => {
    it('should return notification stats by type', async () => {
      const stats: NotificationStats[] = [
        { type: 'like', count: 5, unread_count: 2 },
        { type: 'save', count: 3, unread_count: 1 },
      ];
      (notificationModel.getStatsByType as jest.Mock).mockResolvedValue(stats);
      const result = await NotificationService.getStatsByType('user1');
      expect(result).toEqual(stats);
      expect(notificationModel.getStatsByType).toHaveBeenCalledWith('user1');
    });
  });

  describe('createProximityNotification', () => {
    const payload: ProximityNotificationPayload = {
      user_id: 'user1',
      title: 'Near Location',
      message: 'You are close!',
      type: 'proximity_alert',
      metadata: {
        trigger_type: 'wishlist_location',
        location_id: 'loc1',
        location_name: 'Paris',
        distance_km: 1.2,
      },
    };

    it('should create a proximity notification', async () => {
      (notificationModel.findDuplicateProximityAlert as jest.Mock).mockResolvedValue(null);
      (notificationModel.create as jest.Mock).mockResolvedValue('notif2');
      const result = await NotificationService.createProximityNotification(payload);
      expect(result).toBe('notif2');
    });

    it('should throw error if required metadata is missing', async () => {
      await expect(
        NotificationService.createProximityNotification({
          ...payload,
          metadata: { ...payload.metadata, location_id: undefined as any },
        })
      ).rejects.toThrow('Location ID and trigger type are required for proximity notifications');
      await expect(
        NotificationService.createProximityNotification({
          ...payload,
          metadata: { ...payload.metadata, trigger_type: undefined as any },
        })
      ).rejects.toThrow('Location ID and trigger type are required for proximity notifications');
      await expect(
        NotificationService.createProximityNotification({
          ...payload,
          metadata: { ...payload.metadata, location_name: undefined as any },
        })
      ).rejects.toThrow('Location name and distance are required for proximity notifications');
      await expect(
        NotificationService.createProximityNotification({
          ...payload,
          metadata: { ...payload.metadata, distance_km: undefined as any },
        })
      ).rejects.toThrow('Location name and distance are required for proximity notifications');
    });

    it('should throw error for duplicate proximity alert', async () => {
      (notificationModel.findDuplicateProximityAlert as jest.Mock).mockResolvedValue(mockNotification);
      await expect(NotificationService.createProximityNotification(payload)).rejects.toThrow(
        'Duplicate proximity alert detected. Please wait before sending another alert for this location.'
      );
    });
  });

  describe('checkDuplicateProximityAlert', () => {
    it('should return duplicate notification if exists', async () => {
      (notificationModel.findDuplicateProximityAlert as jest.Mock).mockResolvedValue(mockNotification);
      const result = await NotificationService.checkDuplicateProximityAlert('user1', 'loc1', 'wishlist_location', 24);
      expect(result).toEqual(mockNotification);
      expect(notificationModel.findDuplicateProximityAlert).toHaveBeenCalledWith('user1', 'loc1', 'wishlist_location', 24);
    });

    it('should return null if no duplicate exists', async () => {
      (notificationModel.findDuplicateProximityAlert as jest.Mock).mockResolvedValue(null);
      const result = await NotificationService.checkDuplicateProximityAlert('user1', 'loc1', 'wishlist_location', 24);
      expect(result).toBeNull();
    });
  });
});