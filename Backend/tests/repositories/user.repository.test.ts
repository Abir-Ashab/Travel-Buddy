import { userModel } from "../../src/repositories/user.repository";
import bcryptjs from "bcryptjs";
import { USER_STATUS } from "../../src/interfaces/user.interface";
import { getConnection } from "../../src/database";

jest.mock("../../src/database");
jest.mock("bcryptjs");

const mockKnex = {
  insert: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  del: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  first: jest.fn(),
};

const fakeKnexFn = (tableName: string) => mockKnex;
fakeKnexFn.raw = jest.fn(() => 'NULL as password');

const mockGetClient = jest.fn(() => fakeKnexFn);

(getConnection as jest.Mock).mockReturnValue({
  getClient: mockGetClient,
});


describe("User Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should hash password and insert user", async () => {
      (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPass");
      mockKnex.insert.mockReturnThis();
      mockKnex.returning.mockResolvedValue([{ id: "1", name: "Test", password: "hashedPass" }]);

      const userData = { name: "Test", password: "plain", email: "test@mail.com" };
      const result = await userModel.create(userData);

      expect(bcryptjs.hash).toHaveBeenCalledWith("plain", expect.any(Number));
      expect(mockKnex.insert).toHaveBeenCalledWith(expect.objectContaining({ password: "hashedPass" }));
      expect(result).toEqual({ id: "1", name: "Test" });
    });
  });

  describe("findById", () => {
    it("should query user by id", async () => {
      mockKnex.where.mockReturnThis();
      mockKnex.first.mockResolvedValue({ id: "1", name: "Test" });

      const result = await userModel.findById("1");
      expect(mockKnex.where).toHaveBeenCalledWith({ id: "1" });
      expect(result).toEqual({ id: "1", name: "Test" });
    });
  });

  describe("findByEmail", () => {
    it("should query user by email without password", async () => {
      mockKnex.where.mockReturnThis();
      mockKnex.select.mockReturnThis();
      fakeKnexFn.raw.mockReturnValue("NULL as password");
      mockKnex.first.mockResolvedValue({ id: "1", email: "test@mail.com" });

      const result = await userModel.findByEmail("test@mail.com");
      expect(mockKnex.where).toHaveBeenCalledWith({ email: "test@mail.com" });
      expect(mockKnex.select).toHaveBeenCalledWith("*");
      expect(fakeKnexFn.raw).toHaveBeenCalledWith("NULL as password");
      expect(result).toEqual({ id: "1", email: "test@mail.com" });
    });

    it("should query user by email with password if includePassword=true", async () => {
      mockKnex.where.mockReturnThis();
      mockKnex.first.mockResolvedValue({ id: "1", email: "test@mail.com", password: "hashed" });

      const result = await userModel.findByEmail("test@mail.com", true);
      expect(mockKnex.where).toHaveBeenCalledWith({ email: "test@mail.com" });
      expect(result).toEqual({ id: "1", email: "test@mail.com", password: "hashed" });
    });
  });

  describe("findByEmailWithPassword", () => {
    it("should query user by email and return first result", async () => {
      mockKnex.where.mockReturnThis();
      mockKnex.first.mockResolvedValue({ id: "1", email: "test@mail.com", password: "hashed" });

      const result = await userModel.findByEmailWithPassword("test@mail.com");
      expect(mockKnex.where).toHaveBeenCalledWith({ email: "test@mail.com" });
      expect(result).toEqual({ id: "1", email: "test@mail.com", password: "hashed" });
    });
  });

  describe("updateById", () => {
    it("should update user and hash password if provided", async () => {
      (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPass");
      mockKnex.where.mockReturnThis();
      mockKnex.update.mockReturnThis();
      mockKnex.returning.mockResolvedValue([{ id: "1", name: "Updated", password: "hashedPass" }]);

      const result = await userModel.updateById("1", { password: "newpass", name: "Updated" });
      expect(bcryptjs.hash).toHaveBeenCalledWith("newpass", expect.any(Number));
      expect(result).toEqual({ id: "1", name: "Updated" });
    });

    it("should return null if no user updated", async () => {
      mockKnex.where.mockReturnThis();
      mockKnex.update.mockReturnThis();
      mockKnex.returning.mockResolvedValue([undefined]);

      const result = await userModel.updateById("1", { name: "Updated" });
      expect(result).toBeNull();
    });
  });

  describe("updatePassword", () => {
    it("should hash new password and call updateById", async () => {
      (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPass");
      const updateByIdSpy = jest.spyOn(userModel, "updateById").mockResolvedValue({ id: "1", name: "Test" });

      const result = await userModel.updatePassword("1", "newpass");
      expect(bcryptjs.hash).toHaveBeenCalledWith("newpass", expect.any(Number));
      expect(updateByIdSpy).toHaveBeenCalled();
      expect(result).toEqual({ id: "1", name: "Test" });

      updateByIdSpy.mockRestore();
    });
  });

  describe("findAll", () => {
    it("should return all users matching filters", async () => {
      mockKnex.select.mockReturnThis();
      mockKnex.where.mockResolvedValue([{ id: "1" }, { id: "2" }]);

      const result = await userModel.findAll({ status: USER_STATUS.ACTIVE });
      expect(mockKnex.select).toHaveBeenCalled();
      expect(mockKnex.where).toHaveBeenCalledWith({ status: USER_STATUS.ACTIVE });
      expect(result).toEqual([{ id: "1" }, { id: "2" }]);
    });
  });

  describe("deleteById", () => {
    it("should delete user by id", async () => {
      mockKnex.where.mockReturnThis();
      mockKnex.del.mockResolvedValue(1);

      const result = await userModel.deleteById("1");
      expect(mockKnex.where).toHaveBeenCalledWith({ id: "1" });
      expect(mockKnex.del).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe("wasPasswordChangedAfter", () => {
    it("should return false if user or password_changed_at is missing", async () => {
      mockKnex.select.mockReturnThis();
      mockKnex.where.mockReturnThis();
      mockKnex.first.mockResolvedValue(null);

      const result = await userModel.wasPasswordChangedAfter("1", new Date());
      expect(result).toBe(false);
    });

    it("should return true if password was changed after timestamp", async () => {
      const now = new Date();
      const later = new Date(now.getTime() + 1000);
      mockKnex.select.mockReturnThis();
      mockKnex.where.mockReturnThis();
      mockKnex.first.mockResolvedValue({ password_changed_at: later });

      const result = await userModel.wasPasswordChangedAfter("1", now);
      expect(result).toBe(true);
    });

    it("should return false if password was not changed after timestamp", async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);
      mockKnex.select.mockReturnThis();
      mockKnex.where.mockReturnThis();
      mockKnex.first.mockResolvedValue({ password_changed_at: earlier });

      const result = await userModel.wasPasswordChangedAfter("1", now);
      expect(result).toBe(false);
    });
  });
});