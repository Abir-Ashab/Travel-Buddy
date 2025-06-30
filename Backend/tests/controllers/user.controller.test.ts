import { userControllers } from '../../src/controllers/user.controller';
import { UserServices } from '../../src/services/user.services';
import { Request, Response } from 'express';

jest.mock('../../src/services/user.services');

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('userControllers', () => {
  let res: Response;
  const next = jest.fn();

  beforeEach(() => {
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('createAdmin', () => {
    it('should create an admin and return 200', async () => {
      const req = { body: { name: 'Admin' } } as unknown as Request;
      const mockResult = { id: 1, name: 'Admin' };
      (UserServices.createAdminIntoDB as jest.Mock).mockResolvedValue(mockResult);

      await userControllers.createAdmin(req, res, next);

      expect(UserServices.createAdminIntoDB).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Admin is created successfully!",
        data: mockResult,
      });
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status and return 200', async () => {
      const req = { body: { user_id: '1', status: 'active' } } as unknown as Request;
      const mockResult = { user_id: '1', status: 'active' };
      (UserServices.updateUserStatus as jest.Mock).mockResolvedValue(mockResult);

      await userControllers.updateUserStatus(req, res, next);

      expect(UserServices.updateUserStatus).toHaveBeenCalledWith('1', { status: 'active' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User updated successfully!",
        data: mockResult,
      });
    });
  });

  describe('updateUser', () => {
    it('should update user and return 200', async () => {
      const req = { body: { user_id: '1', name: 'Updated' } } as unknown as Request;
      const mockResult = { user_id: '1', name: 'Updated' };
      (UserServices.updateUser as jest.Mock).mockResolvedValue(mockResult);

      await userControllers.updateUser(req, res, next);

      expect(UserServices.updateUser).toHaveBeenCalledWith('1', { name: 'Updated' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User updated successfully!",
        data: mockResult,
      });
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile and return 200', async () => {
      const req = { query: { user_id: '1' } } as unknown as Request;
      const mockResult = { user_id: '1', name: 'Test User' };
      (UserServices.getUserProfile as jest.Mock).mockResolvedValue(mockResult);

      await userControllers.getUserProfile(req, res, next);

      expect(UserServices.getUserProfile).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User profile fetched successfully!",
        data: mockResult,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return 200', async () => {
      const req = { body: { user_id: '1' } } as unknown as Request;
      (UserServices.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await userControllers.deleteUser(req, res, next);

      expect(UserServices.deleteUser).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully!",
      });
    });
  });

  describe('upgradeToTraveler', () => {
    it('should upgrade user to traveler and return 200', async () => {
      const req = { body: { user_id: '1' } } as unknown as Request;
      const mockResult = { user_id: '1', role: 'traveler' };
      (UserServices.upgradeToTraveler as jest.Mock).mockResolvedValue(mockResult);

      await userControllers.upgradeToTraveler(req, res, next);

      expect(UserServices.upgradeToTraveler).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User upgraded to traveler successfully!",
        data: mockResult,
      });
    });
  });
});
