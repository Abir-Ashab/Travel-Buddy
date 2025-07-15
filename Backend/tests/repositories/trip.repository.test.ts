import { tripModel } from "../../src/repositories/trip.repository";
import { getConnection } from "../../src/database";
import { TravelPlan, TravelParticipant, Message, TripStatus } from "../../src/interfaces/trip.interface";

jest.mock("../../src/database");

describe("TripModel", () => {
  let mockKnex: jest.Mock;
  let mockWhere: jest.Mock;
  let mockAndOn: jest.Mock;
  let mockFirst: jest.Mock;
  let mockInsert: jest.Mock;
  let mockReturning: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDel: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockSelect: jest.Mock;
  let mockLeftJoin: jest.Mock;
  let mockJoin: jest.Mock;
  let mockLimit: jest.Mock;
  let mockOffset: jest.Mock;
  let mockCount: jest.Mock;
  let mockOn: jest.Mock;
  let mockFn: { now: jest.Mock };
  let mockRaw: jest.Mock;
  let mockOnConflict: jest.Mock;
  let mockIgnore: jest.Mock;

  beforeEach(() => {
  jest.clearAllMocks();

  mockFn = { now: jest.fn(() => "2024-01-01T00:00:00Z") };
  mockRaw = jest.fn((sql, arr) => `RAW(${sql},${arr})`);

  // Initialize all mock functions first
  mockWhere = jest.fn();
  mockAndOn = jest.fn();
  mockFirst = jest.fn(() => Promise.resolve(null));
  mockInsert = jest.fn();
  mockReturning = jest.fn(() => Promise.resolve([{ id: "fake-id" }]));
  mockUpdate = jest.fn(() => Promise.resolve(1));
  mockDel = jest.fn(() => Promise.resolve(1));
  mockOrderBy = jest.fn();
  mockSelect = jest.fn();
  mockLeftJoin = jest.fn();
  mockJoin = jest.fn();
  mockLimit = jest.fn();
  mockOffset = jest.fn();
  mockCount = jest.fn();
  mockOn = jest.fn();
  mockOnConflict = jest.fn();
  mockIgnore = jest.fn(() => Promise.resolve());

  // Define createChainable function
  const createChainable = () => {
    const chainable: any = {};
    chainable.select = mockSelect;
    chainable.leftJoin = mockLeftJoin;
    chainable.join = mockJoin;
    chainable.where = mockWhere;
    chainable.andOn = mockAndOn;
    chainable.on = mockOn;
    chainable.first = mockFirst;
    chainable.insert = mockInsert;
    chainable.returning = mockReturning;
    chainable.update = mockUpdate;
    chainable.del = mockDel;
    chainable.orderBy = mockOrderBy;
    chainable.limit = mockLimit;
    chainable.offset = mockOffset;
    chainable.count = mockCount;
    chainable.onConflict = mockOnConflict;
    chainable.ignore = mockIgnore;
    chainable.fn = mockFn;
    chainable.raw = mockRaw;
    return chainable;
  };

  // Now set up the mock functions to return chainable objects
  mockWhere.mockImplementation(() => createChainable());
  mockAndOn.mockImplementation(() => createChainable());
  mockInsert.mockImplementation(() => createChainable());
  mockOrderBy.mockImplementation(() => createChainable());
  mockSelect.mockImplementation(() => createChainable());
  mockLeftJoin.mockImplementation(() => createChainable());
  mockJoin.mockImplementation(() => createChainable());
  mockLimit.mockImplementation(() => createChainable());
  mockOffset.mockImplementation(() => createChainable());
  mockCount.mockImplementation(() => createChainable());
  mockOn.mockImplementation(() => createChainable());
  mockOnConflict.mockImplementation(() => createChainable());

  mockKnex = jest.fn(() => createChainable());
  (mockKnex as any).fn = mockFn;
  (mockKnex as any).raw = mockRaw;

  (getConnection as jest.Mock).mockReturnValue({
    getClient: () => mockKnex,
  });
});
  
  describe("create", () => {
    it("should insert and return trip id", async () => {
      mockReturning.mockResolvedValue([{ id: "trip-1" }]);
      mockInsert.mockReturnValue({ returning: mockReturning });

      const id = await tripModel.create({ trip_name: "Trip A" });
      expect(mockKnex).toHaveBeenCalledWith("travel_plan");
      expect(mockInsert).toHaveBeenCalledWith({ trip_name: "Trip A" });
      expect(mockReturning).toHaveBeenCalledWith("id");
      expect(id).toBe("trip-1");
    });
  });

  describe("findById", () => {
    it("should return trip by id", async () => {
      const trip = { id: "trip-2", trip_name: "Trip B" };
      mockFirst.mockResolvedValue(trip);

      const result = await tripModel.findById("trip-2");
      expect(mockKnex).toHaveBeenCalledWith("travel_plan");
      expect(mockSelect).toHaveBeenCalled();
      expect(mockLeftJoin).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("travel_plan.id", "trip-2");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(trip);
    });

    it("should return null if not found", async () => {
      mockFirst.mockResolvedValue(null);
      const result = await tripModel.findById("notfound");
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update trip and set updated_at", async () => {
      await tripModel.update("trip-4", { trip_name: "Updated" });
      expect(mockKnex).toHaveBeenCalledWith("travel_plan");
      expect(mockWhere).toHaveBeenCalledWith("id", "trip-4");
      expect(mockUpdate).toHaveBeenCalledWith({
        trip_name: "Updated",
        updated_at: "2024-01-01T00:00:00Z",
      });
    });
  });

  describe("delete", () => {
    it("should delete trip and return true", async () => {
      mockDel.mockResolvedValue(1);
      const result = await tripModel.delete("trip-5");
      expect(mockKnex).toHaveBeenCalledWith("travel_plan");
      expect(mockWhere).toHaveBeenCalledWith("id", "trip-5");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if no trip deleted", async () => {
      mockDel.mockResolvedValue(0);
      const result = await tripModel.delete("trip-6");
      expect(result).toBe(false);
    });
  });

  describe("addParticipants", () => {
    it("should insert participants and ignore conflicts", async () => {
      const userIds = ["u1", "u2"];
      
      await tripModel.addParticipants("trip-7", userIds);

      expect(mockKnex).toHaveBeenCalledWith("travel_participants");
      expect(mockInsert).toHaveBeenCalledWith([
        { trip_plan_id: "trip-7", user_id: "u1", role: "participant", status: "invited" },
        { trip_plan_id: "trip-7", user_id: "u2", role: "participant", status: "invited" }
      ]);
      expect(mockOnConflict).toHaveBeenCalledWith(["trip_plan_id", "user_id"]);
      expect(mockIgnore).toHaveBeenCalled();
    });

    it("should handle empty user ids array", async () => {
      const userIds: string[] = [];
      
      await tripModel.addParticipants("trip-8", userIds);

      expect(mockInsert).toHaveBeenCalledWith([]);
    });
  });

  describe("updateParticipantStatus", () => {
    it("should update participant status and joined_at if joined", async () => {
      mockUpdate.mockResolvedValue(1);
      const result = await tripModel.updateParticipantStatus("trip-8", "user-2", "joined");
      expect(mockKnex).toHaveBeenCalledWith("travel_participants");
      expect(mockWhere).toHaveBeenCalledWith({ trip_plan_id: "trip-8", user_id: "user-2" });
      expect(mockUpdate).toHaveBeenCalledWith({
        status: "joined",
        joined_at: "2024-01-01T00:00:00Z",
      });
      expect(result).toBe(true);
    });

    it("should update participant status without joined_at", async () => {
      mockUpdate.mockResolvedValue(1);
      const result = await tripModel.updateParticipantStatus("trip-8", "user-2", "invited");
      expect(mockUpdate).toHaveBeenCalledWith({ status: "invited" });
      expect(result).toBe(true);
    });

    it("should return false if no rows updated", async () => {
      mockUpdate.mockResolvedValue(0);
      const result = await tripModel.updateParticipantStatus("trip-8", "user-2", "joined");
      expect(result).toBe(false);
    });
  });

  describe("getParticipants", () => {
    it("should return participants for a trip", async () => {
      const participants = [{ id: "p1" }];
      mockOrderBy.mockResolvedValue(participants);

      const result = await tripModel.getParticipants("trip-9");
      expect(mockKnex).toHaveBeenCalledWith("travel_participants");
      expect(mockLeftJoin).toHaveBeenCalledWith("users", "travel_participants.user_id", "users.id");
      expect(mockWhere).toHaveBeenCalledWith("trip_plan_id", "trip-9");
      expect(mockOrderBy).toHaveBeenCalledWith("travel_participants.created_at", "asc");
      expect(result).toBe(participants);
    });
  });

  describe("removeParticipant", () => {
    it("should delete participant and return true", async () => {
      mockDel.mockResolvedValue(1);
      const result = await tripModel.removeParticipant("trip-10", "user-3");
      expect(mockKnex).toHaveBeenCalledWith("travel_participants");
      expect(mockWhere).toHaveBeenCalledWith({
        trip_plan_id: "trip-10",
        user_id: "user-3",
        role: "participant",
      });
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if no participant deleted", async () => {
      mockDel.mockResolvedValue(0);
      const result = await tripModel.removeParticipant("trip-10", "user-3");
      expect(result).toBe(false);
    });
  });

  describe("createMessage", () => {
    it("should insert message and return id", async () => {
      mockReturning.mockResolvedValue([{ id: "msg-1" }]);
      mockInsert.mockReturnValue({ returning: mockReturning });

      const id = await tripModel.createMessage({ text: "Hello" });
      expect(mockKnex).toHaveBeenCalledWith("messages");
      expect(mockInsert).toHaveBeenCalledWith({ text: "Hello" });
      expect(mockReturning).toHaveBeenCalledWith("id");
      expect(id).toBe("msg-1");
    });
  });

  describe("getUserInvites", () => {
    it("should return invites for user", async () => {
      const invites = [{ id: "inv1" }];
      mockOrderBy.mockResolvedValue(invites);

      const result = await tripModel.getUserInvites("user-4");
      expect(mockKnex).toHaveBeenCalledWith("travel_participants");
      expect(mockJoin).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith({
        "travel_participants.user_id": "user-4",
        "travel_participants.status": "invited",
      });
      expect(mockOrderBy).toHaveBeenCalledWith("travel_participants.created_at", "desc");
      expect(result).toBe(invites);
    });
  });

  describe("getAllStatuses", () => {
    it("should return all trip statuses", async () => {
      const statuses = [{ id: "s1" }];
      mockOrderBy.mockResolvedValue(statuses);

      const result = await tripModel.getAllStatuses();
      expect(mockKnex).toHaveBeenCalledWith("trip_status");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "asc");
      expect(result).toBe(statuses);
    });
  });

  describe("getStatusByName", () => {
    it("should return status by name", async () => {
      const status = { id: "s2", name: "active" };
      mockFirst.mockResolvedValue(status);

      const result = await tripModel.getStatusByName("active");
      expect(mockKnex).toHaveBeenCalledWith("trip_status");
      expect(mockWhere).toHaveBeenCalledWith("name", "active");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(status);
    });

    it("should return null if not found", async () => {
      mockFirst.mockResolvedValue(null);
      const result = await tripModel.getStatusByName("notfound");
      expect(result).toBeNull();
    });
  });

  describe("isUserParticipant", () => {
    it("should return true if user is participant", async () => {
      mockFirst.mockResolvedValue({ id: "p2" });
      const result = await tripModel.isUserParticipant("trip-12", "user-5");
      expect(mockKnex).toHaveBeenCalledWith("travel_participants");
      expect(mockWhere).toHaveBeenCalledWith({ trip_plan_id: "trip-12", user_id: "user-5" });
      expect(result).toBe(true);
    });

    it("should return false if not participant", async () => {
      mockFirst.mockResolvedValue(null);
      const result = await tripModel.isUserParticipant("trip-12", "user-5");
      expect(result).toBe(false);
    });
  });

  describe("isUserCreator", () => {
    it("should return true if user is creator", async () => {
      mockFirst.mockResolvedValue({ id: "trip-13" });
      const result = await tripModel.isUserCreator("trip-13", "user-6");
      expect(mockKnex).toHaveBeenCalledWith("travel_plan");
      expect(mockWhere).toHaveBeenCalledWith({ id: "trip-13", creator_id: "user-6" });
      expect(result).toBe(true);
    });

    it("should return false if not creator", async () => {
      mockFirst.mockResolvedValue(null);
      const result = await tripModel.isUserCreator("trip-13", "user-6");
      expect(result).toBe(false);
    });
  });

  describe("updateParticipantRole", () => {
    it("should update participant role and return true", async () => {
      mockUpdate.mockResolvedValue(1);
      const result = await tripModel.updateParticipantRole("trip-15", "user-7", "admin");
      expect(mockKnex).toHaveBeenCalledWith("travel_participants");
      expect(mockWhere).toHaveBeenCalledWith({ trip_plan_id: "trip-15", user_id: "user-7" });
      expect(mockUpdate).toHaveBeenCalledWith({ role: "admin" });
      expect(result).toBe(true);
    });

    it("should return false if no rows updated", async () => {
      mockUpdate.mockResolvedValue(0);
      const result = await tripModel.updateParticipantRole("trip-15", "user-7", "admin");
      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should throw error if database connection is undefined", async () => {
      (getConnection as jest.Mock).mockReturnValueOnce(undefined);
      expect(() => (tripModel as any).knex).toThrow("Database connection is undefined");
    });

    it("should throw error if getClient is not available", async () => {
      (getConnection as jest.Mock).mockReturnValueOnce({});
      expect(() => (tripModel as any).knex).toThrow("connection.getClient is not a function");
    });
  });

  describe("edge cases and additional coverage", () => {

    it("should handle multiple join operations in getUserInvites", async () => {
      const invites = [{ id: "invite-complex" }];
      mockOrderBy.mockResolvedValue(invites);

      await tripModel.getUserInvites("user-invites");

      // Verify multiple joins are called
      expect(mockJoin).toHaveBeenCalledTimes(3); // travel_plan, users, locations
    });

    it("should handle select with multiple columns in findById", async () => {
      const trip = { id: "trip-select", trip_name: "Trip Select" };
      mockFirst.mockResolvedValue(trip);

      await tripModel.findById("trip-select");

      expect(mockSelect).toHaveBeenCalledWith(
        "travel_plan.*",
        "users.name as creator_name",
        "locations.name as location_name",
        "trip_status.name as status_name"
      );
    });

    it("should handle select with multiple columns in getParticipants", async () => {
      const participants = [{ id: "participant-select" }];
      mockOrderBy.mockResolvedValue(participants);

      await tripModel.getParticipants("trip-participants");

      expect(mockSelect).toHaveBeenCalledWith(
        "travel_participants.*",
        "users.name as user_name",
        "users.email as user_email",
        "users.profile_picture"
      );
    });
    
    it("should handle getUserInvites complex select", async () => {
      const invites = [{ id: "invite-select" }];
      mockOrderBy.mockResolvedValue(invites);

      await tripModel.getUserInvites("user-invites-select");

      expect(mockSelect).toHaveBeenCalledWith(
        "travel_participants.id",
        "travel_plan.trip_name",
        "travel_plan.start_date",
        "travel_plan.end_date",
        "travel_participants.status",
        "travel_participants.created_at",
        "users.name as creator_name",
        "locations.name as location_name"
      );
    });
  });
describe("findByUserId", () => {
  it("should return trips and total count for user as creator", async () => {
    // Mock the final result of the trips query (which ends with .offset())
    mockOffset.mockResolvedValueOnce([{ id: "trip1" }]);
    // Mock the final result of the count query (which ends with .first())
    mockFirst.mockResolvedValueOnce({ count: 2 });

    const result = await tripModel.findByUserId("user-creator", 1, 5);

    expect(mockKnex).toHaveBeenCalledWith("travel_plan");
    expect(mockLeftJoin).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
    expect(mockLimit).toHaveBeenCalledWith(5);
    expect(mockOffset).toHaveBeenCalledWith(0);
    expect(result.trips).toEqual([{ id: "trip1" }]);
    expect(result.total).toBe(2);
  });

  it("should handle empty trips and undefined count", async () => {
    // Mock empty trips result
    mockOffset.mockResolvedValueOnce([]);
    // Mock undefined count result
    mockFirst.mockResolvedValueOnce({ count: undefined });

    const result = await tripModel.findByUserId("user-no-trips", 2, 10);
    
    expect(result.trips).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("getMessages", () => {
  it("should return messages with sender info", async () => {
    const messages = [{ id: "m1" }];
    mockOffset.mockResolvedValueOnce(messages);

    const result = await tripModel.getMessages("trip-msg", 1, 20);

    expect(mockKnex).toHaveBeenCalledWith("messages");
    expect(mockLeftJoin).toHaveBeenCalledWith("users", "messages.sender_id", "users.id");
    expect(mockWhere).toHaveBeenCalledWith("trip_plan_id", "trip-msg");
    expect(mockOrderBy).toHaveBeenCalledWith("messages.created_at", "desc");
    expect(mockLimit).toHaveBeenCalledWith(20);
    expect(mockOffset).toHaveBeenCalledWith(0);
    expect(result).toBe(messages);
  });

  it("should calculate correct offset", async () => {
    const messages = [{ id: "m2" }];
    mockOffset.mockResolvedValueOnce(messages);

    const result = await tripModel.getMessages("trip-msg", 3, 10); // page 3, limit 10
    expect(mockOffset).toHaveBeenCalledWith(20); // (3-1)*10
    expect(result).toBe(messages);
  });
});
describe("getParticipantCount", () => {
  beforeEach(() => {
    // Patch mockWhere to support .count().first() chaining only for this describe block
    mockWhere.mockImplementation(() => {
      const baseChain = {
        select: mockSelect,
        leftJoin: mockLeftJoin,
        join: mockJoin,
        andOn: mockAndOn,
        on: mockOn,
        first: mockFirst,
        insert: mockInsert,
        returning: mockReturning,
        update: mockUpdate,
        del: mockDel,
        orderBy: mockOrderBy,
        limit: mockLimit,
        offset: mockOffset,
        onConflict: mockOnConflict,
        ignore: mockIgnore,
        fn: mockFn,
        raw: mockRaw,
      } as any;

      baseChain.count = jest.fn(() => ({
        first: mockFirst,
      }));

      return baseChain;
    });
  });

  it("should return parsed count if available", async () => {
    mockFirst.mockResolvedValueOnce({ count: 5 });
    const result = await tripModel.getParticipantCount("trip-count");
    expect(mockKnex).toHaveBeenCalledWith("travel_participants");
    expect(mockWhere).toHaveBeenCalledWith("trip_plan_id", "trip-count");
    expect(result).toBe(5);
  });

  it("should return 0 if result is null", async () => {
    mockFirst.mockResolvedValueOnce(null);
    const result = await tripModel.getParticipantCount("trip-count");
    expect(result).toBe(0);
  });

  it("should return 0 if count is undefined", async () => {
    mockFirst.mockResolvedValueOnce({});
    const result = await tripModel.getParticipantCount("trip-count");
    expect(result).toBe(0);
  });
});


describe("updateParticipantStatus extra", () => {
  it("should set joined_at when status is 'joined'", async () => {
    mockUpdate.mockResolvedValueOnce(1);
    const result = await tripModel.updateParticipantStatus("trip-x", "user-x", "joined");
    expect(mockUpdate).toHaveBeenCalledWith({
      status: "joined",
      joined_at: "2024-01-01T00:00:00Z",
    });
    expect(result).toBe(true);
  });

  it("should not set joined_at if status is not 'joined'", async () => {
    mockUpdate.mockResolvedValueOnce(1);
    const result = await tripModel.updateParticipantStatus("trip-x", "user-x", "declined");
    expect(mockUpdate).toHaveBeenCalledWith({ status: "declined" });
    expect(result).toBe(true);
  });

  it("should return false if no rows updated", async () => {
    mockUpdate.mockResolvedValueOnce(0);
    const result = await tripModel.updateParticipantStatus("trip-x", "user-x", "joined");
    expect(result).toBe(false);
  });
});

});