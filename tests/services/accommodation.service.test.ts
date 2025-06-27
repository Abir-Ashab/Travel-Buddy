import { AccommodationService } from "../../src/services/accommodation.service";
import { accommodationModel } from "../../src/repositories/accommodation.repository";
import { postModel } from "../../src/repositories/post.repository";
import { Accommodation, CreateAccommodationRequest, UpdateAccommodationRequest } from "../../src/interfaces/accommodation.interface";

jest.mock("../../src/repositories/accommodation.repository");
jest.mock("../../src/repositories/post.repository");

const mockAccommodation: Accommodation = {
  id: "acc1",
  post_id: "post1",
  accommodation_type: "hotel",
  name: "Hotel Test",
  cost_per_night: 120,
  rating: 4,
  review: "Nice stay",
  notes: "Test notes",
  amenities: ["wifi", "pool"],
  check_in_date: new Date("2024-06-01"),
  check_out_date: new Date("2024-06-05"),
  created_at: new Date("2024-05-01"),
  updated_at: new Date("2024-05-02")
};

const mockPost = {
  id: "post1",
  user_id: "user1"
};

describe("AccommodationService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAccommodationsByPost", () => {
    it("should return accommodations for a post", async () => {
      (accommodationModel.findByPostId as jest.Mock).mockResolvedValue([mockAccommodation]);
      const result = await AccommodationService.getAccommodationsByPost("post1");
      expect(result).toEqual([mockAccommodation]);
      expect(accommodationModel.findByPostId).toHaveBeenCalledWith("post1");
    });
  });

  describe("getAccommodationById", () => {
    it("should return accommodation by id", async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(mockAccommodation);
      const result = await AccommodationService.getAccommodationById("acc1");
      expect(result).toEqual(mockAccommodation);
      expect(accommodationModel.findById).toHaveBeenCalledWith("acc1");
    });

    it("should return null if accommodation not found", async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await AccommodationService.getAccommodationById("notfound");
      expect(result).toBeNull();
    });
  });

  describe("createAccommodation", () => {
    const validData: CreateAccommodationRequest = {
      accommodation_type: "hotel",
      name: "Hotel Test",
      cost_per_night: 120,
      rating: 5,
      review: "Great place",
      notes: "Test notes",
      amenities: ["wifi", "pool"],
      check_in_date: "2024-06-01",
      check_out_date: "2024-06-05"
    };

    it("should create accommodation with valid data", async () => {
      (accommodationModel.create as jest.Mock).mockResolvedValue("acc1");
      (accommodationModel.findById as jest.Mock).mockResolvedValue(mockAccommodation);

      const result = await AccommodationService.createAccommodation("post1", validData);
      expect(accommodationModel.create).toHaveBeenCalledWith({ post_id: "post1", ...validData });
      expect(result).toEqual(mockAccommodation);
    });

    it("should throw error if rating is invalid", async () => {
      await expect(
        AccommodationService.createAccommodation("post1", { ...validData, rating: 0 })
      ).rejects.toThrow("Rating must be between 1 and 5");
      await expect(
        AccommodationService.createAccommodation("post1", { ...validData, rating: 6 })
      ).rejects.toThrow("Rating must be between 1 and 5");
    });

    it("should throw error if check-out date is before check-in date", async () => {
      await expect(
        AccommodationService.createAccommodation("post1", {
          ...validData,
          check_in_date: "2024-06-05",
          check_out_date: "2024-06-01"
        })
      ).rejects.toThrow("Check-out date must be after check-in date");
    });

    it("should throw error if accommodation not found after creation", async () => {
      (accommodationModel.create as jest.Mock).mockResolvedValue("acc1");
      (accommodationModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        AccommodationService.createAccommodation("post1", validData)
      ).rejects.toThrow("Accommodation not found after creation");
    });
  });

  describe("updateAccommodation", () => {
    const updateData: UpdateAccommodationRequest = {
      accommodation_type: "airbnb",
      name: "Updated Hotel",
      cost_per_night: 150,
      rating: 3,
      review: "Decent",
      amenities: ["wifi"],
      check_in_date: "2024-06-02",
      check_out_date: "2024-06-06"
    };

    it("should update accommodation with valid data", async () => {
      (accommodationModel.findById as jest.Mock)
        .mockResolvedValueOnce(mockAccommodation) // for findById before update
        .mockResolvedValueOnce({ ...mockAccommodation, ...updateData }); // for findById after update
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (accommodationModel.update as jest.Mock).mockResolvedValue(undefined);

      const result = await AccommodationService.updateAccommodation("acc1", updateData);
      expect(accommodationModel.update).toHaveBeenCalledWith("acc1", updateData);
      expect(result).toEqual({ ...mockAccommodation, ...updateData });
    });

    it("should return null if accommodation not found", async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await AccommodationService.updateAccommodation("notfound", updateData);
      expect(result).toBeNull();
    });

    it("should throw error if rating is invalid", async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(mockAccommodation);
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);

      await expect(
        AccommodationService.updateAccommodation("acc1", { ...updateData, rating: 0 })
      ).rejects.toThrow("Rating must be between 1 and 5");
    });

    it("should throw error if check-out date is before check-in date", async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(mockAccommodation);
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);

      await expect(
        AccommodationService.updateAccommodation("acc1", {
          ...updateData,
          check_in_date: "2024-06-10",
          check_out_date: "2024-06-01"
        })
      ).rejects.toThrow("Check-out date must be after check-in date");
    });
  });

  describe("deleteAccommodation", () => {
    it("should delete accommodation if found", async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(mockAccommodation);
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (accommodationModel.delete as jest.Mock).mockResolvedValue(true);

      const result = await AccommodationService.deleteAccommodation("acc1");
      expect(result).toBe(true);
      expect(accommodationModel.delete).toHaveBeenCalledWith("acc1");
    });

    it("should return false if accommodation not found", async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await AccommodationService.deleteAccommodation("notfound");
      expect(result).toBe(false);
    });
  });
});
