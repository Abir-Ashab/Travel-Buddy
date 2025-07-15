import { notificationModel } from "../../src/repositories/notification.repository";
import { getConnection } from "../../src/database";

jest.mock("../../src/database");

describe("NotificationModel", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();

    mockKnex = jest.fn();
    (mockKnex as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
    (mockKnex as any).raw = jest.fn().mockReturnValue("RAW_EXPRESSION");
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
      fn: { 
        now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP")
      }
    };

    
    // All methods should return the chainable object by default
    mockKnex.mockImplementation(() => chainable);
    mockSelect.mockImplementation(() => chainable);
    mockWhere.mockImplementation(() => chainable);
    mockOrWhere.mockImplementation(() => chainable);
    mockWhereIn.mockImplementation(() => chainable);
    mockWhereRaw.mockImplementation(() => chainable);
    mockLimit.mockImplementation(() => chainable);
    mockOffset.mockImplementation(() => chainable);
    mockInsert.mockImplementation(() => chainable);
    mockReturning.mockImplementation(() => chainable);
    mockUpdate.mockImplementation(() => chainable);
    mockDel.mockImplementation(() => chainable);
    mockCount.mockImplementation(() => chainable);
    mockSum.mockImplementation(() => chainable);
    mockGroupBy.mockImplementation(() => chainable);
    mockOrderBy.mockImplementation(() => chainable);

    // Set up specific promise resolutions for methods that should resolve
    mockFirst.mockResolvedValue(null);
    mockReturning.mockResolvedValue([{ id: "notif-1" }]);
    mockDel.mockResolvedValue(1);
    mockUpdate.mockResolvedValue(1);

    (getConnection as jest.Mock).mockReturnValue({
      getClient: () => mockKnex,
    });
  });

  describe("findById", () => {
    it("should return notification by id", async () => {
      const mockNotification = { id: "notif-abc" };
      mockFirst.mockResolvedValueOnce(mockNotification);

      const result = await notificationModel.findById("notif-abc");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "notif-abc");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockNotification);
    });

    it("should return null if notification not found", async () => {
      mockFirst.mockResolvedValueOnce(null);

      const result = await notificationModel.findById("notfound");

      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return notifications for user with pagination", async () => {
      const mockResult = [{ id: "1" }, { id: "2" }];
      // For this test, offset is the final method in the chain, so it should resolve
      mockOffset.mockResolvedValueOnce(mockResult);

      const result = await notificationModel.findByUserId("user-1", 10, 5);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockOffset).toHaveBeenCalledWith(5);
      expect(result).toBe(mockResult);
    });

    // it("should filter by isRead if provided", async () => {
    //   const mockResult = [{ id: "3" }];
    //   mockOffset.mockResolvedValue(mockResult);

    //   await notificationModel.findByUserId("user-2", 20, 0, true);

    //   expect(mockWhere).toHaveBeenCalledWith("is_read", true);
    // });
  });

  describe("findByType", () => {
    it("should return notifications by type", async () => {
      const mockResult = [{ id: "4" }];
      // For this test, limit is the final method in the chain, so it should resolve
      mockLimit.mockResolvedValueOnce(mockResult);

      const result = await notificationModel.findByType("user-3", "info", 5);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-3");
      expect(mockWhere).toHaveBeenCalledWith("type", "info");
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(mockLimit).toHaveBeenCalledWith(5);
      expect(result).toBe(mockResult);
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count", async () => {
      // For this test, first is the final method in the chain, so it should resolve
      mockFirst.mockResolvedValueOnce({ count: 7 });

      const result = await notificationModel.getUnreadCount("user-4");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-4");
      expect(mockWhere).toHaveBeenCalledWith("is_read", false);
      expect(mockCount).toHaveBeenCalledWith("id as count");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(7);
    });

    it("should return 0 if no unread notifications", async () => {
      mockFirst.mockResolvedValueOnce(undefined);

      const result = await notificationModel.getUnreadCount("user-5");

      expect(result).toBe(0);
    });
  });

  describe("create", () => {
    it("should insert notification and return id", async () => {
      mockReturning.mockResolvedValueOnce([{ id: "notif-xyz" }]);
      const notificationData = { user_id: "user-6", type: "info", message: "Hello" };

      const id = await notificationModel.create(notificationData as any);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining(notificationData));
      expect(mockReturning).toHaveBeenCalledWith("id");
      expect(id).toBe("notif-xyz");
    });
  });

  describe("markAsRead", () => {
    it("should update is_read to true and return true if updated", async () => {
      mockUpdate.mockResolvedValueOnce(1);

      const result = await notificationModel.markAsRead("notif-1", "user-7");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "notif-1");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-7");
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
      expect(result).toBe(true);
    });

    it("should return false if no rows updated", async () => {
      mockUpdate.mockResolvedValueOnce(0);

      const result = await notificationModel.markAsRead("notif-2", "user-8");

      expect(result).toBe(false);
    });
  });

  describe("markAllAsRead", () => {
    it("should update all unread notifications for user", async () => {
      mockUpdate.mockResolvedValueOnce(3);

      const result = await notificationModel.markAllAsRead("user-9");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-9");
      expect(mockWhere).toHaveBeenCalledWith("is_read", false);
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
      expect(result).toBe(3);
    });
  });

  describe("update", () => {
    it("should update notification by id and userId", async () => {
      const updateData = { message: "Updated" };

      await notificationModel.update("notif-3", "user-10", updateData as any);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "notif-3");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-10");
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });
  });

  describe("delete", () => {
    it("should delete notification and return true", async () => {
      mockDel.mockResolvedValueOnce(1);

      const result = await notificationModel.delete("notif-4", "user-11");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("id", "notif-4");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-11");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if no notification deleted", async () => {
      mockDel.mockResolvedValueOnce(0);

      const result = await notificationModel.delete("notif-5", "user-12");

      expect(result).toBe(false);
    });
  });

  describe("deleteMultiple", () => {
    it("should delete multiple notifications and return count", async () => {
      mockDel.mockResolvedValueOnce(2);

      const result = await notificationModel.deleteMultiple(["id1", "id2"], "user-13");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-13");
      expect(mockWhereIn).toHaveBeenCalledWith("id", ["id1", "id2"]);
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(2);
    });
  });

  describe("deleteOldNotifications", () => {
    it("should delete notifications older than daysOld", async () => {
      mockDel.mockResolvedValueOnce(5);

      const result = await notificationModel.deleteOldNotifications("user-14", 10);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-14");
      expect(mockWhere).toHaveBeenCalledWith("created_at", "<", expect.any(Date));
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });

  describe("getRecentByType", () => {
    it("should return recent notifications by type and hours", async () => {
      const mockResult = [{ id: "recent-1" }];
      // Set up the chain properly - limit should resolve to the final result
      mockLimit.mockResolvedValueOnce(mockResult);

      const result = await notificationModel.getRecentByType("user-15", "alert", 12);

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-15");
      expect(mockWhere).toHaveBeenCalledWith("type", "alert");
      expect(mockWhere).toHaveBeenCalledWith("created_at", ">=", expect.any(Date));
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(mockLimit).toHaveBeenCalledWith(50); // Updated to match the new implementation
      expect(result).toEqual(mockResult);
    });
  });

  describe("findDuplicateProximityAlert", () => {
    it("should find duplicate proximity alert notification", async () => {
      const mockNotification = { id: "dup-1" };
      mockFirst.mockResolvedValueOnce(mockNotification);

      const result = await notificationModel.findDuplicateProximityAlert(
        "user-16",
        "loc-1",
        "entry",
        24
      );

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-16");
      expect(mockWhere).toHaveBeenCalledWith("type", "proximity_alert");
      expect(mockWhere).toHaveBeenCalledWith("created_at", ">=", expect.any(Date));
      expect(mockWhereRaw).toHaveBeenCalledWith(`metadata->>'location_id' = ?`, ["loc-1"]);
      expect(mockWhereRaw).toHaveBeenCalledWith(`metadata->>'trigger_type' = ?`, ["entry"]);
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockNotification);
    });

    it("should return null if no duplicate found", async () => {
      mockFirst.mockResolvedValueOnce(null);

      const result = await notificationModel.findDuplicateProximityAlert(
        "user-17",
        "loc-2",
        "exit",
        12
      );

      expect(result).toBeNull();
    });
  });

  describe("getStatsByType", () => {
    it("should return stats grouped by type", async () => {
      const mockStats = [
        { type: "info", count: 5, unread_count: 2 },
        { type: "alert", count: 3, unread_count: 1 },
      ];
      
      // For the getStatsByType method, orderBy is the final method that should resolve
      mockOrderBy.mockResolvedValueOnce(mockStats);

      const result = await notificationModel.getStatsByType("user-18");

      expect(mockKnex).toHaveBeenCalledWith("locations");
      expect(mockWhere).toHaveBeenCalledWith("user_id", "user-18");
      expect(mockSelect).toHaveBeenCalledWith("type");
      expect(mockCount).toHaveBeenCalledWith("id as count");
      expect(mockSum).toHaveBeenCalledWith(expect.anything());
      expect(mockGroupBy).toHaveBeenCalledWith("type");
      expect(mockOrderBy).toHaveBeenCalledWith("count", "desc");
      expect(result).toBe(mockStats);
    });
  });

  describe("error handling", () => {
    it("should throw error if database connection is undefined", () => {
      (getConnection as jest.Mock).mockReturnValueOnce(undefined);
      expect(() => (notificationModel as any).knex).toThrow("Database connection is undefined");
    });
  });
});