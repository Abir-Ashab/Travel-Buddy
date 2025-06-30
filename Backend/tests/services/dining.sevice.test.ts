import { DiningService } from '../../src/services/dining.sevice';
import { diningModel } from '../../src/repositories/dining.repository';
import { postModel } from '../../src/repositories/post.repository';
import { Dining, CreateDiningRequest, UpdateDiningRequest } from '../../src/interfaces/dining.interface';

jest.mock('../../src/repositories/dining.repository');
jest.mock('../../src/repositories/post.repository');

const mockDining: Dining = {
  id: 'dining1',
  post_id: 'post1',
  restaurant_name: 'Test Restaurant',
  cuisine_type: 'Italian',
  meal_type: 'dinner',
  cost: 50,
  rating: 4,
  review: 'Great food!',
  dishes_tried: ['Pasta', 'Pizza'],
  notes: 'Nice ambiance',
  visit_date: new Date('2024-06-01'),
  created_at: new Date('2024-06-01T10:00:00Z'),
  updated_at: new Date('2024-06-01T12:00:00Z'),
};

const mockPost = {
  id: 'post1',
  user_id: 'user1',
};

describe('DiningService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDiningsByPost', () => {
    it('should return dinings for a post', async () => {
      (diningModel.findByPostId as jest.Mock).mockResolvedValue([mockDining]);
      const result = await DiningService.getDiningsByPost('post1');
      expect(result).toEqual([mockDining]);
      expect(diningModel.findByPostId).toHaveBeenCalledWith('post1');
    });
  });

  describe('getDiningById', () => {
    it('should return a dining by id', async () => {
      (diningModel.findById as jest.Mock).mockResolvedValue(mockDining);
      const result = await DiningService.getDiningById('dining1');
      expect(result).toEqual(mockDining);
      expect(diningModel.findById).toHaveBeenCalledWith('dining1');
    });

    it('should return null if dining not found', async () => {
      (diningModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await DiningService.getDiningById('notfound');
      expect(result).toBeNull();
    });
  });

  describe('createDining', () => {
    it('should create a dining and return it', async () => {
      const diningData: CreateDiningRequest = {
        restaurant_name: 'Test Restaurant',
        cuisine_type: 'Italian',
        meal_type: 'dinner',
        cost: 50,
        rating: 5,
        review: 'Excellent!',
        dishes_tried: ['Pasta'],
        notes: 'Loved the pasta',
        visit_date: '2024-06-01',
      };
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (diningModel.create as jest.Mock).mockResolvedValue('dining1');
      (diningModel.findById as jest.Mock).mockResolvedValue(mockDining);

      const result = await DiningService.createDining('post1', diningData);
      expect(postModel.findById).toHaveBeenCalledWith('post1');
      expect(diningModel.create).toHaveBeenCalledWith({ post_id: 'post1', ...diningData });
      expect(result).toEqual(mockDining);
    });

    it('should throw error if rating is invalid', async () => {
      const diningData: CreateDiningRequest = {
        restaurant_name: 'Test Restaurant',
        cuisine_type: 'Italian',
        meal_type: 'dinner',
        cost: 50,
        rating: 6,
        review: 'Too good!',
        dishes_tried: ['Pasta'],
        notes: 'Over the top',
        visit_date: '2024-06-01',
      };
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);

      await expect(DiningService.createDining('post1', diningData)).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should throw error if dining not found after creation', async () => {
      const diningData: CreateDiningRequest = {
        restaurant_name: 'Test Restaurant',
        cuisine_type: 'Italian',
        meal_type: 'dinner',
        cost: 50,
        rating: 4,
        review: 'Nice!',
        dishes_tried: ['Pizza'],
        notes: 'Good pizza',
        visit_date: '2024-06-01',
      };
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (diningModel.create as jest.Mock).mockResolvedValue('dining1');
      (diningModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(DiningService.createDining('post1', diningData)).rejects.toThrow('Dining experience not found after creation');
    });
  });

  describe('updateDining', () => {
    it('should update a dining and return updated dining', async () => {
      const updateData: UpdateDiningRequest = { rating: 5, review: 'Updated!', notes: 'Updated notes' };
      (diningModel.findById as jest.Mock)
        .mockResolvedValueOnce(mockDining) // findById before update
        .mockResolvedValueOnce({ ...mockDining, ...updateData }); // findById after update
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (diningModel.update as jest.Mock).mockResolvedValue(undefined);

      const result = await DiningService.updateDining('dining1', updateData);
      expect(result).toEqual({ ...mockDining, ...updateData });
      expect(diningModel.update).toHaveBeenCalledWith('dining1', updateData);
    });

    it('should return null if dining not found', async () => {
      (diningModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await DiningService.updateDining('notfound', { rating: 3 });
      expect(result).toBeNull();
    });

    it('should throw error if rating is invalid', async () => {
      (diningModel.findById as jest.Mock).mockResolvedValue(mockDining);
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);

      await expect(
        DiningService.updateDining('dining1', { rating: 0 })
      ).rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('deleteDining', () => {
    it('should delete a dining and return true', async () => {
      (diningModel.findById as jest.Mock).mockResolvedValue(mockDining);
      (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
      (diningModel.delete as jest.Mock).mockResolvedValue(true);

      const result = await DiningService.deleteDining('dining1');
      expect(result).toBe(true);
      expect(diningModel.delete).toHaveBeenCalledWith('dining1');
    });

    it('should return false if dining not found', async () => {
      (diningModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await DiningService.deleteDining('notfound');
      expect(result).toBe(false);
    });
  });
});