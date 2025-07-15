import { DiningController } from '../../src/controllers/dining.controller';
import { DiningService } from '../../src/services/dining.sevice';
import { Request, Response } from 'express';

jest.mock('../../src/services/dining.sevice');

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
};

describe('DiningController', () => {
    let res: Response;

    beforeEach(() => {
        res = mockResponse();
        jest.clearAllMocks();
    });

    it('getDiningById - should return 404 if not found', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        (DiningService.getDiningById as jest.Mock).mockResolvedValue(null);
        const next = jest.fn();
        await DiningController.getDiningById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Dining experience not found' });
    });

    it('getDiningById - should return dining if found', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        const mockDining = { id: 1, name: 'Sushi Place' };
        (DiningService.getDiningById as jest.Mock).mockResolvedValue(mockDining);
        const next = jest.fn();
        await DiningController.getDiningById(req, res, next);

        expect(res.json).toHaveBeenCalledWith({ success: true, data: mockDining });
    });

    it('createDining - should return 201 and created dining', async () => {
        const req = { params: { postId: '1' }, body: { name: 'Sushi Place', user_id: '123' } } as unknown as Request;
        const mockDining = { id: 2, name: 'Sushi Place' };
        (DiningService.createDining as jest.Mock).mockResolvedValue(mockDining);

        const next = jest.fn();
        await DiningController.createDining(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockDining,
            message: 'Dining experience created successfully',
        });
    });

    it('updateDining - should return 404 if not found or unauthorized', async () => {
        const req = { params: { id: '1' }, body: { name: 'Updated Sushi', user_id: '123' } } as unknown as Request;
        (DiningService.updateDining as jest.Mock).mockResolvedValue(null);
        const next = jest.fn();
        await DiningController.updateDining(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Dining experience not found or unauthorized' });
    });

    it('updateDining - should return updated dining if found', async () => {
        const req = { params: { id: '1' }, body: { name: 'Updated Sushi', user_id: '123' } } as unknown as Request;
        const mockDining = { id: 1, name: 'Updated Sushi' };
        (DiningService.updateDining as jest.Mock).mockResolvedValue(mockDining);
        const next = jest.fn();
        await DiningController.updateDining(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockDining,
            message: 'Dining experience updated successfully',
        });
    });

    it('getDiningsByPost - should return dinings for a post', async () => {
        const req = { params: { postId: '1' } } as unknown as Request;
        const mockDinings = [{ id: 1, name: 'Sushi Place' }];
        (DiningService.getDiningsByPost as jest.Mock).mockResolvedValue(mockDinings);

        const next = jest.fn();
        await DiningController.getDiningsByPost(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockDinings,
        });
    });

    it('deleteDining - should return 404 if not found or unauthorized', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        (DiningService.deleteDining as jest.Mock).mockResolvedValue(false);
        const next = jest.fn();
        await DiningController.deleteDining(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Dining experience not found or unauthorized' });
    });

    it('deleteDining - should return success if deleted', async () => {
        const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
        (DiningService.deleteDining as jest.Mock).mockResolvedValue(true);
        const next = jest.fn();
        await DiningController.deleteDining(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Dining experience deleted successfully',
        });
    });
});