import { isPasswordMatched } from "../../src/utils/auth.util";
import bcryptjs from "bcryptjs";

jest.mock("bcryptjs");

describe("isPasswordMatched", () => {
  const mockCompare = bcryptjs.compare as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when passwords match", async () => {
    mockCompare.mockResolvedValueOnce(true);

    const result = await isPasswordMatched("plainPassword", "hashedPassword");
    expect(result).toBe(true);
    expect(mockCompare).toHaveBeenCalledWith("plainPassword", "hashedPassword");
  });

  it("should return false when passwords do not match", async () => {
    mockCompare.mockResolvedValueOnce(false);

    const result = await isPasswordMatched("plainPassword", "hashedPassword");
    expect(result).toBe(false);
    expect(mockCompare).toHaveBeenCalledWith("plainPassword", "hashedPassword");
  });

  it("should throw an error if bcryptjs.compare throws", async () => {
    mockCompare.mockRejectedValueOnce(new Error("bcrypt error"));

    await expect(
      isPasswordMatched("plainPassword", "hashedPassword")
    ).rejects.toThrow("bcrypt error");
    expect(mockCompare).toHaveBeenCalledWith("plainPassword", "hashedPassword");
  });

  it("should call bcryptjs.compare with correct arguments", async () => {
    mockCompare.mockResolvedValueOnce(true);

    await isPasswordMatched("test123", "hash456");
    expect(mockCompare).toHaveBeenCalledWith("test123", "hash456");
  });
});