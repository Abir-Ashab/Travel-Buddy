import { ProximityService } from '../../src/services/proximity.service';
import { proximityModel } from '../../src/repositories/proximity.repository';
import { notificationModel } from '../../src/repositories/notification.repository';
import {
  ProximitySettings,
  ProximityAlert,
  UserLocation,
  ProximityMatch,
  NearbyItem,
  CreateProximitySettingsRequest,
  UpdateLocationRequest,
  GetProximityAlertsRequest,
  ProximityNotificationPayload,
} from '../../src/interfaces/proximity.interface';

jest.mock('../../src/repositories/proximity.repository');
jest.mock('../../src/repositories/notification.repository');

const mockSettings: ProximitySettings = {
  id: 'set1',
  user_id: 'user1',
  proximity_radius_km: 5,
  enable_wishlist_alerts: true,
  enable_trip_participant_alerts: true,
  enable_featured_post_alerts: true,
  enable_attraction_alerts: true,
  enable_accommodation_alerts: true,
  enable_dining_alerts: true,
};

const mockLocation: UserLocation = {
  user_id: 'user1',
  latitude: 48.8566,
  longitude: 2.3522,
  updated_at: new Date('2024-06-01T10:00:00Z'),
};

const mockNearbyItem: NearbyItem = {
  id: 'item1',
  name: 'Eiffel Tower',
  type: 'attraction',
  distance_km: 1.2,
  location: {
    id: 'loc1',
    name: 'Paris',
    latitude: 48.8584,
    longitude: 2.2945,
  },
};

describe('ProximityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProximitySettings', () => {
    it('should return settings if found', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      const result = await ProximityService.getProximitySettings('user1');
      expect(result).toEqual(mockSettings);
      expect(proximityModel.findSettingsByUserId).toHaveBeenCalledWith('user1');
    });

    it('should create default settings if not found', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(null);
      (proximityModel.createSettings as jest.Mock).mockResolvedValue('set1');
      (proximityModel.findSettingsById as jest.Mock).mockResolvedValue(mockSettings);

      const result = await ProximityService.getProximitySettings('user1');
      expect(result).toEqual(mockSettings);
      expect(proximityModel.createSettings).toHaveBeenCalled();
    });
  });

  describe('createProximitySettings', () => {
    it('should create and return settings', async () => {
      (proximityModel.createSettings as jest.Mock).mockResolvedValue('set1');
      (proximityModel.findSettingsById as jest.Mock).mockResolvedValue(mockSettings);

      const result = await ProximityService.createProximitySettings('user1', {});
      expect(result).toEqual(mockSettings);
      expect(proximityModel.createSettings).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user1' }));
    });

    it('should throw if settings not found after creation', async () => {
      (proximityModel.createSettings as jest.Mock).mockResolvedValue('set1');
      (proximityModel.findSettingsById as jest.Mock).mockResolvedValue(null);

      await expect(ProximityService.createProximitySettings('user1', {})).rejects.toThrow(
        'Proximity settings not found after creation'
      );
    });
  });

  describe('updateProximitySettings', () => {
    it('should update and return settings', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      (proximityModel.updateSettings as jest.Mock).mockResolvedValue(undefined);
      (proximityModel.findSettingsById as jest.Mock).mockResolvedValue(mockSettings);

      const result = await ProximityService.updateProximitySettings('user1', { proximity_radius_km: 10 });
      expect(result).toEqual(mockSettings);
      expect(proximityModel.updateSettings).toHaveBeenCalledWith('set1', { proximity_radius_km: 10 });
    });

    it('should create settings if not found', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(null);
      (proximityModel.createSettings as jest.Mock).mockResolvedValue('set1');
      (proximityModel.findSettingsById as jest.Mock).mockResolvedValue(mockSettings);

      const result = await ProximityService.updateProximitySettings('user1', { proximity_radius_km: 10 });
      expect(result).toEqual(mockSettings);
      expect(proximityModel.createSettings).toHaveBeenCalled();
    });
  });

  describe('updateUserLocation', () => {
    it('should update and return user location', async () => {
      (proximityModel.updateUserLocation as jest.Mock).mockResolvedValue(undefined);
      (proximityModel.getUserLocation as jest.Mock).mockResolvedValue(mockLocation);

      const result = await ProximityService.updateUserLocation('user1', { latitude: 48.8566, longitude: 2.3522 });
      expect(result).toEqual(mockLocation);
      expect(proximityModel.updateUserLocation).toHaveBeenCalledWith('user1', { latitude: 48.8566, longitude: 2.3522 });
    });

    it('should throw if location not found after update', async () => {
      (proximityModel.updateUserLocation as jest.Mock).mockResolvedValue(undefined);
      (proximityModel.getUserLocation as jest.Mock).mockResolvedValue(null);

      await expect(
        ProximityService.updateUserLocation('user1', { latitude: 48.8566, longitude: 2.3522 })
      ).rejects.toThrow('Failed to update user location');
    });
  });

  describe('getUserLocation', () => {
    it('should return user location', async () => {
      (proximityModel.getUserLocation as jest.Mock).mockResolvedValue(mockLocation);
      const result = await ProximityService.getUserLocation('user1');
      expect(result).toEqual(mockLocation);
    });
  });

  describe('getProximityAlerts', () => {
    it('should return proximity matches', async () => {
      const matches: ProximityMatch[] = [
        {
          id: 'alert1',
          user_id: 'user1',
          location_id: 'loc1',
          location_name: 'Paris',
          distance_km: 1.2,
          trigger_type: 'wishlist_location',
          created_at: new Date(),
        },
      ];
      (proximityModel.findAlertsByUserId as jest.Mock).mockResolvedValue(matches);

      const result = await ProximityService.getProximityAlerts('user1', {});
      expect(result).toEqual(matches);
      expect(proximityModel.findAlertsByUserId).toHaveBeenCalledWith('user1', {});
    });
  });

  describe('getProximityHistory', () => {
    it('should return proximity alert history', async () => {
      const alerts: ProximityAlert[] = [
        {
          id: 'alert1',
          user_id: 'user1',
          location_id: 'loc1',
          trigger_type: 'wishlist_location',
          distance_km: 1.2,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (proximityModel.findAlertHistory as jest.Mock).mockResolvedValue(alerts);

      const result = await ProximityService.getProximityHistory('user1', 10, 0);
      expect(result).toEqual(alerts);
      expect(proximityModel.findAlertHistory).toHaveBeenCalledWith('user1', 10, 0);
    });
  });

  describe('deleteProximityAlert', () => {
    it('should delete alert and return true', async () => {
      (proximityModel.deleteAlert as jest.Mock).mockResolvedValue(true);
      const result = await ProximityService.deleteProximityAlert('alert1', 'user1');
      expect(result).toBe(true);
      expect(proximityModel.deleteAlert).toHaveBeenCalledWith('alert1', 'user1');
    });
  });

  describe('getNearbyWishlistLocations', () => {
    it('should return nearby wishlist locations if enabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      (proximityModel.findNearbyWishlistLocations as jest.Mock).mockResolvedValue([mockNearbyItem]);

      const result = await ProximityService.getNearbyWishlistLocations('user1');
      expect(result).toEqual([mockNearbyItem]);
      expect(proximityModel.findNearbyWishlistLocations).toHaveBeenCalledWith('user1', 5);
    });

    it('should return empty array if wishlist alerts disabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue({
        ...mockSettings,
        enable_wishlist_alerts: false,
      });

      const result = await ProximityService.getNearbyWishlistLocations('user1');
      expect(result).toEqual([]);
    });
  });

  describe('getNearbyTripParticipants', () => {
    it('should return nearby trip participants if enabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      (proximityModel.findNearbyTripParticipants as jest.Mock).mockResolvedValue([mockNearbyItem]);

      const result = await ProximityService.getNearbyTripParticipants('user1');
      expect(result).toEqual([mockNearbyItem]);
      expect(proximityModel.findNearbyTripParticipants).toHaveBeenCalledWith('user1', 5);
    });

    it('should return empty array if trip participant alerts disabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue({
        ...mockSettings,
        enable_trip_participant_alerts: false,
      });

      const result = await ProximityService.getNearbyTripParticipants('user1');
      expect(result).toEqual([]);
    });
  });

  describe('getNearbyFeaturedPosts', () => {
    it('should return nearby featured posts if enabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      (proximityModel.findNearbyFeaturedPosts as jest.Mock).mockResolvedValue([mockNearbyItem]);

      const result = await ProximityService.getNearbyFeaturedPosts('user1');
      expect(result).toEqual([mockNearbyItem]);
      expect(proximityModel.findNearbyFeaturedPosts).toHaveBeenCalledWith('user1', 5);
    });

    it('should return empty array if featured post alerts disabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue({
        ...mockSettings,
        enable_featured_post_alerts: false,
      });

      const result = await ProximityService.getNearbyFeaturedPosts('user1');
      expect(result).toEqual([]);
    });
  });

  describe('getNearbyAttractions', () => {
    it('should return nearby attractions if enabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      (proximityModel.findNearbyAttractions as jest.Mock).mockResolvedValue([mockNearbyItem]);

      const result = await ProximityService.getNearbyAttractions('user1');
      expect(result).toEqual([mockNearbyItem]);
      expect(proximityModel.findNearbyAttractions).toHaveBeenCalledWith('user1', 5);
    });

    it('should return empty array if attraction alerts disabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue({
        ...mockSettings,
        enable_attraction_alerts: false,
      });

      const result = await ProximityService.getNearbyAttractions('user1');
      expect(result).toEqual([]);
    });
  });

  describe('getNearbyAccommodations', () => {
    it('should return nearby accommodations if enabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      (proximityModel.findNearbyAccommodations as jest.Mock).mockResolvedValue([mockNearbyItem]);

      const result = await ProximityService.getNearbyAccommodations('user1');
      expect(result).toEqual([mockNearbyItem]);
      expect(proximityModel.findNearbyAccommodations).toHaveBeenCalledWith('user1', 5);
    });

    it('should return empty array if accommodation alerts disabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue({
        ...mockSettings,
        enable_accommodation_alerts: false,
      });

      const result = await ProximityService.getNearbyAccommodations('user1');
      expect(result).toEqual([]);
    });
  });

  describe('getNearbyDining', () => {
    it('should return nearby dining if enabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      (proximityModel.findNearbyDining as jest.Mock).mockResolvedValue([mockNearbyItem]);

      const result = await ProximityService.getNearbyDining('user1');
      expect(result).toEqual([mockNearbyItem]);
      expect(proximityModel.findNearbyDining).toHaveBeenCalledWith('user1', 5);
    });

    it('should return empty array if dining alerts disabled', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue({
        ...mockSettings,
        enable_dining_alerts: false,
      });

      const result = await ProximityService.getNearbyDining('user1');
      expect(result).toEqual([]);
    });
  });

  describe('processProximityAlerts', () => {
    it('should process and send alerts for enabled types', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      (proximityModel.getUserLocation as jest.Mock).mockResolvedValue(mockLocation);
      (proximityModel.findNearbyWishlistLocations as jest.Mock).mockResolvedValue([mockNearbyItem]);
      (proximityModel.findNearbyTripParticipants as jest.Mock).mockResolvedValue([]);
      (proximityModel.findNearbyFeaturedPosts as jest.Mock).mockResolvedValue([]);
      (proximityModel.findNearbyAttractions as jest.Mock).mockResolvedValue([]);
      (proximityModel.findNearbyAccommodations as jest.Mock).mockResolvedValue([]);
      (proximityModel.findNearbyDining as jest.Mock).mockResolvedValue([]);
      (proximityModel.logProximityEvent as jest.Mock).mockResolvedValue(undefined);
      (notificationModel.create as jest.Mock).mockResolvedValue(undefined);

      await ProximityService.processProximityAlerts('user1');
      expect(notificationModel.create).toHaveBeenCalled();
      expect(proximityModel.logProximityEvent).toHaveBeenCalled();
    });

    it('should not send alerts if settings not found', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(null);

      await ProximityService.processProximityAlerts('user1');
      expect(notificationModel.create).not.toHaveBeenCalled();
    });

    it('should not send alerts if user location not found', async () => {
      (proximityModel.findSettingsByUserId as jest.Mock).mockResolvedValue(mockSettings);
      (proximityModel.getUserLocation as jest.Mock).mockResolvedValue(null);

      await ProximityService.processProximityAlerts('user1');
      expect(notificationModel.create).not.toHaveBeenCalled();
    });
  });
});