import { WishlistService } from "../../src/services/wishlist.service";
import { wishlistModel } from "../../src/repositories/wishlist.repository";
import { locationModel } from "../../src/repositories/location.repository";
import {
  Wishlist,
  WishlistWithItems,
  WishlistItem,
  WishlistItemWithLocation,
  CreateWishlistRequest,
  UpdateWishlistRequest,
  CreateWishlistItemRequest,
  UpdateWishlistItemRequest,
  WishlistShareResponse,
  WishlistFilters,
} from "../../src/interfaces/wishlist.interface";

jest.mock("../../src/repositories/wishlist.repository");
jest.mock("../../src/repositories/location.repository");

const mockWishlist: Wishlist = {
  id: "w1",
  user_id: "u1",
  name: "Summer Trips",
  description: "Trips for summer",
  grouping_type: "season",
  is_public: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockWishlistWithItems: WishlistWithItems = {
  ...mockWishlist,
  items: [
    {
      id: "item1",
      wishlist_id: "w1",
      location_id: "loc1",
      notes: "Must visit",
      estimated_budget: 1000,
      priority_level: 1,
      preferred_start_date: new Date(),
      preferred_end_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      location: {
        id: "loc1",
        name: "Paris",
        country: "France",
        region: "Ile-de-France",
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: "Europe/Paris",
      },
    },
  ],
};

describe("WishlistService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createWishlist", () => {
    it("should create and return a wishlist", async () => {
      (wishlistModel.create as jest.Mock).mockResolvedValue("w1");
      (wishlistModel.findById as jest.Mock).mockResolvedValue(mockWishlist);

      const req: CreateWishlistRequest = {
        name: "Summer Trips",
        grouping_type: "season",
      };

      const result = await WishlistService.createWishlist("u1", req);
      expect(wishlistModel.create).toHaveBeenCalledWith("u1", req);
      expect(result).toEqual(mockWishlist);
    });

    it("should throw if wishlist not found after creation", async () => {
      (wishlistModel.create as jest.Mock).mockResolvedValue("w1");
      (wishlistModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        WishlistService.createWishlist("u1", {
          name: "Test",
          grouping_type: "region",
        })
      ).rejects.toThrow("Wishlist not found after creation");
    });
  });

  describe("getWishlistById", () => {
    it("should return wishlist with items if public", async () => {
      (wishlistModel.findWithItems as jest.Mock).mockResolvedValue({
        ...mockWishlistWithItems,
        is_public: true,
      });

      const result = await WishlistService.getWishlistById("w1", "u2");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("w1");
    });

    it("should return wishlist with items if user is owner", async () => {
      (wishlistModel.findWithItems as jest.Mock).mockResolvedValue({
        ...mockWishlistWithItems,
        is_public: false,
        user_id: "u1",
      });

      const result = await WishlistService.getWishlistById("w1", "u1");
      expect(result).not.toBeNull();
    });

    it("should return null if wishlist not found", async () => {
      (wishlistModel.findWithItems as jest.Mock).mockResolvedValue(null);

      const result = await WishlistService.getWishlistById("w1", "u1");
      expect(result).toBeNull();
    });

    it("should return null if wishlist is private and user is not owner", async () => {
      (wishlistModel.findWithItems as jest.Mock).mockResolvedValue({
        ...mockWishlistWithItems,
        is_public: false,
        user_id: "u1",
      });

      const result = await WishlistService.getWishlistById("w1", "u2");
      expect(result).toBeNull();
    });
  });

  describe("getUserWishlists", () => {
    it("should return wishlists for user", async () => {
      (wishlistModel.findByUserId as jest.Mock).mockResolvedValue([mockWishlist]);
      const result = await WishlistService.getUserWishlists("u1");
      expect(result).toEqual([mockWishlist]);
    });
  });

  describe("getPublicWishlists", () => {
    it("should return public wishlists", async () => {
      (wishlistModel.findPublic as jest.Mock).mockResolvedValue([mockWishlist]);
      const result = await WishlistService.getPublicWishlists();
      expect(result).toEqual([mockWishlist]);
    });
  });

  describe("updateWishlist", () => {
    it("should update and return wishlist if owner", async () => {
      (wishlistModel.findById as jest.Mock).mockResolvedValue(mockWishlist);
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.update as jest.Mock).mockResolvedValue(undefined);
      (wishlistModel.findById as jest.Mock).mockResolvedValue({
        ...mockWishlist,
        name: "Updated",
      });

      const result = await WishlistService.updateWishlist("w1", "u1", { name: "Updated" });
      expect(result?.name).toBe("Updated");
    });

    it("should return null if wishlist not found", async () => {
      (wishlistModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await WishlistService.updateWishlist("w1", "u1", { name: "Updated" });
      expect(result).toBeNull();
    });

    it("should return null if not owner", async () => {
      (wishlistModel.findById as jest.Mock).mockResolvedValue(mockWishlist);
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(false);

      const result = await WishlistService.updateWishlist("w1", "u2", { name: "Updated" });
      expect(result).toBeNull();
    });
  });

  describe("deleteWishlist", () => {
    it("should delete wishlist if owner", async () => {
      (wishlistModel.findById as jest.Mock).mockResolvedValue(mockWishlist);
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.delete as jest.Mock).mockResolvedValue(true);

      const result = await WishlistService.deleteWishlist("w1", "u1");
      expect(result).toBe(true);
    });

    it("should return false if wishlist not found", async () => {
      (wishlistModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await WishlistService.deleteWishlist("w1", "u1");
      expect(result).toBe(false);
    });

    it("should return false if not owner", async () => {
      (wishlistModel.findById as jest.Mock).mockResolvedValue(mockWishlist);
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(false);

      const result = await WishlistService.deleteWishlist("w1", "u2");
      expect(result).toBe(false);
    });
  });

  describe("addWishlistItem", () => {
    const itemReq: CreateWishlistItemRequest = {
      location_id: "loc1",
      notes: "Go here",
      estimated_budget: 500,
      priority_level: 2,
    };

    it("should add item if owner and location exists and not duplicate", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.checkLocationExists as jest.Mock).mockResolvedValue(true);
      (wishlistModel.checkDuplicateItem as jest.Mock).mockResolvedValue(false);
      (wishlistModel.createItem as jest.Mock).mockResolvedValue("item1");
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue(mockWishlistWithItems.items[0]);

      const result = await WishlistService.addWishlistItem("w1", "u1", itemReq);
      expect(result?.id).toBe("item1");
    });

    it("should return null if not owner", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(false);

      const result = await WishlistService.addWishlistItem("w1", "u2", itemReq);
      expect(result).toBeNull();
    });

    it("should create location if not provided and location data given", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (locationModel.create as jest.Mock).mockResolvedValue("loc2");
      (wishlistModel.checkLocationExists as jest.Mock).mockResolvedValue(true);
      (wishlistModel.checkDuplicateItem as jest.Mock).mockResolvedValue(false);
      (wishlistModel.createItem as jest.Mock).mockResolvedValue("item2");
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue({
        ...mockWishlistWithItems.items[0],
        id: "item2",
        location_id: "loc2",
      });

      const req: CreateWishlistItemRequest = {
        location_id: "",
        location: {
          name: "London",
          country: "UK",
          region: "England",
          latitude: 51.5074,
          longitude: -0.1278,
        },
        notes: "Visit London",
        estimated_budget: 800,
        priority_level: 1,
      };

      const result = await WishlistService.addWishlistItem("w1", "u1", req);
      expect(locationModel.create).toHaveBeenCalled();
      expect(result?.id).toBe("item2");
    });

    it("should return null if location creation fails", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (locationModel.create as jest.Mock).mockRejectedValue(new Error("fail"));

      const req: CreateWishlistItemRequest = {
        location_id: "",
        location: {
          name: "London",
          country: "UK",
          region: "England",
          latitude: 51.5074,
          longitude: -0.1278,
        },
        notes: "Visit London",
        estimated_budget: 800,
        priority_level: 1,
      };

      const result = await WishlistService.addWishlistItem("w1", "u1", req);
      expect(result).toBeNull();
    });

    it("should return null if location does not exist", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.checkLocationExists as jest.Mock).mockResolvedValue(false);

      const result = await WishlistService.addWishlistItem("w1", "u1", itemReq);
      expect(result).toBeNull();
    });

    it("should return null if duplicate item", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.checkLocationExists as jest.Mock).mockResolvedValue(true);
      (wishlistModel.checkDuplicateItem as jest.Mock).mockResolvedValue(true);

      const result = await WishlistService.addWishlistItem("w1", "u1", itemReq);
      expect(result).toBeNull();
    });

    it("should throw if item not found after creation", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.checkLocationExists as jest.Mock).mockResolvedValue(true);
      (wishlistModel.checkDuplicateItem as jest.Mock).mockResolvedValue(false);
      (wishlistModel.createItem as jest.Mock).mockResolvedValue("item1");
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue(null);

      await expect(
        WishlistService.addWishlistItem("w1", "u1", itemReq)
      ).rejects.toThrow("Wishlist item not found after creation");
    });
  });

  describe("updateWishlistItem", () => {
    it("should update and return item if owner", async () => {
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue(mockWishlistWithItems.items[0]);
      (wishlistModel.checkItemOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.updateItem as jest.Mock).mockResolvedValue(undefined);
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue({
        ...mockWishlistWithItems.items[0],
        notes: "Updated notes",
      });

      const result = await WishlistService.updateWishlistItem("item1", "u1", { notes: "Updated notes" });
      expect(result?.notes).toBe("Updated notes");
    });

    it("should return null if item not found", async () => {
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue(null);

      const result = await WishlistService.updateWishlistItem("item1", "u1", { notes: "Updated notes" });
      expect(result).toBeNull();
    });

    it("should return null if not owner", async () => {
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue(mockWishlistWithItems.items[0]);
      (wishlistModel.checkItemOwnership as jest.Mock).mockResolvedValue(false);

      const result = await WishlistService.updateWishlistItem("item1", "u2", { notes: "Updated notes" });
      expect(result).toBeNull();
    });
  });

  describe("deleteWishlistItem", () => {
    it("should delete item if owner", async () => {
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue(mockWishlistWithItems.items[0]);
      (wishlistModel.checkItemOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.deleteItem as jest.Mock).mockResolvedValue(true);

      const result = await WishlistService.deleteWishlistItem("item1", "u1");
      expect(result).toBe(true);
    });

    it("should return false if item not found", async () => {
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue(null);

      const result = await WishlistService.deleteWishlistItem("item1", "u1");
      expect(result).toBe(false);
    });

    it("should return false if not owner", async () => {
      (wishlistModel.findItemById as jest.Mock).mockResolvedValue(mockWishlistWithItems.items[0]);
      (wishlistModel.checkItemOwnership as jest.Mock).mockResolvedValue(false);

      const result = await WishlistService.deleteWishlistItem("item1", "u2");
      expect(result).toBe(false);
    });
  });

  describe("shareWishlist", () => {
    it("should share wishlist if owner and make it public", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.findById as jest.Mock).mockResolvedValue({ ...mockWishlist, is_public: false });
      (wishlistModel.update as jest.Mock).mockResolvedValue(undefined);
      (wishlistModel.findWithItems as jest.Mock).mockResolvedValue({ ...mockWishlistWithItems, is_public: true });

      const result = await WishlistService.shareWishlist("w1", "u1");
      expect(result?.share_url).toContain("/wishlists/shared/w1");
      expect(result?.wishlist.id).toBe("w1");
    });

    it("should return null if not owner", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(false);

      const result = await WishlistService.shareWishlist("w1", "u2");
      expect(result).toBeNull();
    });

    it("should return null if wishlist not found", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await WishlistService.shareWishlist("w1", "u1");
      expect(result).toBeNull();
    });

    it("should return null if wishlistWithItems not found", async () => {
      (wishlistModel.checkOwnership as jest.Mock).mockResolvedValue(true);
      (wishlistModel.findById as jest.Mock).mockResolvedValue({ ...mockWishlist, is_public: false });
      (wishlistModel.findWithItems as jest.Mock).mockResolvedValue(null);

      const result = await WishlistService.shareWishlist("w1", "u1");
      expect(result).toBeNull();
    });
  });

  describe("getSharedWishlist", () => {
    it("should return wishlist if public", async () => {
      (wishlistModel.findWithItems as jest.Mock).mockResolvedValue({ ...mockWishlistWithItems, is_public: true });

      const result = await WishlistService.getSharedWishlist("w1");
      expect(result?.id).toBe("w1");
    });

    it("should return null if not found", async () => {
      (wishlistModel.findWithItems as jest.Mock).mockResolvedValue(null);

      const result = await WishlistService.getSharedWishlist("w1");
      expect(result).toBeNull();
    });

    it("should return null if not public", async () => {
      (wishlistModel.findWithItems as jest.Mock).mockResolvedValue({ ...mockWishlistWithItems, is_public: false });

      const result = await WishlistService.getSharedWishlist("w1");
      expect(result).toBeNull();
    });
  });
});
