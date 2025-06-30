import { diningModel } from "../../src/repositories/dining.repository";
import { getConnection } from "../../src/database";
import { Dining } from "../../src/interfaces/dining.interface";

jest.mock("../../src/database");

describe("DiningModel", () => {
  let mockKnex: jest.Mock;
  let mockWhere: jest.Mock;
  let mockAndWhere: jest.Mock;
  let mockFirst: jest.Mock;
  let mockInsert: jest.Mock;
  let mockReturning: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDel: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockFn: { now: jest.Mock };
  let mockRaw: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWhere = jest.fn();
    mockAndWhere = jest.fn();
    mockFirst = jest.fn();
    mockInsert = jest.fn();
    mockReturning = jest.fn();
    mockUpdate = jest.fn();
    mockDel = jest.fn();
    mockOrderBy = jest.fn();
    mockFn = { now: jest.fn(() => "2024-01-01T00:00:00Z") };
    mockRaw = jest.fn((sql) => `RAW(${sql})`);
    mockKnex = jest.fn();

    const createChainableObject = () => ({
      where: mockWhere,
      andWhere: mockAndWhere,
      first: mockFirst,
      insert: mockInsert,
      returning: mockReturning,
      update: mockUpdate,
      del: mockDel,
      orderBy: mockOrderBy,
      fn: mockFn,
      raw: mockRaw,
    });

    mockKnex.mockImplementation(() => createChainableObject());
    (mockKnex as any).fn = mockFn;
    (mockKnex as any).raw = mockRaw;

    mockWhere.mockImplementation(() => createChainableObject());
    mockAndWhere.mockImplementation(() => createChainableObject());
    mockOrderBy.mockImplementation(() => createChainableObject());
    mockInsert.mockImplementation(() => createChainableObject());
    mockUpdate.mockImplementation(() => createChainableObject());
    mockDel.mockImplementation(() => createChainableObject());

    (getConnection as jest.Mock).mockReturnValue({
      getClient: () => mockKnex,
    });

    mockFirst.mockResolvedValue(null);
    mockReturning.mockResolvedValue([{ id: "test-id" }]);
    mockOrderBy.mockResolvedValue([]);
    mockUpdate.mockResolvedValue(1);
    mockDel.mockResolvedValue(1);
  });

  describe("findByPostId", () => {
    it("should return dining records by postId", async () => {
      const mockResult = [{ id: "1" }, { id: "2" }];
      mockOrderBy.mockResolvedValue(mockResult);

      const result = await diningModel.findByPostId("post123");

      expect(mockKnex).toHaveBeenCalledWith("dining");
      expect(mockWhere).toHaveBeenCalledWith("post_id", "post123");
      expect(mockOrderBy).toHaveBeenCalledWith("visit_date", "desc");
      expect(result).toBe(mockResult);
    });
  });

  describe("findById", () => {
    it("should return dining by id", async () => {
      const mockDining = { id: "abc" };
      mockFirst.mockResolvedValue(mockDining);

      const result = await diningModel.findById("abc");

      expect(mockKnex).toHaveBeenCalledWith("dining");
      expect(mockWhere).toHaveBeenCalledWith("id", "abc");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockDining);
    });

    it("should return null if dining not found", async () => {
      mockFirst.mockResolvedValue(null);

      const result = await diningModel.findById("notfound");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create dining with location", async () => {
      const locationData = {
        name: "Paris",
        latitude: 1,
        longitude: 2,
      };
      const diningData = {
        post_id: "post1",
        visit_date: "2024-01-01",
        location: locationData,
      };

      mockFirst.mockResolvedValueOnce(null);
      mockReturning.mockResolvedValueOnce([{ id: "loc-1" }]);
      mockReturning.mockResolvedValueOnce([{ id: "dining-1" }]);

      const id = await diningModel.create(diningData);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("latitude", 1);
      expect(mockAndWhere).toHaveBeenCalledWith("longitude", 2);
      expect(mockInsert).toHaveBeenCalled();
      expect(id).toBe("dining-1");
    });

    it("should create dining without location", async () => {
      const diningData = {
        post_id: "post2",
        visit_date: "2024-01-02",
      };

      mockReturning.mockResolvedValue([{ id: "dining-2" }]);

      const id = await diningModel.create(diningData);

      expect(mockKnex).toHaveBeenCalledWith("dining");
      expect(mockInsert).toHaveBeenCalledWith({
        post_id: "post2",
        visit_date: "2024-01-02",
        location_id: null,
      });
      expect(id).toBe("dining-2");
    });
  });

  describe("update", () => {
    it("should update dining with location", async () => {
      const updateData = {
        name: "Le Meurice",
        location: {
          name: "Paris",
          latitude: 3,
          longitude: 4,
        },
      };

      mockFirst.mockResolvedValueOnce(null);
      mockReturning.mockResolvedValueOnce([{ id: "loc-2" }]);

      await diningModel.update("dining-3", updateData);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockKnex).toHaveBeenCalledWith("dining");
      expect(mockWhere).toHaveBeenCalledWith("id", "dining-3");
      expect(mockUpdate).toHaveBeenCalledWith({
        name: "Le Meurice",
        location_id: "loc-2",
        updated_at: "2024-01-01T00:00:00Z",
      });
    });

    it("should update dining without location", async () => {
      const updateData = {
        name: "Chez Janou",
      };

      await diningModel.update("dining-4", updateData);

      expect(mockKnex).toHaveBeenCalledWith("dining");
      expect(mockWhere).toHaveBeenCalledWith("id", "dining-4");
      expect(mockUpdate).toHaveBeenCalledWith({
        name: "Chez Janou",
        updated_at: "2024-01-01T00:00:00Z",
      });
    });
  });

  describe("delete", () => {
    it("should delete dining and return true", async () => {
      mockDel.mockResolvedValue(1);

      const result = await diningModel.delete("dining-5");

      expect(mockKnex).toHaveBeenCalledWith("dining");
      expect(mockWhere).toHaveBeenCalledWith("id", "dining-5");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if no dining deleted", async () => {
      mockDel.mockResolvedValue(0);

      const result = await diningModel.delete("dining-6");

      expect(mockKnex).toHaveBeenCalledWith("dining");
      expect(mockWhere).toHaveBeenCalledWith("id", "dining-6");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("findOrCreateLocation", () => {
    it("should return existing location id if found", async () => {
      const locationData = { name: "London", latitude: 10, longitude: 20 };
      mockFirst.mockResolvedValue({ id: "loc-10" });

      const id = await (diningModel as any).findOrCreateLocation(locationData);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("latitude", 10);
      expect(mockAndWhere).toHaveBeenCalledWith("longitude", 20);
      expect(mockFirst).toHaveBeenCalled();
      expect(id).toBe("loc-10");
    });

    it("should insert and return new location id if not found", async () => {
      const locationData = { name: "Rome", latitude: 30, longitude: 40 };
      mockFirst.mockResolvedValue(null);
      mockReturning.mockResolvedValue([{ id: "loc-20" }]);

      const id = await (diningModel as any).findOrCreateLocation(locationData);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("latitude", 30);
      expect(mockAndWhere).toHaveBeenCalledWith("longitude", 40);
      expect(mockFirst).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith({
        id: "RAW(uuid_generate_v4())",
        name: "Rome",
        country: null,
        region: null,
        latitude: 30,
        longitude: 40,
        timezone: "UTC",
        created_at: "2024-01-01T00:00:00Z",
      });
      expect(id).toBe("loc-20");
    });
  });

  describe("error handling", () => {
    it("should throw error if database connection is undefined", async () => {
      (getConnection as jest.Mock).mockReturnValueOnce(undefined);
      expect(() => (diningModel as any).knex).toThrow("Database connection is undefined");
    });
  });
});