import { postModel } from "../../src/repositories/post.repository";
import { getConnection } from "../../src/database";
import { ReportStatus, ReportReason } from "../../src/interfaces/post.interface";

jest.mock("../../src/database");

describe("PostModel", () => {
  let mockKnex: jest.Mock;
  let mockSelect: jest.Mock;
  let mockWhere: jest.Mock;
  let mockLeftJoin: jest.Mock;
  let mockJoin: jest.Mock;
  let mockFirst: jest.Mock;
  let mockInsert: jest.Mock;
  let mockReturning: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDel: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;
  let mockOffset: jest.Mock;
  let mockCount: jest.Mock;
  let mockCountDistinct: jest.Mock;
  let mockClone: jest.Mock;
  let mockClearSelect: jest.Mock;
  let mockClearOrder: jest.Mock;
  let mockTransaction: jest.Mock;
  let mockIncrement: jest.Mock;
  let mockDecrement: jest.Mock;
  let mockModify: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();

  mockKnex = jest.fn();
  mockTransaction = jest.fn();

  mockSelect = jest.fn().mockReturnThis();
  mockWhere = jest.fn().mockReturnThis();
  mockLeftJoin = jest.fn().mockReturnThis();
  mockJoin = jest.fn().mockReturnThis();
  mockFirst = jest.fn();
  mockInsert = jest.fn().mockReturnThis();
  mockReturning = jest.fn();
  mockUpdate = jest.fn();
  mockDel = jest.fn();
  mockOrderBy = jest.fn().mockReturnThis();
  mockLimit = jest.fn().mockReturnThis();
  mockOffset = jest.fn().mockReturnThis();
  mockCount = jest.fn();
  mockCountDistinct = jest.fn();
  mockClone = jest.fn();
  mockClearSelect = jest.fn().mockReturnThis();
  mockClearOrder = jest.fn().mockReturnThis();
  mockIncrement = jest.fn();
  mockDecrement = jest.fn();
  mockModify = jest.fn().mockReturnThis();

  const createChainable = (): any => {
    const chainable: any = {
      select: mockSelect,
      where: mockWhere,
      leftJoin: mockLeftJoin,
      join: mockJoin,
      first: mockFirst,
      insert: mockInsert,
      returning: mockReturning,
      update: mockUpdate,
      del: mockDel,
      orderBy: mockOrderBy,
      limit: mockLimit,
      offset: mockOffset,
      count: mockCount,
      countDistinct: mockCountDistinct,
      clone: mockClone,
      clearSelect: mockClearSelect,
      clearOrder: mockClearOrder,
      increment: mockIncrement,
      decrement: mockDecrement,
      modify: mockModify,
      fn: {
        now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP"),
      },
    };

    // Ensure all chainable methods return chainable for chaining
    chainable.select.mockReturnValue(chainable);
    chainable.where.mockReturnValue(chainable);
    chainable.leftJoin.mockReturnValue(chainable);
    chainable.join.mockReturnValue(chainable);
    chainable.orderBy.mockReturnValue(chainable);
    chainable.limit.mockReturnValue(chainable);
    chainable.offset.mockReturnValue(chainable);
    chainable.clearSelect.mockReturnValue(chainable);
    chainable.clearOrder.mockReturnValue(chainable);
    chainable.modify.mockReturnValue(chainable);
    chainable.clone.mockImplementation(() => createChainable());

    return chainable;
  };

  const mainChainable = createChainable();

  mockKnex.mockImplementation(() => mainChainable);
  (mockKnex as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
  (mockKnex as any).transaction = mockTransaction;

  mockTransaction.mockImplementation(async (callback) => {
    const trx = createChainable();
    trx.fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
    return await callback(trx);
  });

  (getConnection as jest.Mock).mockReturnValue({
    getClient: () => mockKnex,
  });
});

  describe("findById", () => {
    it("should return post by id", async () => {
      const mockPost = { id: "abc" };
      mockFirst.mockResolvedValueOnce(mockPost);

      const result = await postModel.findById("abc");

      expect(mockKnex).toHaveBeenCalledWith("posts");
      expect(mockWhere).toHaveBeenCalledWith("id", "abc");
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBe(mockPost);
    });

    it("should return null if post not found", async () => {
      mockFirst.mockResolvedValueOnce(null);

      const result = await postModel.findById("notfound");

      expect(result).toBeNull();
    });
  });

  describe("findPostsWithFilters", () => {
    beforeEach(() => {
      const mockCloneQuery = {
        clearSelect: jest.fn().mockReturnThis(),
        clearOrder: jest.fn().mockReturnThis(),
        countDistinct: jest.fn().mockResolvedValue([{ count: "2" }])
      };
      mockClone.mockReturnValue(mockCloneQuery);
      mockOffset.mockResolvedValue([{ id: "p1" }, { id: "p2" }]);
    });

    it("should return posts with no filters", async () => {
      const result = await postModel.findPostsWithFilters({}, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.status', 'published');
      expect(result.posts).toEqual([{ id: "p1" }, { id: "p2" }]);
      expect(result.total).toBe(2);
    });

    it("should filter by location_id", async () => {
      await postModel.findPostsWithFilters({ location_id: "loc1" }, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.location_id', 'loc1');
    });

    it("should filter by country and trigger location join", async () => {
      await postModel.findPostsWithFilters({ country: "France" }, 10, 0);
      
      expect(mockLeftJoin).toHaveBeenCalledWith('locations', 'posts.location_id', 'locations.id');
      expect(mockWhere).toHaveBeenCalledWith('locations.country', 'ilike', '%France%');
    });

    it("should filter by region and trigger location join", async () => {
      await postModel.findPostsWithFilters({ region: "Europe" }, 10, 0);
      
      expect(mockLeftJoin).toHaveBeenCalledWith('locations', 'posts.location_id', 'locations.id');
      expect(mockWhere).toHaveBeenCalledWith('locations.region', 'ilike', '%Europe%');
    });

    it("should filter by country and region without duplicate joins", async () => {
      await postModel.findPostsWithFilters({ country: "France", region: "Europe" }, 10, 0);
      
      // Should only join once
      expect(mockLeftJoin).toHaveBeenCalledTimes(2); // Once for count query, once for main query
    });

    it("should filter by min_cost", async () => {
      await postModel.findPostsWithFilters({ min_cost: 100 }, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.total_cost', '>=', 100);
    });

    it("should filter by max_cost", async () => {
      await postModel.findPostsWithFilters({ max_cost: 500 }, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.total_cost', '<=', 500);
    });

    it("should filter by min_duration", async () => {
      await postModel.findPostsWithFilters({ min_duration: 3 }, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.duration_days', '>=', 3);
    });

    it("should filter by max_duration", async () => {
      await postModel.findPostsWithFilters({ max_duration: 7 }, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.duration_days', '<=', 7);
    });

    it("should filter by effort_level", async () => {
      await postModel.findPostsWithFilters({ effort_level: 2 }, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.effort_level', 2);
    });

    it("should filter by is_featured when true", async () => {
      await postModel.findPostsWithFilters({ is_featured: true }, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.is_featured', true);
    });

    it("should filter by is_featured when false", async () => {
      await postModel.findPostsWithFilters({ is_featured: false }, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.is_featured', false);
    });

    it("should filter by user_id", async () => {
      await postModel.findPostsWithFilters({ user_id: "user123" }, 10, 0);
      
      expect(mockWhere).toHaveBeenCalledWith('posts.user_id', 'user123');
    });
  });

  describe("findByIdWithDetails", () => {

    it("should return null if post not found", async () => {
      mockFirst.mockResolvedValueOnce(null);

      const result = await postModel.findByIdWithDetails("notfound");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create post with location object", async () => {
      const postData = {
        title: "Test",
        location: { name: "Paris" },
      };
      
      mockTransaction.mockImplementationOnce(async (callback) => {
        const trx = jest.fn();
        const trxChainable = {
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn()
        };
        trx.mockReturnValue(trxChainable);
        (trx as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
        
        trxChainable.returning.mockResolvedValueOnce([{ id: "loc-1" }]);
        trxChainable.returning.mockResolvedValueOnce([{ id: "post-1" }]);
        
        return await callback(trx);
      });

      const id = await postModel.create(postData);

      expect(mockTransaction).toHaveBeenCalled();
      expect(id).toBe("post-1");
    });

    it("should create post with location_id", async () => {
      const postData = {
        title: "Test2",
        location_id: "loc-2",
      };
      
      mockTransaction.mockImplementationOnce(async (callback) => {
        const trx = jest.fn();
        const trxChainable = {
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn()
        };
        trx.mockReturnValue(trxChainable);
        (trx as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
        
        trxChainable.returning.mockResolvedValueOnce([{ id: "post-2" }]);
        
        return await callback(trx);
      });

      const id = await postModel.create(postData);

      expect(mockTransaction).toHaveBeenCalled();
      expect(id).toBe("post-2");
    });

    it("should create post with custom status", async () => {
      const postData = {
        title: "Test3",
        status: "published",
      };
      
      mockTransaction.mockImplementationOnce(async (callback) => {
        const trx = jest.fn();
        const trxChainable = {
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn()
        };
        trx.mockReturnValue(trxChainable);
        (trx as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
        
        trxChainable.returning.mockResolvedValueOnce([{ id: "post-3" }]);
        
        return await callback(trx);
      });

      const id = await postModel.create(postData);

      expect(mockTransaction).toHaveBeenCalled();
      expect(id).toBe("post-3");
    });
  });

  describe("update", () => {
    it("should update post with location object and existing location_id", async () => {
      const updateData = {
        title: "Updated",
        location: { name: "London" },
      };
      
      mockTransaction.mockImplementationOnce(async (callback) => {
        const trx = jest.fn();
        const trxChainable = {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
          update: jest.fn(),
          fn: { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") }
        };
        trx.mockReturnValue(trxChainable);
        (trx as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
        
        trxChainable.first.mockResolvedValueOnce({ id: "post-3", location_id: "loc-3" });
        trxChainable.update.mockResolvedValueOnce(1);
        
        return await callback(trx);
      });

      await postModel.update("post-3", updateData);

      expect(mockTransaction).toHaveBeenCalled();
    });

    it("should update post with location object and no existing location_id", async () => {
      const updateData = {
        title: "Updated",
        location: { name: "Berlin" },
      };
      
      mockTransaction.mockImplementationOnce(async (callback) => {
        const trx = jest.fn();
        const trxChainable = {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
          update: jest.fn(),
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn(),
          fn: { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") }
        };
        trx.mockReturnValue(trxChainable);
        (trx as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
        
        trxChainable.first.mockResolvedValueOnce({ id: "post-4", location_id: null });
        trxChainable.returning.mockResolvedValueOnce([{ id: "new-loc" }]);
        trxChainable.update.mockResolvedValueOnce(1);
        
        return await callback(trx);
      });

      await postModel.update("post-4", updateData);

      expect(mockTransaction).toHaveBeenCalled();
    });

    it("should update post without location", async () => {
      const updateData = { title: "No Location" };
      
      mockTransaction.mockImplementationOnce(async (callback) => {
        const trx = jest.fn();
        const trxChainable = {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
          update: jest.fn(),
          fn: { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") }
        };
        trx.mockReturnValue(trxChainable);
        (trx as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
        
        trxChainable.first.mockResolvedValueOnce({ id: "post-5", location_id: null });
        trxChainable.update.mockResolvedValueOnce(1);
        
        return await callback(trx);
      });

      await postModel.update("post-5", updateData);

      expect(mockTransaction).toHaveBeenCalled();
    });

    it("should throw if post not found", async () => {
      mockTransaction.mockImplementationOnce(async (callback) => {
        const trx = jest.fn();
        const trxChainable = {
          where: jest.fn().mockReturnThis(),
          first: jest.fn(),
          fn: { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") }
        };
        trx.mockReturnValue(trxChainable);
        (trx as any).fn = { now: jest.fn().mockReturnValue("CURRENT_TIMESTAMP") };
        
        trxChainable.first.mockResolvedValueOnce(null);
        
        return await callback(trx);
      });

      await expect(postModel.update("notfound", {})).rejects.toThrow("Post with id notfound not found");
    });
  });

  describe("delete", () => {
    it("should delete post and return true", async () => {
      mockDel.mockResolvedValueOnce(1);

      const result = await postModel.delete("post-5");

      expect(mockKnex).toHaveBeenCalledWith("posts");
      expect(mockWhere).toHaveBeenCalledWith("id", "post-5");
      expect(mockDel).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if no post deleted", async () => {
      mockDel.mockResolvedValueOnce(0);

      const result = await postModel.delete("post-6");

      expect(result).toBe(false);
    });
  });

  describe("findFeaturedPosts", () => {
    it("should return featured posts", async () => {
      mockLimit.mockResolvedValue([{ id: "f1" }]);

      const result = await postModel.findFeaturedPosts(5);

      expect(mockKnex).toHaveBeenCalledWith("posts");
      expect(mockOrderBy).toHaveBeenCalledWith("posts.created_at", "desc");
      expect(result).toEqual([{ id: "f1" }]);
    });
  });

  describe("createMediaRecords", () => {
    it("should insert media records", async () => {
      const mockInsertMedia = jest.fn().mockResolvedValue([]);
      mockKnex.mockReturnValueOnce({ insert: mockInsertMedia });

      await postModel.createMediaRecords("pid", ["url1", "url2"]);

      expect(mockInsertMedia).toHaveBeenCalledWith([
        { post_id: "pid", image_url: "url1" },
        { post_id: "pid", image_url: "url2" },
      ]);
    });

    it("should handle empty media urls", async () => {
      const mockInsertMedia = jest.fn().mockResolvedValue([]);
      mockKnex.mockReturnValueOnce({ insert: mockInsertMedia });

      await postModel.createMediaRecords("pid", []);

      expect(mockInsertMedia).toHaveBeenCalledWith([]);
    });
  });

  describe("like/save/share methods", () => {
    describe("likes", () => {
      it("should find existing like", async () => {
        mockFirst.mockResolvedValueOnce({ id: "like1" });
        const result = await postModel.findLike("pid", "uid");
        expect(result).toEqual({ id: "like1" });
      });

      it("should create and delete like", async () => {
        await postModel.createLike("pid", "uid");
        expect(mockInsert).toHaveBeenCalled();

        await postModel.deleteLike("pid", "uid");
        expect(mockDel).toHaveBeenCalled();
      });

      it("should increment likes count successfully", async () => {
        mockFirst.mockResolvedValueOnce({ id: "pid" });
        const result = await postModel.incrementLikesCount("pid");
        expect(mockIncrement).toHaveBeenCalledWith('likes_count', 1);
        expect(result).toEqual({ id: "pid" });
      });

      it("should throw error when incrementing likes for non-existent post", async () => {
        mockFirst.mockResolvedValueOnce(null);
        await expect(postModel.incrementLikesCount("nonexistent")).rejects.toThrow("Post with id nonexistent not found");
      });

      it("should decrement likes count successfully", async () => {
        mockFirst.mockResolvedValueOnce({ id: "pid" });
        const result = await postModel.decrementLikesCount("pid");
        expect(mockDecrement).toHaveBeenCalledWith('likes_count', 1);
        expect(result).toEqual({ id: "pid" });
      });

      it("should throw error when decrementing likes for non-existent post", async () => {
        mockFirst.mockResolvedValueOnce(null);
        await expect(postModel.decrementLikesCount("nonexistent")).rejects.toThrow("Post with id nonexistent not found");
      });
    });

    describe("saves", () => {
      it("should find existing save", async () => {
        mockFirst.mockResolvedValueOnce({ id: "save1" });
        const result = await postModel.findSave("pid", "uid");
        expect(result).toEqual({ id: "save1" });
      });

      it("should create and delete save", async () => {
        await postModel.createSave("pid", "uid");
        expect(mockInsert).toHaveBeenCalled();

        await postModel.deleteSave("pid", "uid");
        expect(mockDel).toHaveBeenCalled();
      });

      it("should increment saves count successfully", async () => {
        mockFirst.mockResolvedValueOnce({ id: "pid" });
        const result = await postModel.incrementSavesCount("pid");
        expect(mockIncrement).toHaveBeenCalledWith('saves_count', 1);
        expect(result).toEqual({ id: "pid" });
      });

      it("should throw error when incrementing saves for non-existent post", async () => {
        mockFirst.mockResolvedValueOnce(null);
        await expect(postModel.incrementSavesCount("nonexistent")).rejects.toThrow("Post with id nonexistent not found");
      });

      it("should decrement saves count successfully", async () => {
        mockFirst.mockResolvedValueOnce({ id: "pid" });
        const result = await postModel.decrementSavesCount("pid");
        expect(mockDecrement).toHaveBeenCalledWith('saves_count', 1);
        expect(result).toEqual({ id: "pid" });
      });

      it("should throw error when decrementing saves for non-existent post", async () => {
        mockFirst.mockResolvedValueOnce(null);
        await expect(postModel.decrementSavesCount("nonexistent")).rejects.toThrow("Post with id nonexistent not found");
      });
    });

    describe("shares", () => {
      it("should create share with platform", async () => {
        await postModel.createShare("pid", "uid", "twitter");
        expect(mockInsert).toHaveBeenCalledWith({
          post_id: "pid",
          user_id: "uid",
          platform: "twitter"
        });
      });

      it("should create share without platform", async () => {
        await postModel.createShare("pid", "uid");
        expect(mockInsert).toHaveBeenCalledWith({
          post_id: "pid",
          user_id: "uid",
          platform: undefined
        });
      });

      it("should increment shares count successfully", async () => {
        mockFirst.mockResolvedValueOnce({ id: "pid" });
        const result = await postModel.incrementSharesCount("pid");
        expect(mockIncrement).toHaveBeenCalledWith('shares_count', 1);
        expect(result).toEqual({ id: "pid" });
      });

      it("should throw error when incrementing shares for non-existent post", async () => {
        mockFirst.mockResolvedValueOnce(null);
        await expect(postModel.incrementSharesCount("nonexistent")).rejects.toThrow("Post with id nonexistent not found");
      });
    });
  });

describe("findUserPosts", () => {
    it("should return user posts and total", async () => {
      const mockCloneQuery = {
        count: jest.fn().mockResolvedValue([{ count: "3" }])
      };
      mockClone.mockReturnValue(mockCloneQuery);
      mockOffset.mockResolvedValue([{ id: "p1" }, { id: "p2" }, { id: "p3" }]);

      const result = await postModel.findUserPosts("user123", 10, 0);

      expect(mockWhere).toHaveBeenCalledWith('posts.user_id', 'user123');
      expect(result.posts).toEqual([{ id: "p1" }, { id: "p2" }, { id: "p3" }]);
      expect(result.total).toBe(3);
    });

    it("should handle empty results", async () => {
      const mockCloneQuery = {
        count: jest.fn().mockResolvedValue([{ count: "0" }])
      };
      mockClone.mockReturnValue(mockCloneQuery);
      mockOffset.mockResolvedValue([]);

      const result = await postModel.findUserPosts("user123", 10, 0);

      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("findUserLikedPosts", () => {
    it("should return user liked posts and total", async () => {
      const mockCloneQuery = {
        count: jest.fn().mockResolvedValue([{ count: "2" }])
      };
      mockClone.mockReturnValue(mockCloneQuery);
      mockOffset.mockResolvedValue([
        { id: "p1", liked_at: "2023-01-01" },
        { id: "p2", liked_at: "2023-01-02" }
      ]);

      const result = await postModel.findUserLikedPosts("user123", 10, 0);

      expect(mockJoin).toHaveBeenCalledWith('post_likes', 'posts.id', 'post_likes.post_id');
      expect(mockWhere).toHaveBeenCalledWith('post_likes.user_id', 'user123');
      expect(mockWhere).toHaveBeenCalledWith('posts.status', 'published');
      expect(result.posts).toEqual([
        { id: "p1", liked_at: "2023-01-01" },
        { id: "p2", liked_at: "2023-01-02" }
      ]);
      expect(result.total).toBe(2);
    });
  });

  describe("findUserSavedPosts", () => {
    it("should return user saved posts and total", async () => {
      const mockCloneQuery = {
        count: jest.fn().mockResolvedValue([{ count: "1" }])
      };
      mockClone.mockReturnValue(mockCloneQuery);
      mockOffset.mockResolvedValue([{ id: "p1", saved_at: "2023-01-01" }]);

      const result = await postModel.findUserSavedPosts("user123", 10, 0);

      expect(mockJoin).toHaveBeenCalledWith('post_saves', 'posts.id', 'post_saves.post_id');
      expect(mockWhere).toHaveBeenCalledWith('post_saves.user_id', 'user123');
      expect(mockWhere).toHaveBeenCalledWith('posts.status', 'published');
      expect(result.posts).toEqual([{ id: "p1", saved_at: "2023-01-01" }]);
      expect(result.total).toBe(1);
    });
  });

  describe("report methods", () => {
    describe("findUserReport", () => {
      it("should find existing report", async () => {
        const mockReport = { id: "rep1", post_id: "p1", reporter_id: "u1" };
        mockFirst.mockResolvedValueOnce(mockReport);

        const result = await postModel.findUserReport("p1", "u1");

        expect(mockKnex).toHaveBeenCalledWith("reports");
        expect(mockWhere).toHaveBeenCalledWith({ post_id: "p1", reporter_id: "u1" });
        expect(result).toEqual(mockReport);
      });

      it("should return null if no report found", async () => {
        mockFirst.mockResolvedValueOnce(null);

        const result = await postModel.findUserReport("p1", "u1");

        expect(result).toBeNull();
      });
    });

    describe("createReport", () => {
      it("should create report with description", async () => {
        const mockReport = { 
          id: "rep1", 
          post_id: "p1", 
          reporter_id: "u1", 
          reason: ReportReason.SPAM,
          description: "This is spam",
          status: ReportStatus.PENDING
        };
        mockReturning.mockResolvedValueOnce([mockReport]);

        const result = await postModel.createReport("p1", "u1", ReportReason.SPAM, "This is spam");

        expect(mockInsert).toHaveBeenCalledWith({
          post_id: "p1",
          reporter_id: "u1",
          reason: ReportReason.SPAM,
          description: "This is spam",
          status: ReportStatus.PENDING
        });
        expect(result).toEqual(mockReport);
      });

      it("should create report without description", async () => {
        const mockReport = { 
          id: "rep1", 
          post_id: "p1", 
          reporter_id: "u1", 
          reason: ReportReason.INAPPROPRIATE,
          status: ReportStatus.PENDING
        };
        mockReturning.mockResolvedValueOnce([mockReport]);

        const result = await postModel.createReport("p1", "u1", ReportReason.INAPPROPRIATE);

        expect(mockInsert).toHaveBeenCalledWith({
          post_id: "p1",
          reporter_id: "u1",
          reason: ReportReason.INAPPROPRIATE,
          description: undefined,
          status: ReportStatus.PENDING
        });
        expect(result).toEqual(mockReport);
      });
    });

    describe("findReportById", () => {
      it("should find report by id", async () => {
        const mockReport = { id: "rep1", post_id: "p1" };
        mockFirst.mockResolvedValueOnce(mockReport);

        const result = await postModel.findReportById("rep1");

        expect(mockKnex).toHaveBeenCalledWith("reports");
        expect(mockWhere).toHaveBeenCalledWith('id', 'rep1');
        expect(result).toEqual(mockReport);
      });

      it("should return null if report not found", async () => {
        mockFirst.mockResolvedValueOnce(null);

        const result = await postModel.findReportById("notfound");

        expect(result).toBeNull();
      });
    });

    describe("deleteReport", () => {
      it("should delete report and return true", async () => {
        mockDel.mockResolvedValueOnce(1);

        const result = await postModel.deleteReport("rep1");

        expect(mockKnex).toHaveBeenCalledWith("reports");
        expect(mockWhere).toHaveBeenCalledWith('id', 'rep1');
        expect(mockDel).toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it("should return false if no report deleted", async () => {
        mockDel.mockResolvedValueOnce(0);

        const result = await postModel.deleteReport("notfound");

        expect(result).toBe(false);
      });
    });
  });
});

