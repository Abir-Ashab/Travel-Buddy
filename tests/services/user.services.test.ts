import { UserServices } from "../../src/services/user.services";
import { userModel } from "../../src/repositories/user.repository";
import { USER_Role, USER_STATUS, TUser } from "../../src/interfaces/user.interface";

jest.mock("../../src/repositories/user.repository");

const mockUser: TUser = {
  name: "John Doe",
  role: USER_Role.EXPLORER,
  email: "john@example.com",
  password: "hashedpassword",
  status: USER_STATUS.ACTIVE,
};

describe("UserServices", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAdminIntoDB", () => {
    it("should create an admin user", async () => {
      (userModel.create as jest.Mock).mockResolvedValue(mockUser);
      const result = await UserServices.createAdminIntoDB(mockUser);
      expect(userModel.create).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateUserStatus", () => {
    it("should update user status", async () => {
      const updatedUser = { ...mockUser, status: USER_STATUS.BLOCKED };
      (userModel.updateById as jest.Mock).mockResolvedValue(updatedUser);
      const result = await UserServices.updateUserStatus("123", updatedUser);
      expect(userModel.updateById).toHaveBeenCalledWith("123", updatedUser);
      expect(result).toEqual(updatedUser);
    });
  });

  describe("updateUser", () => {
    it("should update user if found and role is EXPLORER", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (userModel.updateById as jest.Mock).mockResolvedValue({ ...mockUser, name: "Jane" });
      const payload = { ...mockUser, name: "Jane" };
      const result = await UserServices.updateUser("123", payload);
      expect(userModel.findById).toHaveBeenCalledWith("123");
      expect(userModel.updateById).toHaveBeenCalledWith("123", { ...payload, status: undefined });
      expect(result).toEqual({ ...mockUser, name: "Jane" });
    });

    it("should throw error if user not found", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(UserServices.updateUser("123", mockUser)).rejects.toThrow("User not found");
    });

    it("should update user if role is not EXPLORER or TRAVELER", async () => {
      const adminUser = { ...mockUser, role: USER_Role.ADMIN };
      (userModel.findById as jest.Mock).mockResolvedValue(adminUser);
      (userModel.updateById as jest.Mock).mockResolvedValue({ ...adminUser, name: "Jane" });
      const payload = { ...adminUser, name: "Jane" };
      const result = await UserServices.updateUser("123", payload);
      expect(userModel.updateById).toHaveBeenCalledWith("123", payload);
      expect(result).toEqual({ ...adminUser, name: "Jane" });
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(mockUser);
      const result = await UserServices.getUserProfile("123");
      expect(userModel.findById).toHaveBeenCalledWith("123");
      expect(result).toEqual(mockUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete user by id", async () => {
      (userModel.deleteById as jest.Mock).mockResolvedValue(undefined);
      await UserServices.deleteUser("123");
      expect(userModel.deleteById).toHaveBeenCalledWith("123");
    });
  });

  describe("upgradeToTraveler", () => {
    it("should upgrade user to traveler", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (userModel.updateById as jest.Mock).mockResolvedValue({ ...mockUser, role: USER_Role.TRAVELER });
      const result = await UserServices.upgradeToTraveler("123");
      expect(userModel.findById).toHaveBeenCalledWith("123");
      expect(userModel.updateById).toHaveBeenCalledWith("123", { role: USER_Role.TRAVELER });
      expect(result).toEqual({ ...mockUser, role: USER_Role.TRAVELER });
    });

    it("should throw error if user not found", async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(UserServices.upgradeToTraveler("123")).rejects.toThrow("User not found");
    });
  });
});
