import { transportModel } from "../../src/repositories/transport.repository";
import { getConnection } from "../../src/database";
import { Transport } from "../../src/interfaces/transport.interface";

jest.mock("../../src/database");

describe("TransportModel", () => {
  let mockKnex: jest.Mock;
  let mockWhere: jest.Mock;
  let mockFirst: jest.Mock;
  let mockInsert: jest.Mock;
  let mockReturning: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDel: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockFn: { now: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockWhere = jest.fn();
    mockFirst = jest.fn();
    mockInsert = jest.fn();
    mockReturning = jest.fn();
    mockUpdate = jest.fn();
    mockDel = jest.fn();
    mockOrderBy = jest.fn();
    mockFn = { now: jest.fn(() => "2024-01-01T00:00:00Z") };
    mockKnex = jest.fn();

    const createChainableObject = () => ({
      where: mockWhere,
      first: mockFirst,
      insert: mockInsert,
      returning: mockReturning,
      update: mockUpdate,
      del: mockDel,
      orderBy: mockOrderBy,
      fn: mockFn,
    });

    mockKnex.mockImplementation(() => createChainableObject());
    (mockKnex as any).fn = mockFn;

    mockWhere.mockImplementation(() => createChainableObject());
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
    it("should return transport records by postId", async () => {
      const mockResult = [{ id: "1" }, { id: "2" }];
      mockWhere.mockResolvedValue(mockResult);

      const result = await transportModel.findByPostId("post123");

      expect(mockKnex).toHaveBeenCalledWith("transports");
      expect(mockWhere).toHaveBeenCalledWith("post_id", "post123");
      expect(result).toBe(mockResult);
    });
  });

  describe("findById", () => {
    it("should return transport by id", async () => {
      const mockTransport = { id: "abc" };
      mockFirst.mockResolvedValue(mockTransport);

      const result = await transportModel.findById("abc");

      expect(mockKnex).toHaveBeenCalledWith("transports");
      expect(mockWhere).toHaveBeenCalledWith("id", "abc");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockTransport);
    });

    it("should return null if transport not found", async () => {
      mockFirst.mockResolvedValue(null);

      const result = await transportModel.findById("notfound");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create transport and return id", async () => {
      const transportData = {
        post_id: "post1",
        type: "flight",
        details: "Paris to London",
      };
      mockReturning.mockResolvedValue([{ id: "transport-1" }]);

      const id = await transportModel.create(transportData);

      expect(mockKnex).toHaveBeenCalledWith("transports");
      expect(mockInsert).toHaveBeenCalledWith(transportData);
      expect(mockReturning).toHaveBeenCalledWith("id");
      expect(id).toBe("transport-1");
    });
  });

  describe("update", () => {
    it("should update transport by id", async () => {
      const updateData = { type: "train", details: "London to Berlin" };

      await transportModel.update("transport-2", updateData);

      expect(mockKnex).toHaveBeenCalledWith("transports");
      expect(mockWhere).toHaveBeenCalledWith("id", "transport-2");
      expect(mockUpdate).toHaveBeenCalledWith({
        ...updateData,
        updated_at: "2024-01-01T00:00:00Z",
      });
    });
  });

  describe("delete", () => {
    it("should delete transport and return true", async () => {
      mockDel.mockResolvedValue(1);

      const result = await transportModel.delete("transport-3");

      expect(mockKnex).toHaveBeenCalledWith("transports");
      expect(mockWhere).toHaveBeenCalledWith("id", "transport-3");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if no transport deleted", async () => {
      mockDel.mockResolvedValue(0);

      const result = await transportModel.delete("transport-4");

      expect(mockKnex).toHaveBeenCalledWith("transports");
      expect(mockWhere).toHaveBeenCalledWith("id", "transport-4");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should throw error if database connection is undefined", async () => {
      (getConnection as jest.Mock).mockReturnValueOnce(undefined);
      expect(() => (transportModel as any).knex).toThrow("Database connection is undefined");
    });
  });
});