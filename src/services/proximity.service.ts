// proximity.service.ts
import { createProximityModel } from "../models/proximity.model";
import { createNotificationModel } from "../models/notification.model";
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
import KnexConnection from '../database/implementations/knex/KnexConnection';

const knexConnection = new KnexConnection();
await knexConnection.connect();

const knexInstance = knexConnection.getClient();
const proximityModel = createProximityModel(knexInstance);
const notificationModel = createNotificationModel(knexInstance);

const getProximitySettings = async (userId: string): Promise<ProximitySettings | null> => {
  let settings = await proximityModel.findSettingsByUserId(userId);
  
  // Create default settings if none exist
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
  console.log(settings)
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
  const settings = await getProximitySettings(userId);
  if (!settings) {
    console.log("⚠️ No settings found for user:", userId);
    return;
  }

  const userLocation = await getUserLocation(userId);
  if (!userLocation) {
    console.log("⚠️ No user location found for user:", userId);
    return;
  }

  const alerts: ProximityNotificationPayload[] = [];

  // Utility to generate and log alerts
  const handleAlert = async (
    locationObj: any,
    type: string,
    title: string,
    messageTemplate: string,
    metadataExtras: any = {},
    logExtras: any = {}
  ) => {
    const locId = locationObj.location?.id;
    if (!locId) return;

    const message = messageTemplate
        .replace('{name}', locationObj.name)
        .replace('{distance}', locationObj.distance_km.toFixed(1))
        .replace('{location}', locationObj.location?.name || 'somewhere');

    alerts.push({
        user_id: userId,
        title,
        message,
        type: 'proximity_alert',
        metadata: {
        trigger_type: type,
        location_id: locId,
        location_name: locationObj.location?.name,
        distance_km: locationObj.distance_km,
        ...metadataExtras,
        },
    });

    await proximityModel.logProximityEvent({
        user_id: userId,
        location_id: locId,
        trigger_type: type,
        distance_km: locationObj.distance_km,
        ...logExtras,
    });
  };

  // ---- Wishlist
  if (settings.enable_wishlist_alerts) {
    const nearby = await getNearbyWishlistLocations(userId);
    for (const item of nearby) {
      await handleAlert(
        item,
        'wishlist_location',
        'Wishlist Location Nearby!',
        "You're {distance}km away from {name} from your wishlist"
      );
    }
  }

  // ---- Trip Participants
  if (settings.enable_trip_participant_alerts) {
    const nearby = await getNearbyTripParticipants(userId);
    for (const item of nearby) {
      await handleAlert(
        item,
        'trip_participant',
        'Trip Buddy Nearby!',
        "{name} is {distance}km away in {location}",
        { target_user_id: item.id },
        { target_user_id: item.id }
      );
    }
  }

  // ---- Featured Posts
  if (settings.enable_featured_post_alerts) {
    const nearby = await getNearbyFeaturedPosts(userId);
    for (const item of nearby) {
      await handleAlert(
        item,
        'featured_post',
        'Featured Post Nearby!',
        `Check out "{name}" - a featured post {distance}km away in {location}`
      );
    }
  }

  // ---- Attractions
  if (settings.enable_attraction_alerts) {
    const nearby = await getNearbyAttractions(userId);
    for (const item of nearby) {
      await handleAlert(
        item,
        'attraction',
        'Attraction Nearby!',
        "You're {distance}km away from {name} in {location}"
      );
    }
  }

  // ---- Accommodations
  if (settings.enable_accommodation_alerts) {
    const nearby = await getNearbyAccommodations(userId);
    for (const item of nearby) {
      await handleAlert(
        item,
        'accommodation',
        'Accommodation Nearby!',
        `An accommodation "{name}" is {distance}km away in {location}`
      );
    }
  }

  // ---- Dining
  if (settings.enable_dining_alerts) {
    const nearby = await getNearbyDining(userId);
    for (const item of nearby) {
      await handleAlert(
        item,
        'dining',
        'Dining Nearby!',
        `You're near "{name}" - just {distance}km away in {location}`
      );
    }
  }

  // ---- Final alert dispatch
  console.log("Alerts to send:", alerts.length, alerts);

  for (const alert of alerts) {
    try {
      await notificationModel.create({
        user_id: alert.user_id,
        title: alert.title,
        message: alert.message,
        type: alert.type, // should be 'proximity_alert'
        metadata: alert.metadata,
      });
    } catch (error) {
      console.error(" Failed to create notification:", error);
    }
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