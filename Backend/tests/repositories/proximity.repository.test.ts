import { proximityModel } from "../../src/repositories/proximity.repository";
import { getConnection } from "../../src/database";

jest.mock("../../src/database");

describe("ProximityModel", () => {
  let mockKnex: jest.Mock;

  let mockSelect: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrWhere: jest.Mock;
  let mockWhereIn: jest.Mock;
  let mockWhereRaw: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;
  let mockOffset: jest.Mock;
  let mockFirst: jest.Mock;
  let mockInsert: jest.Mock;
  let mockReturning: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDel: jest.Mock;
  let mockCount: jest.Mock;
  let mockSum: jest.Mock;
  let mockGroupBy: jest.Mock;
  let mockRaw: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockKnex = jest.fn();
    mockSelect = jest.fn();
    mockWhere = jest.fn();
    mockOrWhere = jest.fn();
    mockWhereIn = jest.fn();
    mockWhereRaw = jest.fn();
    mockOrderBy = jest.fn();
    mockLimit = jest.fn();
    mockOffset = jest.fn();
    mockFirst = jest.fn();
    mockInsert = jest.fn();
    mockReturning = jest.fn();
    mockUpdate = jest.fn();
    mockDel = jest.fn();
    mockCount = jest.fn();
    mockSum = jest.fn();
    mockGroupBy = jest.fn();
    mockRaw = jest.fn();

    const chainable = {
      select: mockSelect,
      where: mockWhere,
      orWhere: mockOrWhere,
      whereIn: mockWhereIn,
      whereRaw: mockWhereRaw,
      orderBy: mockOrderBy,
      limit: mockLimit,
      offset: mockOffset,
      first: mockFirst,
      insert: mockInsert,
      returning: mockReturning,
      update: mockUpdate,
      del: mockDel,
      count: mockCount,
      sum: mockSum,
      groupBy: mockGroupBy,
      fn: { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") }
    };

    mockKnex.mockImplementation(() => chainable);
    mockSelect.mockImplementation(() => chainable);
    mockWhere.mockImplementation(() => chainable);
    mockOrWhere.mockImplementation(() => chainable);
    mockWhereIn.mockImplementation(() => chainable);
    mockWhereRaw.mockImplementation(() => chainable);
    mockOrderBy.mockImplementation(() => chainable);
    mockLimit.mockImplementation(() => chainable);
    mockOffset.mockImplementation(() => chainable);
    mockInsert.mockImplementation(() => chainable);
    mockReturning.mockImplementation(() => chainable);
    mockUpdate.mockImplementation(() => chainable);
    mockDel.mockImplementation(() => chainable);
    mockCount.mockImplementation(() => chainable);
    mockSum.mockImplementation(() => chainable);
    mockGroupBy.mockImplementation(() => chainable);

    mockFirst.mockResolvedValue(null);
    mockReturning.mockResolvedValue([{ id: "prox-1" }]);
    mockDel.mockResolvedValue(1);
    mockUpdate.mockResolvedValue(1);

    mockRaw.mockResolvedValue({ rows: [] });

    (mockKnex as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
    (mockKnex as any).raw = mockRaw;

    (getConnection as jest.Mock).mockReturnValue({
      getClient: () => mockKnex,
    });
  });

  describe("findSettingsByUserId", () => {
    it("should return settings for user", async () => {
      const mockSettings = { id: "set-1", user_id: "user-1" };
      mockFirst.mockResolvedValueOnce(mockSettings);

      const result = await proximityModel.findSettingsByUserId("user-1");

      expect(mockKnex).toHaveBeenCalledWith("proximity_settings");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockSettings);
    });

    it("should return null if not found", async () => {
      mockFirst.mockResolvedValueOnce(null);

      const result = await proximityModel.findSettingsByUserId("user-x");

      expect(result).toBeNull();
    });
  });

  describe("findSettingsById", () => {
    it("should return settings by id", async () => {
      const mockSettings = { id: "set-2" };
      mockFirst.mockResolvedValueOnce(mockSettings);

      const result = await proximityModel.findSettingsById("set-2");

      expect(mockKnex).toHaveBeenCalledWith("proximity_settings");
      expect(mockWhere).toHaveBeenCalledWith("id", "set-2");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockSettings);
    });
  });

  describe("createSettings", () => {
    it("should insert settings and return id", async () => {
      mockReturning.mockResolvedValueOnce([{ id: "set-xyz" }]);
      const data = { user_id: "user-2", radius: 5 };

      const id = await proximityModel.createSettings(data);

      expect(mockKnex).toHaveBeenCalledWith("proximity_settings");
      expect(mockInsert).toHaveBeenCalledWith(data);
      expect(mockReturning).toHaveBeenCalledWith("id");
      expect(id).toBe("set-xyz");
    });
  });

  describe("updateSettings", () => {
    it("should update settings by id", async () => {
      await proximityModel.updateSettings("set-3", { radius: 10 });

      expect(mockKnex).toHaveBeenCalledWith("proximity_settings");
      expect(mockWhere).toHaveBeenCalledWith("id", "set-3");
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ radius: 10, updated_at: "CURRENT_TIMESTAMP" }));
    });
  });

  describe("updateUserLocation", () => {
    it("should update user location", async () => {
      await proximityModel.updateUserLocation("user-3", { latitude: "12.34", longitude: "56.78" });

      expect(mockKnex).toHaveBeenCalledWith("users");
      expect(mockWhere).toHaveBeenCalledWith("id", "user-3");
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        current_latitude: 12.34,
        current_longitude: 56.78,
        location_updated_at: "CURRENT_TIMESTAMP",
        updated_at: "CURRENT_TIMESTAMP"
      }));
    });

    it("should throw error for invalid coordinates", async () => {
      await expect(proximityModel.updateUserLocation("user-4", { latitude: "abc", longitude: "def" }))
        .rejects.toThrow("Invalid coordinates: latitude and longitude must be valid numbers");
    });
  });

  describe("getUserLocation", () => {
    it("should return user location", async () => {
      mockFirst.mockResolvedValueOnce({
        id: "user-5",
        current_latitude: "10.1",
        current_longitude: "20.2",
        location_updated_at: "2024-01-01"
      });

      const result = await proximityModel.getUserLocation("user-5");

      expect(mockKnex).toHaveBeenCalledWith("users");
      expect(mockSelect).toHaveBeenCalledWith("id", "current_latitude", "current_longitude", "location_updated_at");
      expect(mockWhere).toHaveBeenCalledWith("id", "user-5");
      expect(result).toEqual({
        user_id: "user-5",
        latitude: 10.1,
        longitude: 20.2,
        updated_at: "2024-01-01"
      });
    });

    it("should return null if no location", async () => {
      mockFirst.mockResolvedValueOnce({ id: "user-6" });

      const result = await proximityModel.getUserLocation("user-6");

      expect(result).toBeNull();
    });
  });

  describe("findAlertHistory", () => {
    it("should return alert history", async () => {
      const mockAlerts = [{ id: "h1" }, { id: "h2" }];
      mockOffset.mockResolvedValueOnce(mockAlerts);

      const result = await proximityModel.findAlertHistory("user-8", 2, 0);

      expect(mockKnex).toHaveBeenCalledWith("user_proximity_log");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-8");
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(mockLimit).toHaveBeenCalledWith(2);
      expect(mockOffset).toHaveBeenCalledWith(0);
      expect(result).toBe(mockAlerts);
    });
  });

  describe("deleteAlert", () => {
    it("should delete alert and return true", async () => {
      mockDel.mockResolvedValueOnce(1);

      const result = await proximityModel.deleteAlert("alert-1", "user-9");

      expect(mockKnex).toHaveBeenCalledWith("user_proximity_log");
      expect(mockWhere).toHaveBeenCalledWith("id", "alert-1");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-9");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if not deleted", async () => {
      mockDel.mockResolvedValueOnce(0);

      const result = await proximityModel.deleteAlert("alert-2", "user-10");

      expect(result).toBe(false);
    });
  });

  describe("findRecentAlert", () => {
    it("should find recent alert", async () => {
      const mockAlert = { id: "recent-1" };
      mockFirst.mockResolvedValueOnce(mockAlert);

      const result = await proximityModel.findRecentAlert("user-11", "loc-2", "entry", 5);

      expect(mockKnex).toHaveBeenCalledWith("user_proximity_log");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-11");
      expect(mockWhere).toHaveBeenCalledWith("location_id", "loc-2");
      expect(mockWhere).toHaveBeenCalledWith("trigger_type", "entry");
      expect(mockWhere).toHaveBeenCalledWith("created_at", ">", expect.any(Date));
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockAlert);
    });
  });

  describe("findNearbyWishlistLocations", () => {
    it("should call raw query and map results", async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [
          {
            id: "loc-3",
            name: "WishlistLoc",
            country: "US",
            region: "NY",
            latitude: "40.1",
            longitude: "-73.9",
            distance_km: "2.345"
          }
        ]
      });

      const result = await proximityModel.findNearbyWishlistLocations("user-12", 3);

      expect(mockRaw).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        id: "loc-3",
        name: "WishlistLoc",
        location: expect.objectContaining({ id: "loc-3" }),
        distance_km: 2.345
      });
    });
  });

  describe("findNearbyFeaturedPosts", () => {
    it("should call raw query and map results", async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [
          {
            id: "post-1",
            name: "PostTitle",
            location_id: "loc-5",
            location_name: "PostLoc",
            country: "US",
            region: "FL",
            latitude: "27.1",
            longitude: "-80.1",
            distance_km: "3.333"
          }
        ]
      });

      const result = await proximityModel.findNearbyFeaturedPosts("user-14", 5);

      expect(mockRaw).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        id: "post-1",
        name: "PostTitle",
        location: expect.objectContaining({ id: "loc-5" }),
        distance_km: 3.333
      });
    });
  });

  describe("findNearbyAttractions", () => {
    it("should call raw query and map results", async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [
          {
            id: "attr-1",
            name: "Attraction",
            location_id: "loc-6",
            location_name: "AttrLoc",
            country: "US",
            region: "NV",
            latitude: "36.1",
            longitude: "-115.1",
            distance_km: "4.444"
          }
        ]
      });

      const result = await proximityModel.findNearbyAttractions("user-15", 10);

      expect(mockRaw).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        id: "attr-1",
        name: "Attraction",
        location: expect.objectContaining({ id: "loc-6" }),
        distance_km: 4.444
      });
    });
  });

  describe("findNearbyAccommodations", () => {
    it("should call raw query and map results", async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [
          {
            id: "acc-1",
            name: "Hotel",
            location_id: "loc-7",
            location_name: "HotelLoc",
            country: "US",
            region: "WA",
            latitude: "47.1",
            longitude: "-122.1",
            distance_km: "5.555"
          }
        ]
      });

      const result = await proximityModel.findNearbyAccommodations("user-16", 8);

      expect(mockRaw).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        id: "acc-1",
        name: "Hotel",
        location: expect.objectContaining({ id: "loc-7" }),
        distance_km: 5.555
      });
    });
  });

  describe("findNearbyDining", () => {
    it("should call raw query and map results", async () => {
      mockRaw.mockResolvedValueOnce({
        rows: [
          {
            id: "dine-1",
            name: "Restaurant",
            location_id: "loc-8",
            location_name: "DineLoc",
            country: "US",
            region: "IL",
            latitude: "41.1",
            longitude: "-87.1",
            distance_km: "6.666"
          }
        ]
      });

      const result = await proximityModel.findNearbyDining("user-17", 12);

      expect(mockRaw).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        id: "dine-1",
        name: "Restaurant",
        location: expect.objectContaining({ id: "loc-8" }),
        distance_km: 6.666
      });
    });
  });

  describe("findNearbyItems", () => {
    it("should call correct method for itemType", async () => {
      const spy = jest.spyOn(proximityModel, "findNearbyWishlistLocations").mockResolvedValueOnce([{ id: "x" }] as any);
      const result = await proximityModel.findNearbyItems("user-18", 1, "wishlist");
      expect(spy).toHaveBeenCalledWith("user-18", 1);
      expect(result).toEqual([{ id: "x" }]);
      spy.mockRestore();
    });

    it("should throw error for unsupported type", async () => {
      // @ts-expect-error
      await expect(proximityModel.findNearbyItems("user-19", 1, "unknown")).rejects.toThrow("Unsupported item type: unknown");
    });
  });

  describe("logProximityEvent", () => {
    it("should insert log and return id", async () => {
      mockReturning.mockResolvedValueOnce([{ id: "log-1" }]);
      const data = { user_id: "user-20", distance_km: 2.5 };

      const id = await proximityModel.logProximityEvent(data);

      expect(mockKnex).toHaveBeenCalledWith("user_proximity_log");
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: "user-20", distance_km: 2.5 }));
      expect(mockReturning).toHaveBeenCalledWith("id");
      expect(id).toBe("log-1");
    });
  });

  describe("getProximityLogs", () => {
    it("should return logs with parsed distance", async () => {
      const logs = [
        { id: "l1", distance_km: "1.23" },
        { id: "l2", distance_km: null }
      ];
      mockLimit.mockResolvedValueOnce(logs);

      const result = await proximityModel.getProximityLogs("user-21", 2);

      expect(mockKnex).toHaveBeenCalledWith("user_proximity_log");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-21");
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(mockLimit).toHaveBeenCalledWith(2);
    });
  });

  describe("cleanupOldLogs", () => {
    it("should delete logs older than daysOld", async () => {
      mockDel.mockResolvedValueOnce(4);

      const result = await proximityModel.cleanupOldLogs(7);

      expect(mockKnex).toHaveBeenCalledWith("user_proximity_log");
      expect(mockWhere).toHaveBeenCalledWith("created_at", "<", expect.any(Date));
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(4);
    });
  });

  describe("validateRadius", () => {
    it("should return true for valid radius", () => {
      expect(proximityModel.validateRadius(1)).toBe(true);
      expect(proximityModel.validateRadius("5")).toBe(true);
    });

    it("should return false for out of range", () => {
      expect(proximityModel.validateRadius(0)).toBe(false);
      expect(proximityModel.validateRadius(10001)).toBe(false);
    });
  });

  describe("calculateDistance", () => {
    it("should call raw and return parsed distance", async () => {
      mockRaw.mockResolvedValueOnce({ rows: [{ distance_km: "7.777" }] });

      const result = await proximityModel.calculateDistance(1, 2, 3, 4);

      expect(mockRaw).toHaveBeenCalled();
      expect(result).toBe(7.777);
    });
  });

  describe("normalizeRadius", () => {
    it("should normalize and round radius", () => {
      // @ts-ignore
      expect(proximityModel["normalizeRadius"](2.123456)).toBe(2.123);
      // @ts-ignore
      expect(proximityModel["normalizeRadius"]("3.4567")).toBe(3.457);
    });

    it("should throw error for invalid radius", () => {
      // @ts-ignore
      expect(() => proximityModel["normalizeRadius"]("abc")).toThrow("Invalid radius: must be a positive number");
      // @ts-ignore
      expect(() => proximityModel["normalizeRadius"](-1)).toThrow("Invalid radius: must be a positive number");
    });
  });

  describe("radiusToMeters", () => {
    it("should convert km to meters", () => {
      // @ts-ignore
      expect(proximityModel["radiusToMeters"](1.234)).toBe(1234);
    });
  });

  describe("error handling", () => {
    it("should throw error if database connection is undefined", () => {
      (getConnection as jest.Mock).mockReturnValueOnce(undefined);
      expect(() => (proximityModel as any).knex).toThrow("Database connection is undefined");
    });
  });

  describe("updateSettings", () => {
    it("should return 0 if nothing updated", async () => {
      mockUpdate.mockResolvedValueOnce(0);

      const result = await proximityModel.updateSettings("set-404", { radius: 99 });
      expect(result).toBe(0);
    });
  });
  
  it("should return null if no recent alert found", async () => {
    mockFirst.mockResolvedValueOnce(null);

    const result = await proximityModel.findRecentAlert("user-1", "loc-x", "exit", 10);

    expect(result).toBeNull();
  });

  describe("calculateDistance", () => {
  it("should call raw and return parsed distance", async () => {
    mockRaw.mockResolvedValueOnce({ rows: [{ distance_km: "7.777" }] });

    const result = await proximityModel.calculateDistance(1, 2, 3, 4);

    expect(mockRaw).toHaveBeenCalledWith(expect.any(String), [2, 1, 4, 3]);
    expect(result).toBe(7.777);
  });

  it("should return NaN if distance_km is null or undefined", async () => {
    mockRaw.mockResolvedValueOnce({ rows: [{ distance_km: null }] });

    const result = await proximityModel.calculateDistance(1, 2, 3, 4);

    expect(isNaN(result)).toBe(true);
  });

  it("should throw if knex.raw rejects", async () => {
    mockRaw.mockRejectedValueOnce(new Error("DB error"));

    await expect(proximityModel.calculateDistance(1, 2, 3, 4)).rejects.toThrow("DB error");
  });

  it("should handle result.rows empty array gracefully", async () => {
    mockRaw.mockResolvedValueOnce({ rows: [] });

    await expect(proximityModel.calculateDistance(1, 2, 3, 4)).rejects.toThrow();
  });
});

  describe("getProximityLogs", () => {
    it("should return logs with parsed distance", async () => {
      const logs = [
        { id: "l1", distance_km: "1.23" },
        { id: "l2", distance_km: null }
      ];
      mockLimit.mockResolvedValueOnce(logs);

      const result = await proximityModel.getProximityLogs("user-21", 2);

      expect(mockKnex).toHaveBeenCalledWith("user_proximity_log");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-21");
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(mockLimit).toHaveBeenCalledWith(2);
      expect(result).toEqual([
        { id: "l1", distance_km: 1.23 },
        { id: "l2", distance_km: null },
      ]);
    });

    it("should handle empty logs array", async () => {
      mockLimit.mockResolvedValueOnce([]);

      const result = await proximityModel.getProximityLogs("user-22", 5);

      expect(result).toEqual([]);
    });

    it("should throw if query fails", async () => {
      mockLimit.mockRejectedValueOnce(new Error("DB failure"));

      await expect(proximityModel.getProximityLogs("user-23", 3)).rejects.toThrow("DB failure");
    });
  });
  
  it("should return 0 if no old logs to delete", async () => {
    mockDel.mockResolvedValueOnce(0);

    const result = await proximityModel.cleanupOldLogs(365);

    expect(result).toBe(0);
  });
});