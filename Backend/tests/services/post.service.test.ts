import { PostService } from '../../src/services/post.service';
import { postModel } from '../../src/repositories/post.repository';
import {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostStatus,
  ReportReason,
  ReportStatus,
  PostsResponse,
  Report,
  Media,
  PostLike,
  PostSave,
  PostShare,
  Location,
} from '../../src/interfaces/post.interface';

jest.mock('../../src/repositories/post.repository');

const mockDate = new Date('2024-06-01T10:00:00Z');
const mockPost: Post = {
  id: 'post1',
  user_id: 'user1',
  location_id: 'loc1',
  title: 'Test Post',
  description: 'This is a test post',
  total_cost: 100,
  duration_days: 5,
  effort_level: 2,
  is_featured: false,
  status: PostStatus.PUBLISHED,
  likes_count: 2,
  saves_count: 1,
  shares_count: 0,
  created_at: mockDate,
  updated_at: mockDate,
};

const mockLocation: Location = {
  id: 'loc1',
  name: 'Paris',
  country: 'France',
  region: 'Ile-de-France',
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: 'Europe/Paris',
  created_at: mockDate,
};

const mockMedia: Media = {
  id: 'media1',
  post_id: 'post1',
  image_url: 'url1',
};

const mockLike: PostLike = {
  id: 'like1',
  post_id: 'post1',
  user_id: 'user1',
  created_at: mockDate,
};

const mockSave: PostSave = {
  id: 'save1',
  post_id: 'post1',
  user_id: 'user1',
  created_at: mockDate,
};

const mockShare: PostShare = {
  id: 'share1',
  post_id: 'post1',
  user_id: 'user1',
  platform: 'facebook',
  created_at: mockDate,
};

const mockReport: Report = {
  id: 'report1',
  reporter_id: 'user2',
  post_id: 'post1',
  reason: ReportReason.SPAM,
  description: 'Spam content',
  status: ReportStatus.PENDING,
  created_at: mockDate,
};

const mockPostsResponse: PostsResponse = {
  posts: [mockPost],
  total: 1,
  page: 1,
  limit: 10,
  has_next: false,
};

describe('PostService - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts with filters', () => {
    it('should call with correct filters and pagination', async () => {
      (postModel.findPostsWithFilters as jest.Mock).mockResolvedValue({ posts: [mockPost], total: 1 });
      const filters = { location: 'Paris', status: PostStatus.PUBLISHED, is_featured: false };
      const result = await PostService.getPosts(filters, 1, 10);
      expect(result).toEqual(mockPostsResponse);
      expect(postModel.findPostsWithFilters).toHaveBeenCalledWith(filters, 10, 0);
    });
  });

  describe('getFeaturedPosts', () => {
    it('should return empty array if no featured posts', async () => {
      (postModel.findFeaturedPosts as jest.Mock).mockResolvedValue([]);
      const result = await PostService.getFeaturedPosts(3);
      expect(result).toEqual([]);
    });
  });

  describe('getPostWithDetails', () => {
    it('should return null if no details found', async () => {
      (postModel.findByIdWithDetails as jest.Mock).mockResolvedValue(null);
      const result = await PostService.getPostWithDetails('notfound');
      expect(result).toBeNull();
    });
  });

  describe('createPost', () => {
    const postData: CreatePostRequest = {
      title: 'Test Post',
      description: 'This is a test post',
      location_id: 'loc1',
      total_cost: 100,
      duration_days: 5,
      effort_level: 2,
      status: PostStatus.DRAFT,
      media_urls: ['url1'],
    };

    it('should create post with status DRAFT', async () => {
      (postModel.create as jest.Mock).mockResolvedValue('post1');
      (postModel.createMediaRecords as jest.Mock).mockResolvedValue(undefined);
      (postModel.findById as jest.Mock).mockResolvedValue({ ...mockPost, status: PostStatus.DRAFT });
      const result = await PostService.createPost('user1', postData);
      expect(result.status).toBe(PostStatus.DRAFT);
    });
  });

  describe('updatePost', () => {
    it('should update post status', async () => {
      (postModel.findById as jest.Mock)
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce({ ...mockPost, status: PostStatus.ARCHIVED });
      (postModel.update as jest.Mock).mockResolvedValue(undefined);
      const result = await PostService.updatePost('post1', 'user1', { status: PostStatus.ARCHIVED });
      expect(result?.status).toBe(PostStatus.ARCHIVED);
    });
  });

  describe('likePost', () => {
    it('should not increment likes if already liked', async () => {
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (postModel.findLike as jest.Mock).mockResolvedValue(mockLike);
      const result = await PostService.likePost('post1', 'user1');
      expect(result).toEqual({ message: 'Post already liked', likes_count: mockPost.likes_count });
      expect(postModel.incrementLikesCount).not.toHaveBeenCalled();
    });
  });

  describe('unlikePost', () => {
    it('should not decrement likes if not liked', async () => {
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (postModel.findLike as jest.Mock).mockResolvedValue(null);
      const result = await PostService.unlikePost('post1', 'user1');
      expect(result).toEqual({ message: 'Post not liked', likes_count: mockPost.likes_count });
      expect(postModel.decrementLikesCount).not.toHaveBeenCalled();
    });
  });

  describe('savePost', () => {
    it('should not increment saves if already saved', async () => {
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (postModel.findSave as jest.Mock).mockResolvedValue(mockSave);
      const result = await PostService.savePost('post1', 'user1');
      expect(result).toEqual({ message: 'Post already saved', saves_count: mockPost.saves_count });
      expect(postModel.incrementSavesCount).not.toHaveBeenCalled();
    });
  });

  describe('unsavePost', () => {
    it('should not decrement saves if not saved', async () => {
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (postModel.findSave as jest.Mock).mockResolvedValue(null);
      const result = await PostService.unsavePost('post1', 'user1');
      expect(result).toEqual({ message: 'Post not saved', saves_count: mockPost.saves_count });
      expect(postModel.decrementSavesCount).not.toHaveBeenCalled();
    });
  });

  describe('sharePost', () => {
    it('should increment shares_count for different platforms', async () => {
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (postModel.createShare as jest.Mock).mockResolvedValue(undefined);
      (postModel.incrementSharesCount as jest.Mock).mockResolvedValue({ ...mockPost, shares_count: 2 });
      const result = await PostService.sharePost('post1', 'user1', 'twitter');
      expect(result).toEqual({ shares_count: 2 });
      expect(postModel.createShare).toHaveBeenCalledWith('post1', 'user1', 'twitter');
    });
  });

  describe('getUserPosts', () => {
    it('should return empty posts if user has no posts', async () => {
      (postModel.findUserPosts as jest.Mock).mockResolvedValue({ posts: [], total: 0 });
      const result = await PostService.getUserPosts('user2', 1, 10);
      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getUserLikedPosts', () => {
    it('should return empty posts if user has not liked any posts', async () => {
      (postModel.findUserLikedPosts as jest.Mock).mockResolvedValue({ posts: [], total: 0 });
      const result = await PostService.getUserLikedPosts('user2', 1, 10);
      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getUserSavedPosts', () => {
    it('should return empty posts if user has not saved any posts', async () => {
      (postModel.findUserSavedPosts as jest.Mock).mockResolvedValue({ posts: [], total: 0 });
      const result = await PostService.getUserSavedPosts('user2', 1, 10);
      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('reportPost', () => {
    it('should throw error if report reason is OTHER and no description', async () => {
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (postModel.findUserReport as jest.Mock).mockResolvedValue(null);
      (postModel.createReport as jest.Mock).mockImplementation(() => { throw new Error('Description required'); });
      await expect(PostService.reportPost('post1', 'user2', ReportReason.OTHER)).rejects.toThrow();
    });
  });

  describe('toggleFeaturePost', () => {
    it('should toggle is_featured from true to false', async () => {
      (postModel.findById as jest.Mock)
        .mockResolvedValueOnce({ ...mockPost, is_featured: true })
        .mockResolvedValueOnce({ ...mockPost, is_featured: false });
      (postModel.update as jest.Mock).mockResolvedValue(undefined);
      const result = await PostService.toggleFeaturePost('post1');
      expect(result?.is_featured).toBe(false);
    });
  });

  describe('getReports', () => {
    it('should return empty array if no reports', async () => {
      (postModel.findReports as jest.Mock).mockResolvedValue([]);
      const result = await PostService.getReports(1, 10, ReportStatus.PENDING);
      expect(result).toEqual([]);
    });
  });

  describe('resolveReport', () => {
    it('should throw if updateReport fails', async () => {
      (postModel.updateReport as jest.Mock).mockImplementation(() => { throw new Error('DB error'); });
      await expect(PostService.resolveReport('report1')).rejects.toThrow('DB error');
    });
  });

  describe('deleteReportedPost', () => {
    it('should throw error if report not found', async () => {
      (postModel.findReportById as jest.Mock).mockResolvedValue(null);
      await expect(PostService.deleteReportedPost('notfound')).rejects.toThrow('Report not found');
    });
    it('should return false if post deletion fails', async () => {
      (postModel.findReportById as jest.Mock).mockResolvedValue({ post_id: 'post1' });
      (postModel.delete as jest.Mock).mockResolvedValue(false);
      const result = await PostService.deleteReportedPost('report1');
      expect(result).toBe(false);
    });
  });
});
