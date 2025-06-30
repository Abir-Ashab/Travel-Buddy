import { wishlistModel } from "../../src/repositories/wishlist.repository";
import { getConnection } from "../../src/database";
import {
  Wishlist,
  WishlistItem,
  WishlistWithItems,
  WishlistItemWithLocation,
  CreateWishlistRequest,
  UpdateWishlistRequest,
  CreateWishlistItemRequest,
  UpdateWishlistItemRequest,
  WishlistFilters
} from "../../src/interfaces/wishlist.interface";

jest.mock("../../src/database");

describe("WishlistModel", () => {
  let mockKnex: jest.Mock;
  let mockWhere: jest.Mock;
  let mockFirst: jest.Mock;
  let mockInsert: jest.Mock;
  let mockReturning: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDel: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockSelect: jest.Mock;
  let mockJoin: jest.Mock;
  let mockFn: { now: jest.Mock };
  let mockRaw: jest.Mock;
  let mockOffset: jest.Mock;
  let mockLimit: jest.Mock;

  function createChainableObject() {
    const chainable: any = {};
    chainable.where = jest.fn(() => chainable);
    chainable.first = jest.fn(() => chainable);
    chainable.insert = jest.fn(() => chainable);
    chainable.returning = jest.fn(() => chainable);
    chainable.update = jest.fn(() => chainable);
    chainable.del = jest.fn(() => chainable);
    chainable.orderBy = jest.fn(() => chainable);
    chainable.select = jest.fn(() => chainable);
    chainable.join = jest.fn(() => chainable);
    chainable.offset = jest.fn(() => chainable);
    chainable.limit = jest.fn(() => chainable);
    chainable.raw = jest.fn(() => chainable);
    chainable.fn = { now: jest.fn(() => "2024-01-01T00:00:00Z") };
    return chainable;
  }

  beforeEach(() => {
    jest.clearAllMocks();

    mockWhere = jest.fn();
    mockFirst = jest.fn();
    mockInsert = jest.fn();
    mockReturning = jest.fn();
    mockUpdate = jest.fn();
    mockDel = jest.fn();
    mockOrderBy = jest.fn();
    mockSelect = jest.fn();
    mockJoin = jest.fn();
    mockFn = { now: jest.fn(() => "2024-01-01T00:00:00Z") };
    mockRaw = jest.fn((sql) => `RAW(${sql})`);
    mockOffset = jest.fn();
    mockLimit = jest.fn();
    mockKnex = jest.fn();
    mockKnex.mockImplementation(() => createChainableObject());

    mockWhere.mockImplementation(() => createChainableObject());
    mockOrderBy.mockImplementation(() => createChainableObject());
    mockLimit.mockImplementation(() => createChainableObject());
    mockOffset.mockImplementation(() => createChainableObject());
    mockJoin.mockImplementation(() => createChainableObject());

    const createChainableObject = () => ({
      where: mockWhere,
      first: mockFirst,
      insert: mockInsert,
      returning: mockReturning,
      update: mockUpdate,
      del: mockDel,
      orderBy: mockOrderBy,
      select: mockSelect,
      join: mockJoin,
      fn: mockFn,
      raw: mockRaw,
      offset: mockOffset,
      limit: mockLimit,
    });

    mockKnex.mockImplementation(() => createChainableObject());
    (mockKnex as any).fn = mockFn;
    (mockKnex as any).raw = mockRaw;

    mockWhere.mockImplementation(() => createChainableObject());
    mockOrderBy.mockImplementation(() => createChainableObject());
    mockInsert.mockImplementation(() => createChainableObject());
    mockUpdate.mockImplementation(() => createChainableObject());
    mockDel.mockImplementation(() => createChainableObject());
    mockSelect.mockImplementation(() => createChainableObject());
    mockJoin.mockImplementation(() => createChainableObject());
    mockOffset.mockImplementation(() => createChainableObject());
    mockLimit.mockImplementation(() => createChainableObject());

    (getConnection as jest.Mock).mockReturnValue({
      getClient: () => mockKnex,
    });

    mockFirst.mockResolvedValue(null);
    mockReturning.mockResolvedValue([{ id: "test-id" }]);
    mockOrderBy.mockResolvedValue([]);
    mockUpdate.mockResolvedValue(1);
    mockDel.mockResolvedValue(1);
    mockSelect.mockResolvedValue([]);
    mockJoin.mockResolvedValue([]);
    mockOffset.mockResolvedValue([]);
    mockLimit.mockResolvedValue([]);
  });

  describe("create", () => {
    it("should create a wishlist and return its id", async () => {
      mockReturning.mockResolvedValueOnce([{ id: "wishlist-1" }]);
      const data: CreateWishlistRequest = {
        name: "Trip",
        description: "Summer trip",
        grouping_type: "region",
        is_public: true,
      };
      const id = await wishlistModel.create("user-1", data);
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-1",
        name: "Trip",
        description: "Summer trip",
        grouping_type: "region",
        is_public: true,
      });
      expect(mockReturning).toHaveBeenCalledWith("id");
      expect(id).toBe("wishlist-1");
    });

    it("should create a wishlist with is_public defaulting to false", async () => {
      mockReturning.mockResolvedValueOnce([{ id: "wishlist-2" }]);
      const data: CreateWishlistRequest = {
        name: "Private Trip",
        description: "Private summer trip",
        grouping_type: "region",
      };
      const id = await wishlistModel.create("user-1", data);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-1",
        name: "Private Trip",
        description: "Private summer trip",
        grouping_type: "region",
        is_public: false,
      });
      expect(id).toBe("wishlist-2");
    });
  });

  describe("findById", () => {
    it("should return wishlist by id", async () => {
      const wishlist = { id: "w1" };
      mockFirst.mockResolvedValueOnce(wishlist);
      const result = await wishlistModel.findById("w1");
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockWhere).toHaveBeenCalledWith("id", "w1");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(wishlist);
    });

    it("should return null if not found", async () => {
      mockFirst.mockResolvedValueOnce(null);
      const result = await wishlistModel.findById("notfound");
      expect(result).toBeNull();
    });
  });

  describe("findWithItems", () => {
    it("should return null if wishlist not found", async () => {
      mockFirst.mockResolvedValueOnce(null);
      const result = await wishlistModel.findWithItems("notfound");
      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return wishlists for user", async () => {
      const wishlists = [{ id: "w3" }];
      mockOrderBy.mockResolvedValueOnce(wishlists);
      const result = await wishlistModel.findByUserId("user-2");
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-2");
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(result).toBe(wishlists);
    });

    it("should apply grouping_type filter", async () => {
      const wishlists = [{ id: "w4" }];
      mockOrderBy.mockResolvedValueOnce(wishlists);
      const filters: WishlistFilters = { grouping_type: "region" };

      await wishlistModel.findByUserId("user-2", filters);
      
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-2");
      expect(mockWhere).toHaveBeenCalledWith("grouping_type", "region");
    });

    it("should apply is_public filter", async () => {
      const wishlists = [{ id: "w5" }];
      mockOrderBy.mockResolvedValueOnce(wishlists);
      const filters: WishlistFilters = { is_public: true };
      
      await wishlistModel.findByUserId("user-2", filters);
      
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-2");
      expect(mockWhere).toHaveBeenCalledWith("is_public", true);
    });

    it("should apply search filter", async () => {
      const wishlists = [{ id: "w6" }];
      const mockWhereFunction = jest.fn();
      const chainable = createChainableObject();
      chainable.where = jest.fn((fn) => {
        if (typeof fn === 'function') {
          const mockThis = {
            where: jest.fn(() => ({ orWhere: jest.fn() })),
            orWhere: jest.fn()
          };
          fn.call(mockThis);
        }
        return chainable;
      });
      
      mockWhere.mockReturnValueOnce(chainable);
      mockOrderBy.mockResolvedValueOnce(wishlists);
      
      const filters: WishlistFilters = { search: "paris" };
      
      await wishlistModel.findByUserId("user-2", filters);
      
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-2");
      expect(chainable.where).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("findPublic", () => {
    it("should return public wishlists", async () => {
      const wishlists = [{ id: "w5" }];
      mockOrderBy.mockResolvedValueOnce(wishlists);
      const result = await wishlistModel.findPublic();
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockWhere).toHaveBeenCalledWith("is_public", true);
      expect(result).toBe(wishlists);
    });

    it("should apply grouping_type filter", async () => {
      const wishlists = [{ id: "w10" }];
      mockOrderBy.mockResolvedValueOnce(wishlists);
      const filters: WishlistFilters = { grouping_type: "region" };

      await wishlistModel.findPublic(filters);
      
      expect(mockWhere).toHaveBeenCalledWith("is_public", true);
      expect(mockWhere).toHaveBeenCalledWith("grouping_type", "region");
    });

    it("should apply search filter", async () => {
      const wishlists = [{ id: "w11" }];
      const chainable = createChainableObject();
      chainable.where = jest.fn((fn) => {
        if (typeof fn === 'function') {
          const mockThis = {
            where: jest.fn(() => ({ orWhere: jest.fn() })),
            orWhere: jest.fn()
          };
          fn.call(mockThis);
        }
        return chainable;
      });
      
      mockWhere.mockReturnValueOnce(chainable);
      mockOrderBy.mockResolvedValueOnce(wishlists);
      
      const filters: WishlistFilters = { search: "tokyo" };
      
      await wishlistModel.findPublic(filters);
      
      expect(mockWhere).toHaveBeenCalledWith("is_public", true);
      expect(chainable.where).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("update", () => {
    it("should update wishlist", async () => {
      const data: UpdateWishlistRequest = { name: "Updated" };
      await wishlistModel.update("w6", data);
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockWhere).toHaveBeenCalledWith("id", "w6");
      expect(mockUpdate).toHaveBeenCalledWith({
        ...data,
        updated_at: "2024-01-01T00:00:00Z",
      });
    });

    it("should update wishlist with multiple fields", async () => {
      const data: UpdateWishlistRequest = { 
        name: "Updated Name",
        description: "Updated Description",
        is_public: false
      };
      await wishlistModel.update("w13", data);
      expect(mockUpdate).toHaveBeenCalledWith({
        ...data,
        updated_at: "2024-01-01T00:00:00Z",
      });
    });
  });

  describe("delete", () => {
    it("should delete wishlist and return true", async () => {
      mockDel.mockResolvedValueOnce(1);
      const result = await wishlistModel.delete("w7");
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockWhere).toHaveBeenCalledWith("id", "w7");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if no wishlist deleted", async () => {
      mockDel.mockResolvedValueOnce(0);
      const result = await wishlistModel.delete("w8");
      expect(result).toBe(false);
    });
  });

  describe("createItem", () => {
    it("should create wishlist item with location", async () => {
      const data: CreateWishlistItemRequest = {
        notes: "note",
        estimated_budget: 100,
        priority_level: 1,
        preferred_start_date: undefined,
        preferred_end_date: undefined,
        location: {
          name: "Paris",
          country: "France",
          region: "Ile-de-France",
          latitude: 48.85,
          longitude: 2.35,
          timezone: "Europe/Paris",
        },
      };
      mockReturning.mockResolvedValueOnce([{ id: "loc-1" }]);
      mockReturning.mockResolvedValueOnce([{ id: "item-1" }]);
      const id = await wishlistModel.createItem("w9", data);
      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockInsert).toHaveBeenCalled();
      expect(mockKnex().raw).toHaveBeenCalled();
      expect(id).toBe("item-1");
    });

    it("should create wishlist item with location without timezone", async () => {
      const data: CreateWishlistItemRequest = {
        notes: "note",
        estimated_budget: 100,
        priority_level: 1,
        preferred_start_date: undefined,
        preferred_end_date: undefined,
        location: {
          name: "London",
          country: "UK",
          region: "England",
          latitude: 51.5074,
          longitude: -0.1278,
        },
      };
      mockReturning.mockResolvedValueOnce([{ id: "loc-2" }]);
      mockReturning.mockResolvedValueOnce([{ id: "item-2" }]);
      
      const id = await wishlistModel.createItem("w10", data);
      
      expect(mockInsert).toHaveBeenCalledWith({
        name: "London",
        country: "UK",
        region: "England",
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: null
      });
      expect(id).toBe("item-2");
    });

    it("should create wishlist item with existing location_id", async () => {
      const data: CreateWishlistItemRequest = {
        notes: "note",
        estimated_budget: 100,
        priority_level: 1,
        preferred_start_date: undefined,
        preferred_end_date: undefined,
        location_id: "loc-2",
      };
      mockReturning.mockResolvedValueOnce([{ id: "item-2" }]);
      const id = await wishlistModel.createItem("w10", data);
      expect(mockKnex).toHaveBeenCalledWith("wishlist_items");
      expect(mockInsert).toHaveBeenCalledWith({
        wishlist_id: "w10",
        location_id: "loc-2",
        notes: "note",
        estimated_budget: 100,
        priority_level: 1,
        preferred_start_date: undefined,
        preferred_end_date: undefined,
      });
      expect(id).toBe("item-2");
    });

    it("should create wishlist item with dates", async () => {
      const data: CreateWishlistItemRequest = {
        notes: "note with dates",
        estimated_budget: 200,
        priority_level: 2,
        preferred_start_date: "2024-06-01",
        preferred_end_date: "2024-06-10",
        location_id: "loc-3",
      };
      mockReturning.mockResolvedValueOnce([{ id: "item-3" }]);
      
      const id = await wishlistModel.createItem("w11", data);
      
      expect(mockInsert).toHaveBeenCalledWith({
        wishlist_id: "w11",
        location_id: "loc-3",
        notes: "note with dates",
        estimated_budget: 200,
        priority_level: 2,
        preferred_start_date: "2024-06-01",
        preferred_end_date: "2024-06-10",
      });
      expect(id).toBe("item-3");
    });
  });

  describe("findItemById", () => {
    it("should return wishlist item by id", async () => {
      const item = { id: "item-3" };
      mockFirst.mockResolvedValueOnce(item);
      const result = await wishlistModel.findItemById("item-3");
      expect(mockKnex).toHaveBeenCalledWith("wishlist_items");
      expect(mockWhere).toHaveBeenCalledWith("id", "item-3");
      expect(result).toBe(item);
    });

    it("should return null if item not found", async () => {
      mockFirst.mockResolvedValueOnce(null);
      const result = await wishlistModel.findItemById("notfound");
      expect(result).toBeNull();
    });
  });

  describe("updateItem", () => {
    it("should update wishlist item", async () => {
      const data: UpdateWishlistItemRequest = { notes: "updated" };
      await wishlistModel.updateItem("item-4", data);
      expect(mockKnex).toHaveBeenCalledWith("wishlist_items");
      expect(mockWhere).toHaveBeenCalledWith("id", "item-4");
      expect(mockUpdate).toHaveBeenCalledWith({
        ...data,
        updated_at: "2024-01-01T00:00:00Z",
      });
    });

    it("should update wishlist item with multiple fields", async () => {
      const data: UpdateWishlistItemRequest = { 
        notes: "updated notes",
        estimated_budget: 150,
        priority_level: 3
      };
      await wishlistModel.updateItem("item-5", data);
      expect(mockUpdate).toHaveBeenCalledWith({
        ...data,
        updated_at: "2024-01-01T00:00:00Z",
      });
    });
  });

  describe("deleteItem", () => {
    it("should delete wishlist item and return true", async () => {
      mockDel.mockResolvedValueOnce(1);
      const result = await wishlistModel.deleteItem("item-5");
      expect(mockKnex).toHaveBeenCalledWith("wishlist_items");
      expect(mockWhere).toHaveBeenCalledWith("id", "item-5");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if no item deleted", async () => {
      mockDel.mockResolvedValueOnce(0);
      const result = await wishlistModel.deleteItem("item-6");
      expect(result).toBe(false);
    });
  });

  describe("checkOwnership", () => {
    it("should return true if user owns wishlist", async () => {
      mockFirst.mockResolvedValueOnce({ id: "w11" });
      const result = await wishlistModel.checkOwnership("w11", "user-11");
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockWhere).toHaveBeenCalledWith({ id: "w11", user_id: "user-11" });
      expect(result).toBe(true);
    });

    it("should return false if user does not own wishlist", async () => {
      mockFirst.mockResolvedValueOnce(null);
      const result = await wishlistModel.checkOwnership("w12", "user-12");
      expect(result).toBe(false);
    });
  });

  describe("checkLocationExists", () => {
    it("should return true if location exists", async () => {
      mockFirst.mockResolvedValueOnce({ id: "loc-3" });
      const result = await wishlistModel.checkLocationExists("loc-3");
      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith({ id: "loc-3" });
      expect(result).toBe(true);
    });

    it("should return false if location does not exist", async () => {
      mockFirst.mockResolvedValueOnce(null);
      const result = await wishlistModel.checkLocationExists("loc-4");
      expect(result).toBe(false);
    });

    it("should return false if locationId is undefined", async () => {
      const result = await wishlistModel.checkLocationExists(undefined);
      expect(result).toBe(false);
      expect(mockKnex).not.toHaveBeenCalled();
    });
  });

  describe("checkDuplicateItem", () => {
    it("should return true if duplicate item exists", async () => {
      mockFirst.mockResolvedValueOnce({ id: "item-9" });
      const result = await wishlistModel.checkDuplicateItem("w13", "loc-5");
      expect(mockKnex).toHaveBeenCalledWith("wishlist_items");
      expect(mockWhere).toHaveBeenCalledWith({ wishlist_id: "w13", location_id: "loc-5" });
      expect(result).toBe(true);
    });

    it("should return false if no duplicate item", async () => {
      mockFirst.mockResolvedValueOnce(null);
      const result = await wishlistModel.checkDuplicateItem("w14", "loc-6");
      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should throw error if database connection is undefined", async () => {
      (getConnection as jest.Mock).mockReturnValueOnce(undefined);
      expect(() => (wishlistModel as any).knex).toThrow("Database connection is undefined");
    });

    it("should throw error if getClient is undefined", async () => {
      (getConnection as jest.Mock).mockReturnValueOnce({
        getClient: undefined,
      });
      expect(() => (wishlistModel as any).knex).toThrow("connection.getClient is not a function");
    });
  });

  describe("edge cases", () => {
    it("should handle empty filters in findByUserId", async () => {
      const wishlists = [{ id: "w15" }];
      mockOrderBy.mockResolvedValueOnce(wishlists);
      
      const result = await wishlistModel.findByUserId("user-3", {});
      
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-3");
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(result).toBe(wishlists);
    });

    it("should handle empty filters in findPublic", async () => {
      const wishlists = [{ id: "w16" }];
      mockOrderBy.mockResolvedValueOnce(wishlists);
      
      const result = await wishlistModel.findPublic({});
      
      expect(mockWhere).toHaveBeenCalledWith("is_public", true);
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(result).toBe(wishlists);
    });

    it("should handle is_public filter set to false in findByUserId", async () => {
      const wishlists = [{ id: "w17" }];
      mockOrderBy.mockResolvedValueOnce(wishlists);
      const filters: WishlistFilters = { is_public: false };
      
      await wishlistModel.findByUserId("user-4", filters);
      
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-4");
      expect(mockWhere).toHaveBeenCalledWith("is_public", false);
    });

    it("should handle zero values in createItem", async () => {
      const data: CreateWishlistItemRequest = {
        notes: "",
        estimated_budget: 0,
        priority_level: 0,
        preferred_start_date: null,
        preferred_end_date: null,
        location_id: "loc-zero",
      };
      mockReturning.mockResolvedValueOnce([{ id: "item-zero" }]);
      
      const id = await wishlistModel.createItem("w-zero", data);
      
      expect(mockInsert).toHaveBeenCalledWith({
        wishlist_id: "w-zero",
        location_id: "loc-zero",
        notes: "",
        estimated_budget: 0,
        priority_level: 0,
        preferred_start_date: null,
        preferred_end_date: null,
      });
      expect(id).toBe("item-zero");
    });

    it("should handle updating item with null values", async () => {
      const data: UpdateWishlistItemRequest = { 
        notes: null,
        estimated_budget: null,
        preferred_start_date: null,
        preferred_end_date: null
      };
      await wishlistModel.updateItem("item-null", data);
      
      expect(mockUpdate).toHaveBeenCalledWith({
        notes: null,
        estimated_budget: null,
        preferred_start_date: null,
        preferred_end_date: null,
        updated_at: "2024-01-01T00:00:00Z",
      });
    });

    it("should handle updating wishlist with null values", async () => {
      const data: UpdateWishlistRequest = { 
        name: null,
        description: null,
        is_public: null
      };
      await wishlistModel.update("w-null", data);
      
      expect(mockUpdate).toHaveBeenCalledWith({
        name: null,
        description: null,
        is_public: null,
        updated_at: "2024-01-01T00:00:00Z",
      });
    });

    it("should handle location with zero coordinates", async () => {
      const data: CreateWishlistItemRequest = {
        notes: "Equator location",
        estimated_budget: 50,
        priority_level: 1,
        location: {
          name: "Null Island",
          country: "Ocean",
          region: "Atlantic",
          latitude: 0,
          longitude: 0,
          timezone: "UTC",
        },
      };
      mockReturning.mockResolvedValueOnce([{ id: "loc-zero" }]);
      mockReturning.mockResolvedValueOnce([{ id: "item-equator" }]);
      
      const id = await wishlistModel.createItem("w-equator", data);
      
      expect(mockInsert).toHaveBeenCalledWith({
        name: "Null Island",
        country: "Ocean",
        region: "Atlantic",
        latitude: 0,
        longitude: 0,
        timezone: "UTC"
      });
      expect(id).toBe("item-equator");
    });

    it("should handle very long search strings", async () => {
      const longSearch = "a".repeat(1000);
      const wishlists = [{ id: "w-long" }];
      const chainable = createChainableObject();
      chainable.where = jest.fn((fn) => {
        if (typeof fn === 'function') {
          const mockThis = {
            where: jest.fn(() => ({ orWhere: jest.fn() })),
            orWhere: jest.fn()
          };
          fn.call(mockThis);
        }
        return chainable;
      });
      
      mockWhere.mockReturnValueOnce(chainable);
      mockOrderBy.mockResolvedValueOnce(wishlists);
      
      const filters: WishlistFilters = { search: longSearch };
      
      await wishlistModel.findByUserId("user-long", filters);
      
      expect(chainable.where).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle extreme coordinate values", async () => {
      const data: CreateWishlistItemRequest = {
        notes: "Extreme location",
        estimated_budget: 1000,
        priority_level: 1,
        location: {
          name: "North Pole",
          country: "Arctic",
          region: "Polar",
          latitude: 90,
          longitude: 180,
          timezone: "UTC",
        },
      };
      mockReturning.mockResolvedValueOnce([{ id: "loc-extreme" }]);
      mockReturning.mockResolvedValueOnce([{ id: "item-extreme" }]);
      
      const id = await wishlistModel.createItem("w-extreme", data);
      
      expect(mockInsert).toHaveBeenCalledWith({
        name: "North Pole",
        country: "Arctic",
        region: "Polar",
        latitude: 90,
        longitude: 180,
        timezone: "UTC"
      });
      expect(id).toBe("item-extreme");
    });

    it("should handle negative coordinate values", async () => {
      const data: CreateWishlistItemRequest = {
        notes: "Southern location",
        estimated_budget: 500,
        priority_level: 2,
        location: {
          name: "South Pole",
          country: "Antarctica",
          region: "Polar",
          latitude: -90,
          longitude: -180,
          timezone: "UTC",
        },
      };
      mockReturning.mockResolvedValueOnce([{ id: "loc-negative" }]);
      mockReturning.mockResolvedValueOnce([{ id: "item-negative" }]);
      
      const id = await wishlistModel.createItem("w-negative", data);
      
      expect(mockInsert).toHaveBeenCalledWith({
        name: "South Pole",
        country: "Antarctica",
        region: "Polar",
        latitude: -90,
        longitude: -180,
        timezone: "UTC"
      });
      expect(id).toBe("item-negative");
    });
  });

  describe("complex scenarios", () => {
    it("should handle all filters combined in findByUserId", async () => {
      const wishlists = [{ id: "w-all-filters" }];
      const chainable = createChainableObject();
      chainable.where = jest.fn((fn) => {
        if (typeof fn === 'function') {
          const mockThis = {
            where: jest.fn(() => ({ orWhere: jest.fn() })),
            orWhere: jest.fn()
          };
          fn.call(mockThis);
        }
        return chainable;
      });
      
      mockWhere.mockReturnValueOnce(chainable);
      mockLimit.mockResolvedValueOnce(wishlists);
      
      const filters: WishlistFilters = { 
        grouping_type: "region",
        is_public: true,
        search: "vacation",
        limit: 10,
        offset: 5
      };
      
      await wishlistModel.findByUserId("user-all", filters);
      expect(chainable.where).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle all filters combined in findPublic", async () => {
      const wishlists = [{ id: "w-public-all" }];
      const chainable = createChainableObject();
      chainable.where = jest.fn((fn) => {
        if (typeof fn === 'function') {
          const mockThis = {
            where: jest.fn(() => ({ orWhere: jest.fn() })),
            orWhere: jest.fn()
          };
          fn.call(mockThis);
        }
        return chainable;
      });
      
      mockWhere.mockReturnValueOnce(chainable);
      mockLimit.mockResolvedValueOnce(wishlists);
      
      const filters: WishlistFilters = { 
        grouping_type: "region",
        search: "adventure",
        limit: 20,
        offset: 10
      };
      
      await wishlistModel.findPublic(filters);
      
      expect(chainable.where).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("database connection edge cases", () => {
    it("should handle null database connection", () => {
      (getConnection as jest.Mock).mockReturnValueOnce(null);
      expect(() => (wishlistModel as any).knex).toThrow("Database connection is undefined");
    });

    it("should handle connection object without getClient method", () => {
      (getConnection as jest.Mock).mockReturnValueOnce({});
      expect(() => (wishlistModel as any).knex).toThrow("connection.getClient is not a function");
    });

    it("should handle connection with null getClient", () => {
      (getConnection as jest.Mock).mockReturnValueOnce({
        getClient: null,
      });
      expect(() => (wishlistModel as any).knex).toThrow("connection.getClient is not a function");
    });
  });

  describe("method chaining validation", () => {
    it("should validate proper method chaining in create", async () => {
      mockReturning.mockResolvedValueOnce([{ id: "chain-test" }]);
      const data: CreateWishlistRequest = {
        name: "Chain Test",
        description: "Testing method chaining",
        grouping_type: "region",
        is_public: false,
      };
      
      await wishlistModel.create("user-chain", data);
      
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockInsert).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalledWith("id");
    });

    it("should validate proper method chaining in update", async () => {
      const data: UpdateWishlistRequest = { name: "Chain Updated" };
      
      await wishlistModel.update("w-chain", data);
      
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockWhere).toHaveBeenCalledWith("id", "w-chain");
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("should validate proper method chaining in delete", async () => {
      mockDel.mockResolvedValueOnce(1);
      
      await wishlistModel.delete("w-chain-del");
      
      expect(mockKnex).toHaveBeenCalledWith("wishlists");
      expect(mockWhere).toHaveBeenCalledWith("id", "w-chain-del");
      expect(mockDel).toHaveBeenCalled();
    });
  });
});