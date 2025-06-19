import { Request, Response } from 'express';
import { DiningService } from '../services/dining.sevice';
import { CreateDiningRequest, UpdateDiningRequest } from '../interfaces/dining.interface';

export class DiningController {
  static async getDiningsByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const dinings = await DiningService.getDiningsByPost(postId);
      res.json({
        success: true,
        data: dinings
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getDiningById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dining = await DiningService.getDiningById(id);
      
      if (!dining) {
        return res.status(404).json({
          success: false,
          message: 'Dining experience not found'
        });
      }

      res.json({
        success: true,
        data: dining
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async createDining(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const diningData: CreateDiningRequest = req.body;
      const userId = req.body.user_id

    //   if (!userId) {
    //     return res.status(401).json({
    //       success: false,
    //       message: 'User not authenticated'
    //     });
    //   }

      const dining = await DiningService.createDining(postId, userId, diningData);
      
      res.status(201).json({
        success: true,
        data: dining,
        message: 'Dining experience created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateDining(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateDiningRequest = req.body;
      const userId = req.body.user_id

    //   if (!userId) {
    //     return res.status(401).json({
    //       success: false,
    //       message: 'User not authenticated'
    //     });
    //   }

      const dining = await DiningService.updateDining(id, userId, updateData);
      
      if (!dining) {
        return res.status(404).json({
          success: false,
          message: 'Dining experience not found or unauthorized'
        });
      }

      res.json({
        success: true,
        data: dining,
        message: 'Dining experience updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteDining(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.user_id

    //   if (!userId) {
    //     return res.status(401).json({
    //       success: false,
    //       message: 'User not authenticated'
    //     });
    //   }

      const success = await DiningService.deleteDining(id, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Dining experience not found or unauthorized'
        });
      }

      res.json({
        success: true,
        message: 'Dining experience deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
