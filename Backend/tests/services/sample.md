Sample for getting import convention and others:
import { LocationService } from '../../src/services/location.service';
import { locationModel } from '../../src/repositories/location.repository';
import { Location, CreateLocationRequest, UpdateLocationRequest } from '../../src/interfaces/location.interface';

jest.mock('../../src/repositories/location.repository');

const mockLocation: Location = {
  id: 'loc1',
  name: 'Paris',
  country: 'France',
  region: 'Ile-de-France',
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: 'Europe/Paris',
  created_at: new Date('2024-06-01T10:00:00Z'),
};

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLocations', () => {
    it('should return all locations', async () => {
      (locationModel.findAll as jest.Mock).mockResolvedValue([mockLocation]);
      const result = await LocationService.getAllLocations({ page: 1, limit: 10 });
      expect(result).toEqual([mockLocation]);
      expect(locationModel.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('searchLocations', () => {
    it('should return locations matching query', async () => {
      (locationModel.search as jest.Mock).mockResolvedValue([mockLocation]);
      const result = await LocationService.searchLocations('Paris');
      expect(result).toEqual([mockLocation]);
      expect(locationModel.search).toHaveBeenCalledWith('Paris');
    });
  });

  describe('getLocationById', () => {
    it('should return a location by id', async () => {
      (locationModel.findById as jest.Mock).mockResolvedValue(mockLocation);
      const result = await LocationService.getLocationById('loc1');
      expect(result).toEqual(mockLocation);
      expect(locationModel.findById).toHaveBeenCalledWith('loc1');
    });

    it('should return null if location not found', async () => {
      (locationModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await LocationService.getLocationById('notfound');
      expect(result).toBeNull();
    });
  });

  describe('createLocation', () => {
    const locationData: CreateLocationRequest = {
      name: 'Paris',
      country: 'France',
      region: 'Ile-de-France',
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: 'Europe/Paris',
    };

    it('should create a location and return it', async () => {
      (locationModel.findByNameAndCountry as jest.Mock).mockResolvedValue(null);
      (locationModel.create as jest.Mock).mockResolvedValue('loc1');
      (locationModel.findById as jest.Mock).mockResolvedValue(mockLocation);

      const result = await LocationService.createLocation(locationData);
      expect(locationModel.findByNameAndCountry).toHaveBeenCalledWith('Paris', 'France');
      expect(locationModel.create).toHaveBeenCalledWith(locationData);
      expect(result).toEqual(mockLocation);
    });

    it('should throw error if latitude is invalid', async () => {
      await expect(
        LocationService.createLocation({ ...locationData, latitude: 100 })
      ).rejects.toThrow('Latitude must be between -90 and 90');
    });

    it('should throw error if longitude is invalid', async () => {
      await expect(
        LocationService.createLocation({ ...locationData, longitude: 200 })
      ).rejects.toThrow('Longitude must be between -180 and 180');
    });

    it('should throw error if location already exists', async () => {
      (locationModel.findByNameAndCountry as jest.Mock).mockResolvedValue(mockLocation);
      await expect(LocationService.createLocation(locationData)).rejects.toThrow(
        'Location with this name already exists in the specified country'
      );
    });

    it('should throw error if location not found after creation', async () => {
      (locationModel.findByNameAndCountry as jest.Mock).mockResolvedValue(null);
      (locationModel.create as jest.Mock).mockResolvedValue('loc1');
      (locationModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(LocationService.createLocation(locationData)).rejects.toThrow(
        'Location not found after creation'
      );
    });
  });

  describe('updateLocation', () => {
    const updateData: UpdateLocationRequest = { name: 'Lyon', latitude: 45.75 };

    it('should update a location and return updated location', async () => {
      (locationModel.findById as jest.Mock)
        .mockResolvedValueOnce(mockLocation) // before update
        .mockResolvedValueOnce({ ...mockLocation, ...updateData }); // after update
      (locationModel.findByNameAndCountry as jest.Mock).mockResolvedValue(null);
      (locationModel.update as jest.Mock).mockResolvedValue(undefined);

      const result = await LocationService.updateLocation('loc1', updateData);
      expect(result).toEqual({ ...mockLocation, ...updateData });
      expect(locationModel.update).toHaveBeenCalledWith('loc1', updateData);
    });

    it('should return null if location not found', async () => {
      (locationModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await LocationService.updateLocation('notfound', updateData);
      expect(result).toBeNull();
    });

    it('should throw error if latitude is invalid', async () => {
      (locationModel.findById as jest.Mock).mockResolvedValue(mockLocation);
      await expect(
        LocationService.updateLocation('loc1', { latitude: -100 })
      ).rejects.toThrow('Latitude must be between -90 and 90');
    });

    it('should throw error if longitude is invalid', async () => {
      (locationModel.findById as jest.Mock).mockResolvedValue(mockLocation);
      await expect(
        LocationService.updateLocation('loc1', { longitude: 200 })
      ).rejects.toThrow('Longitude must be between -180 and 180');
    });

    it('should throw error if duplicate name/country', async () => {
      (locationModel.findById as jest.Mock).mockResolvedValue(mockLocation);
      (locationModel.findByNameAndCountry as jest.Mock).mockResolvedValue({ ...mockLocation, id: 'otherid' });
      await expect(
        LocationService.updateLocation('loc1', { name: 'Paris' })
      ).rejects.toThrow('Location with this name already exists in the specified country');
    });
  });

  describe('deleteLocation', () => {
    it('should delete a location and return true', async () => {
      (locationModel.findById as jest.Mock).mockResolvedValue(mockLocation);
      (locationModel.delete as jest.Mock).mockResolvedValue(true);

      const result = await LocationService.deleteLocation('loc1');
      expect(result).toBe(true);
      expect(locationModel.delete).toHaveBeenCalledWith('loc1');
    });

    it('should return false if location not found', async () => {
      (locationModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await LocationService.deleteLocation('notfound');
      expect(result).toBe(false);
    });
  });
});


don' forget to use repositories instead of models and .repository instead of .model.


Write test file for the following file