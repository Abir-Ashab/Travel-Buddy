import { PostController } from '../../src/controllers/post.controller';
import { PostService } from '../../src/services/post.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/post.service');

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
};

describe('PostController', () => {
    let res: Response;

    beforeEach(() => {
        res = mockResponse();
        jest.clearAllMocks();
    });

    it('getPostById - should return 404 if not found', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        (PostService.getPostById as jest.Mock).mockResolvedValue(null);

        const next = jest.fn();
        await PostController.getPostById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Post not found' });
    });

    it('createPost - should return 201 and created post', async () => {
        const req = { body: { user_id: '1', title: 'Test' } } as unknown as Request;
        const mockPost = { id: 1, title: 'Test' };
        (PostService.createPost as jest.Mock).mockResolvedValue(mockPost);

        const next = jest.fn();
        await PostController.createPost(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Post created successfully',
            data: mockPost,
        });
    });

    it('updatePost - should return 404 if not found or unauthorized', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123', title: 'Updated' } } as unknown as Request;
        (PostService.updatePost as jest.Mock).mockResolvedValue(null);

        const next = jest.fn();
        await PostController.updatePost(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Post not found or unauthorized' });
    });

    it('deletePost - should return 404 if not found', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        (PostService.deletePost as jest.Mock).mockResolvedValue(false);

        const next = jest.fn();
        await PostController.deletePost(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Post not found or unauthorized' });
    });

    it('deletePost - should return success message on successful deletion', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        (PostService.deletePost as jest.Mock).mockResolvedValue(true);

        const next = jest.fn();
        await PostController.deletePost(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Post deleted successfully',
        });
    });

    it('getPostById - should return post by ID', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        const mockPost = { id: 1, title: 'Test Post' };
        (PostService.getPostById as jest.Mock).mockResolvedValue(mockPost);

        const next = jest.fn();
        await PostController.getPostById(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockPost,
        });
    });

    it('getPosts - should return posts', async () => {
        const req = { query: {} } as unknown as Request;
        const mockPosts = [{ id: 1, title: 'Test Post' }];
        (PostService.getPosts as jest.Mock).mockResolvedValue(mockPosts);

        const next = jest.fn();
        await PostController.getPosts(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockPosts,
        });
    });

    it('likePost - should return like result', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        const mockResult = { message: 'Liked', likes_count: 5 };
        (PostService.likePost as jest.Mock).mockResolvedValue(mockResult);

        const next = jest.fn();
        await PostController.likePost(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: mockResult.message,
            data: { likes_count: mockResult.likes_count },
        });
    });

    it('reportPost - should return 201 and report data', async () => {
        const req = { params: { id: '1' }, body: { reason: 'Spam', description: 'desc', user_id: '123' } } as unknown as Request;
        const mockReport = { id: 1, reason: 'Spam' };
        (PostService.reportPost as jest.Mock).mockResolvedValue(mockReport);

        const next = jest.fn();
        await PostController.reportPost(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Report submitted successfully',
            data: mockReport,
        });
    });

    it('toggleFeaturePost - should return 404 if not found', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        (PostService.toggleFeaturePost as jest.Mock).mockResolvedValue(null);

        const next = jest.fn();
        await PostController.toggleFeaturePost(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Post not found' });
    });

    it('toggleFeaturePost - should return featured/unfeatured message', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        const mockPost = { id: 1, is_featured: true };
        (PostService.toggleFeaturePost as jest.Mock).mockResolvedValue(mockPost);

        const next = jest.fn();
        await PostController.toggleFeaturePost(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Post featured successfully',
            data: mockPost,
        });
    });
});
