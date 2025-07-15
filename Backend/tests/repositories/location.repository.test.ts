import { locationModel } from "../../src/repositories/location.repository";
import { getConnection } from "../../src/database";

jest.mock("../../src/database");

describe("LocationModel", () => {
  let mockKnex: jest.Mock;

  let mockSelect: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;
  let mockOffset: jest.Mock;
  let mockFirst: jest.Mock;
  let mockInsert: jest.Mock;
  let mockReturning: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDel: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create all mocks
    mockKnex = jest.fn();
    mockSelect = jest.fn();
    mockWhere = jest.fn();
    mockOrWhere = jest.fn();
    mockOrderBy = jest.fn();
    mockLimit = jest.fn();
    mockOffset = jest.fn();
    mockFirst = jest.fn();
    mockInsert = jest.fn();
    mockReturning = jest.fn();
    mockUpdate = jest.fn();
    mockDel = jest.fn();

    // Create a single chainable object that persists throughout the chain
    const chainable = {
      select: mockSelect,
      where: mockWhere,
      orWhere: mockOrWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      offset: mockOffset,
      first: mockFirst,
      insert: mockInsert,
      returning: mockReturning,
      update: mockUpdate,
      del: mockDel,
    };

    // Each method must return the SAME chainable object
    mockKnex.mockImplementation(() => chainable);
    mockSelect.mockImplementation(() => chainable);
    mockWhere.mockImplementation(() => chainable);
    mockOrWhere.mockImplementation(() => chainable);
    mockOrderBy.mockImplementation(() => chainable);
    mockLimit.mockImplementation(() => chainable);
    mockOffset.mockImplementation(() => chainable);
    mockInsert.mockImplementation(() => chainable);
    mockUpdate.mockImplementation(() => chainable);

    // Set default resolved values - these will be overridden in individual tests
    mockOffset.mockResolvedValue([{ id: "offset-result" }]);
    mockLimit.mockResolvedValue([{ id: "limit-result" }]);
    mockFirst.mockResolvedValue(null);
    mockReturning.mockResolvedValue([{ id: "loc-1" }]);
    mockDel.mockResolvedValue(1);

    // Mock getConnection()
    (getConnection as jest.Mock).mockReturnValue({
      getClient: () => mockKnex,
    });
  });

  describe("search", () => {
    it("should search locations by query with name match", async () => {
      const mockResult = [{ id: "4", name: "Paris" }];
      mockLimit.mockResolvedValue(mockResult);

      const result = await locationModel.search("paris");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockWhere).toHaveBeenCalledWith("name", "ilike", "%paris%");
      expect(mockOrWhere).toHaveBeenCalledWith("country", "ilike", "%paris%");
      expect(mockOrWhere).toHaveBeenCalledWith("region", "ilike", "%paris%");
      expect(mockOrderBy).toHaveBeenCalledWith("name", "asc");
      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(result).toBe(mockResult);
    });

    it("should search locations with empty query", async () => {
      const mockResult: any[] = [];
      mockLimit.mockResolvedValue(mockResult);

      const result = await locationModel.search("");

      expect(mockWhere).toHaveBeenCalledWith("name", "ilike", "%%");
      expect(mockOrWhere).toHaveBeenCalledWith("country", "ilike", "%%");
      expect(mockOrWhere).toHaveBeenCalledWith("region", "ilike", "%%");
      expect(result).toBe(mockResult);
    });

    it("should search locations with special characters", async () => {
      const mockResult = [{ id: "9", name: "São Paulo" }];
      mockLimit.mockResolvedValue(mockResult);

      const result = await locationModel.search("São");

      expect(mockWhere).toHaveBeenCalledWith("name", "ilike", "%São%");
      expect(result).toBe(mockResult);
    });
  });

  describe("findById", () => {
    it("should return location by id when found", async () => {
      const mockLocation = { id: "loc-abc", name: "Test Location" };
      mockFirst.mockResolvedValue(mockLocation);

      const result = await locationModel.findById("loc-abc");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "loc-abc");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockLocation);
    });

    it("should return null if location not found", async () => {
      mockFirst.mockResolvedValue(null);

      const result = await locationModel.findById("notfound");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "notfound");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should return null if location is undefined", async () => {
      mockFirst.mockResolvedValue(undefined);

      const result = await locationModel.findById("undefined-id");

      expect(result).toBeNull();
    });

    it("should handle empty string id", async () => {
      mockFirst.mockResolvedValue(null);

      const result = await locationModel.findById("");

      expect(mockWhere).toHaveBeenCalledWith("id", "");
      expect(result).toBeNull();
    });
  });

  describe("findByNameAndCountry", () => {
    it("should return location by name and country when found", async () => {
      const mockLocation = { id: "loc-def", name: "Paris", country: "France" };
      mockFirst.mockResolvedValue(mockLocation);

      const result = await locationModel.findByNameAndCountry("Paris", "France");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("name", "ilike", "Paris");
      expect(mockWhere).toHaveBeenCalledWith("country", "ilike", "France");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockLocation);
    });

    it("should return null if not found", async () => {
      mockFirst.mockResolvedValue(null);

      const result = await locationModel.findByNameAndCountry("Nowhere", "Noland");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("name", "ilike", "Nowhere");
      expect(mockWhere).toHaveBeenCalledWith("country", "ilike", "Noland");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should return null if location is undefined", async () => {
      mockFirst.mockResolvedValue(undefined);

      const result = await locationModel.findByNameAndCountry("Test", "Test");

      expect(result).toBeNull();
    });

    it("should handle empty name and country", async () => {
      mockFirst.mockResolvedValue(null);

      const result = await locationModel.findByNameAndCountry("", "");

      expect(mockWhere).toHaveBeenCalledWith("name", "ilike", "");
      expect(mockWhere).toHaveBeenCalledWith("country", "ilike", "");
      expect(result).toBeNull();
    });

    it("should handle case-insensitive search", async () => {
      const mockLocation = { id: "loc-case", name: "LONDON", country: "UK" };
      mockFirst.mockResolvedValue(mockLocation);

      const result = await locationModel.findByNameAndCountry("london", "uk");

      expect(mockWhere).toHaveBeenCalledWith("name", "ilike", "london");
      expect(mockWhere).toHaveBeenCalledWith("country", "ilike", "uk");
      expect(result).toBe(mockLocation);
    });
  });

  describe("create", () => {
    it("should insert location and return id", async () => {
      mockReturning.mockResolvedValue([{ id: "loc-xyz" }]);
      const locationData = { name: "Berlin", country: "Germany", region: "Berlin" };

      const id = await locationModel.create(locationData);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockInsert).toHaveBeenCalledWith(locationData);
      expect(mockReturning).toHaveBeenCalledWith("id");
      expect(id).toBe("loc-xyz");
    });

    it("should handle minimal location data", async () => {
      mockReturning.mockResolvedValue([{ id: "loc-minimal" }]);
      const locationData = { name: "Minimal City" };

      const id = await locationModel.create(locationData);

      expect(mockInsert).toHaveBeenCalledWith(locationData);
      expect(id).toBe("loc-minimal");
    });

    it("should handle location data with all fields", async () => {
      mockReturning.mockResolvedValue([{ id: "loc-complete" }]);
      const locationData = { 
        name: "Complete City", 
        country: "Complete Country", 
        region: "Complete Region",
        latitude: 40.7128,
        longitude: -74.0060
      };

      const id = await locationModel.create(locationData);

      expect(mockInsert).toHaveBeenCalledWith(locationData);
      expect(id).toBe("loc-complete");
    });

    it("should handle empty object", async () => {
      mockReturning.mockResolvedValue([{ id: "loc-empty" }]);
      const locationData = {};

      const id = await locationModel.create(locationData);

      expect(mockInsert).toHaveBeenCalledWith(locationData);
      expect(id).toBe("loc-empty");
    });
  });

  describe("update", () => {
    it("should update location by id with single field", async () => {
      const updateData = { name: "New Name" };

      await locationModel.update("loc-123", updateData);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "loc-123");
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });

    it("should update location by id with multiple fields", async () => {
      const updateData = { 
        name: "Updated Name", 
        country: "Updated Country", 
        region: "Updated Region" 
      };

      await locationModel.update("loc-456", updateData);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "loc-456");
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });

    it("should handle empty update data", async () => {
      const updateData = {};

      await locationModel.update("loc-empty", updateData);

      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });

    it("should handle update with null values", async () => {
      const updateData = { region: null, country: "Valid Country" };

      await locationModel.update("loc-null", updateData);

      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });

    it("should handle empty string id", async () => {
      const updateData = { name: "Test" };

      await locationModel.update("", updateData);

      expect(mockWhere).toHaveBeenCalledWith("id", "");
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });
  });

  describe("delete", () => {
    it("should delete location and return true when successful", async () => {
      mockDel.mockResolvedValue(1);

      const result = await locationModel.delete("loc-456");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "loc-456");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if no location deleted", async () => {
      mockDel.mockResolvedValue(0);

      const result = await locationModel.delete("loc-789");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "loc-789");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should return true when multiple rows deleted", async () => {
      mockDel.mockResolvedValue(3);

      const result = await locationModel.delete("loc-multiple");

      expect(result).toBe(true);
    });

    it("should handle empty string id", async () => {
      mockDel.mockResolvedValue(0);

      const result = await locationModel.delete("");

      expect(mockWhere).toHaveBeenCalledWith("id", "");
      expect(result).toBe(false);
    });

    it("should handle negative delete result", async () => {
      mockDel.mockResolvedValue(-1);

      const result = await locationModel.delete("loc-negative");

      expect(result).toBe(false);
    });
  });

  describe("knex getter and error handling", () => {
    it("should throw error if database connection is undefined", () => {
      (getConnection as jest.Mock).mockReturnValueOnce(undefined);
      
      expect(() => (locationModel as any).knex).toThrow("Database connection is undefined");
    });

    it("should throw error if database connection is null", () => {
      (getConnection as jest.Mock).mockReturnValueOnce(null);
      
      expect(() => (locationModel as any).knex).toThrow("Database connection is undefined");
    });

    it("should return knex client when connection exists", () => {
      const mockConnection = { getClient: () => mockKnex };
      (getConnection as jest.Mock).mockReturnValueOnce(mockConnection);
      
      const knex = (locationModel as any).knex;
      
      expect(knex).toBe(mockKnex);
    });

    it("should handle getClient being undefined", () => {
      const mockConnection = {};
      (getConnection as jest.Mock).mockReturnValueOnce(mockConnection);
      
      expect(() => (locationModel as any).knex).toThrow("connection.getClient is not a function");
    });
  });

  
  describe("database operation error handling", () => {
    beforeEach(() => {
      // Reset all mocks to their default chainable behavior for error tests
      const chainable = {
        select: mockSelect,
        where: mockWhere,
        orWhere: mockOrWhere,
        orderBy: mockOrderBy,
        limit: mockLimit,
        offset: mockOffset,
        first: mockFirst,
        insert: mockInsert,
        returning: mockReturning,
        update: mockUpdate,
        del: mockDel,
      };

      mockKnex.mockImplementation(() => chainable);
      mockSelect.mockImplementation(() => chainable);
      mockWhere.mockImplementation(() => chainable);
      mockOrWhere.mockImplementation(() => chainable);
      mockOrderBy.mockImplementation(() => chainable);
      mockLimit.mockImplementation(() => chainable);
      mockOffset.mockImplementation(() => chainable);
      mockInsert.mockImplementation(() => chainable);
      mockUpdate.mockImplementation(() => chainable);
    });

    it("should propagate database errors in findAll", async () => {
      const dbError = new Error("Database connection failed");
      // Reset the mock setup to ensure the error is thrown at the right place
      mockSelect.mockImplementation(() => {
        throw dbError;
      });

      await expect(locationModel.findAll({ page: 1, limit: 10 }))
        .rejects.toThrow("Database connection failed");
    });

    it("should propagate database errors in search", async () => {
      const dbError = new Error("Search query failed");
      mockSelect.mockImplementation(() => {
        throw dbError;
      });

      await expect(locationModel.search("test"))
        .rejects.toThrow("Search query failed");
    });

    it("should propagate database errors in findById", async () => {
      const dbError = new Error("Find by ID failed");
      mockWhere.mockImplementation(() => {
        throw dbError;
      });

      await expect(locationModel.findById("test-id"))
        .rejects.toThrow("Find by ID failed");
    });

    it("should propagate database errors in findByNameAndCountry", async () => {
      const dbError = new Error("Find by name and country failed");
      mockWhere.mockImplementation(() => {
        throw dbError;
      });

      await expect(locationModel.findByNameAndCountry("test", "test"))
        .rejects.toThrow("Find by name and country failed");
    });

    it("should propagate database errors in create", async () => {
      const dbError = new Error("Insert failed");
      mockInsert.mockImplementation(() => {
        throw dbError;
      });

      await expect(locationModel.create({ name: "test" }))
        .rejects.toThrow("Insert failed");
    });

    it("should propagate database errors in update", async () => {
      const dbError = new Error("Update failed");
      mockWhere.mockImplementation(() => {
        throw dbError;
      });

      await expect(locationModel.update("test-id", { name: "test" }))
        .rejects.toThrow("Update failed");
    });

    it("should propagate database errors in delete", async () => {
      const dbError = new Error("Delete failed");
      mockWhere.mockImplementation(() => {
        throw dbError;
      });

      await expect(locationModel.delete("test-id"))
        .rejects.toThrow("Delete failed");
    });
  });
});