import { proximityModel } from "../repositories/proximity.repository";
import { notificationModel } from "../repositories/notification.repository";
import { userModel } from "../repositories/user.repository";
import { wishlistModel } from "../repositories/wishlist.repository";
import {
  ProximitySettings,
  ProximityAlert,
  UserLocation,
  ProximityMatch,
  NearbyItem,
  CreateProximitySettingsRequest,
  UpdateLocationRequest,
  GetProximityAlertsRequest,
  ProximityNotificationPayload
} from "../interfaces/proximity.interface";


const getProximitySettings = async (userId: string): Promise<ProximitySettings | null> => {
  let settings = await proximityModel.findSettingsByUserId(userId);
  
  if (!settings) {
    settings = await createProximitySettings(userId, {});
  }
  
  return settings;
};

const createProximitySettings = async (
  userId: string,
  settingsData: CreateProximitySettingsRequest
): Promise<ProximitySettings> => {
  const defaultSettings = {
    proximity_radius_km: 5.0,
    enable_wishlist_alerts: true,
    enable_trip_participant_alerts: true,
    enable_featured_post_alerts: true,
    enable_attraction_alerts: true,
    enable_accommodation_alerts: true,
    enable_dining_alerts: true,
    ...settingsData
  };

  const settingsId = await proximityModel.createSettings({
    user_id: userId,
    ...defaultSettings
  });

  const createdSettings = await proximityModel.findSettingsById(settingsId);
  if (!createdSettings) {
    throw new Error('Proximity settings not found after creation');
  }

  return createdSettings;
};

const updateProximitySettings = async (
  userId: string,
  updateData: CreateProximitySettingsRequest
): Promise<ProximitySettings | null> => {
  const existingSettings = await proximityModel.findSettingsByUserId(userId);
  
  if (!existingSettings) {
    return await createProximitySettings(userId, updateData);
  }

  await proximityModel.updateSettings(existingSettings.id, updateData);
  return await proximityModel.findSettingsById(existingSettings.id);
};

const updateUserLocation = async (
  userId: string,
  locationData: UpdateLocationRequest
): Promise<UserLocation> => {
  await proximityModel.updateUserLocation(userId, locationData);
  
  const updatedLocation = await proximityModel.getUserLocation(userId);
  if (!updatedLocation) {
    throw new Error('Failed to update user location');
  }

  return updatedLocation;
};

const getUserLocation = async (userId: string): Promise<UserLocation | null> => {
  return await proximityModel.getUserLocation(userId);
};

const getProximityAlerts = async (
  userId: string,
  queryParams: GetProximityAlertsRequest
): Promise<ProximityMatch[]> => {
  return await proximityModel.findAlertsByUserId(userId, queryParams);
};

const getProximityHistory = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ProximityAlert[]> => {
  return await proximityModel.findAlertHistory(userId, limit, offset);
};

const deleteProximityAlert = async (alertId: string, userId: string): Promise<boolean> => {
  return await proximityModel.deleteAlert(alertId, userId);
};

const getNearbyWishlistLocations = async (userId: string): Promise<NearbyItem[]> => {
  const settings = await getProximitySettings(userId);
  
  if (!settings?.enable_wishlist_alerts) {
    return [];
  }

  return await proximityModel.findNearbyWishlistLocations(userId, settings.proximity_radius_km);
};

const getNearbyTripParticipants = async (userId: string): Promise<NearbyItem[]> => {
  const settings = await getProximitySettings(userId);
  if (!settings?.enable_trip_participant_alerts) {
    return [];
  }

  return await proximityModel.findNearbyTripParticipants(userId, settings.proximity_radius_km);
};

const getNearbyFeaturedPosts = async (userId: string): Promise<NearbyItem[]> => {
  const settings = await getProximitySettings(userId);
  if (!settings?.enable_featured_post_alerts) {
    return [];
  }

  return await proximityModel.findNearbyFeaturedPosts(userId, settings.proximity_radius_km);
};

const getNearbyAttractions = async (userId: string): Promise<NearbyItem[]> => {
  const settings = await getProximitySettings(userId);
  if (!settings?.enable_attraction_alerts) {
    return [];
  }

  return await proximityModel.findNearbyAttractions(userId, settings.proximity_radius_km);
};

const getNearbyAccommodations = async (userId: string): Promise<NearbyItem[]> => {
  const settings = await getProximitySettings(userId);
  if (!settings?.enable_accommodation_alerts) {
    return [];
  }

  return await proximityModel.findNearbyAccommodations(userId, settings.proximity_radius_km);
};

const getNearbyDining = async (userId: string): Promise<NearbyItem[]> => {
  const settings = await getProximitySettings(userId);
  if (!settings?.enable_dining_alerts) {
    return [];
  }

  return await proximityModel.findNearbyDining(userId, settings.proximity_radius_km);
};

const processProximityAlerts = async (userId: string): Promise<void> => {
  const settings = await proximityModel.findSettingsByUserId(userId);
  if (!settings) {
    console.log(`No proximity settings found for user ${userId}`);
    return;
  }

  const userLocation = await getUserLocation(userId);
  if (!userLocation) {
    console.log(`No location found for user ${userId}`);
    return;
  }

  console.log("settings: ", settings);
  
  if (settings.enable_wishlist_alerts) {
    try {
      const userWishlistItems = await wishlistModel.getUserWishlistItemsWithLocations(userId);
      console.log(`User ${userId} wishlist items:`, userWishlistItems);
      
      if (!userWishlistItems || userWishlistItems.length === 0) {
        console.log(`No wishlist items found for user ${userId}`);
        return;
      }
      
      const nearbyLocations = await getNearbyWishlistLocations(userId);
      console.log(`Found ${nearbyLocations?.length || 0} nearby locations for user ${userId}`);
      
      if (!nearbyLocations || nearbyLocations.length === 0) {
        console.log(`No nearby locations found for user ${userId}`);
        return;
      }

      for (const wishlistItem of userWishlistItems) {
        const matchingLocation = nearbyLocations.find(location => 
          location.id === wishlistItem.location_id ||
          location.name === wishlistItem.location_name ||
          location.id === wishlistItem.location?.id
        );
        
        if (matchingLocation) {
          try {
            const existingNotification = await notificationModel.findDuplicateProximityAlert(
              userId,
              matchingLocation.id,
              'nearby_wishlist_location',
              24 
            );

            if (existingNotification) {
              console.log(`Duplicate notification exists for user ${userId}, location ${matchingLocation.id}`);
              continue;
            }

            const notificationId = await notificationModel.create({
              user_id: userId,
              title: 'Wishlist Location Nearby!',
              message: `You're ${matchingLocation.distance_km}km away from ${matchingLocation.name} from your wishlist`,
              type: 'nearby_wishlist_location', 
              metadata: {
                trigger_type: 'nearby_wishlist_location',
                location_id: matchingLocation.id,
                location_name: matchingLocation.name,
                distance_km: matchingLocation.distance_km,
                wishlist_item_id: wishlistItem.id,
                wishlist_item_name: wishlistItem.name,
              },
            });

            console.log(`Created wishlist notification ${notificationId} for user ${userId} - wishlist item: ${wishlistItem.name}`);
            
          } catch (notificationError) {
            console.error(`Failed to create wishlist notification for user ${userId}, item ${wishlistItem.id}:`, notificationError);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing wishlist alerts for user ${userId}:`, error);
    }
  } else {
    console.log(`Wishlist alerts disabled for user ${userId}`);
  }
};

export const ProximityService = {
  getProximitySettings,
  createProximitySettings,
  updateProximitySettings,
  updateUserLocation,
  getUserLocation,
  getProximityAlerts,
  getProximityHistory,
  deleteProximityAlert,
  getNearbyWishlistLocations,
  getNearbyTripParticipants,
  getNearbyFeaturedPosts,
  getNearbyAttractions,
  getNearbyAccommodations,
  getNearbyDining,
  processProximityAlerts
};