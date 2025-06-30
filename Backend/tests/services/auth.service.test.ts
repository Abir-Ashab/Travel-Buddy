import { AuthServices } from "../../src/services/auth.service";
import { userModel } from "../../src/repositories/user.repository";
import { isPasswordMatched } from "../../src/utils/auth.util";
import { USER_Role } from "../../src/interfaces/user.interface";
import jwt from "jsonwebtoken";
import config from "../../src/config";

jest.mock("../../src/repositories/user.repository");
jest.mock("../../src/utils/auth.util");
jest.mock("jsonwebtoken");
jest.mock("../../src/config", () => ({
  jwt_access_secret: "access_secret",
  jwt_refresh_secret: "refresh_secret",
  jwt_access_expires_in: "3600",
  jwt_refresh_expires_in: "86400",
}));

describe("AuthServices", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user if email does not exist", async () => {
      (userModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (userModel.create as jest.Mock).mockResolvedValue({ id: "1", email: "test@example.com" });

      const payload = { email: "test@example.com", password: "pass" } as any;
      const result = await AuthServices.register(payload);

      expect(userModel.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(userModel.create).toHaveBeenCalledWith(expect.objectContaining({ email: "test@example.com", role: USER_Role.EXPLORER }));
      expect(result).toEqual({ id: "1", email: "test@example.com" });
    });

    it("should throw error if user already exists", async () => {
      (userModel.findByEmail as jest.Mock).mockResolvedValue({ email: "test@example.com" });

      const payload = { email: "test@example.com", password: "pass" } as any;
      await expect(AuthServices.register(payload)).rejects.toThrow("User already exists");
    });
  });

  describe("login", () => {
    const user = {
      email: "test@example.com",
      password: "hashedpass",
      role: USER_Role.EXPLORER,
      status: "active",
    };

    it("should login user and return tokens", async () => {
      (userModel.findByEmailWithPassword as jest.Mock).mockResolvedValue(user);
      (isPasswordMatched as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValueOnce("access_token").mockReturnValueOnce("refresh_token");

      const payload = { email: "test@example.com", password: "pass" };
      const result = await AuthServices.login(payload);

      expect(userModel.findByEmailWithPassword).toHaveBeenCalledWith("test@example.com");
      expect(isPasswordMatched).toHaveBeenCalledWith("pass", "hashedpass");
      expect(result).toEqual({ accessToken: "access_token", refreshToken: "refresh_token" });
    });

    it("should throw error if user not found", async () => {
      (userModel.findByEmailWithPassword as jest.Mock).mockResolvedValue(null);

      await expect(AuthServices.login({ email: "notfound@example.com", password: "pass" })).rejects.toThrow("User not found");
    });

    it("should throw error if user is blocked", async () => {
      (userModel.findByEmailWithPassword as jest.Mock).mockResolvedValue({ ...user, status: "blocked" });

      await expect(AuthServices.login({ email: "test@example.com", password: "pass" })).rejects.toThrow("User is blocked");
    });

    it("should throw error if password does not match", async () => {
      (userModel.findByEmailWithPassword as jest.Mock).mockResolvedValue(user);
      (isPasswordMatched as jest.Mock).mockResolvedValue(false);

      await expect(AuthServices.login({ email: "test@example.com", password: "wrongpass" })).rejects.toThrow("Password not matched");
    });
  });

  describe("refreshToken", () => {
    it("should throw error if no token provided", async () => {
      await expect(AuthServices.refreshToken("")).rejects.toThrow("No refresh token provided");
    });

    it("should return new access token if refresh token is valid", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ email: "test@example.com", role: USER_Role.EXPLORER });
      (jwt.sign as jest.Mock).mockReturnValue("new_access_token");

      const result = await AuthServices.refreshToken("valid_refresh_token");
      expect(jwt.verify).toHaveBeenCalledWith("valid_refresh_token", "refresh_secret");
      expect(jwt.sign).toHaveBeenCalledWith(
        { email: "test@example.com", role: USER_Role.EXPLORER },
        "access_secret",
        { expiresIn: 3600 }
      );
      expect(result).toEqual({ accessToken: "new_access_token" });
    });

    it("should throw error if refresh token is invalid", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error("invalid"); });

      await expect(AuthServices.refreshToken("invalid_token")).rejects.toThrow("Invalid refresh token");
    });
  });
});