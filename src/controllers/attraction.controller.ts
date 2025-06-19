// attraction.controller.ts
import { Request, Response } from 'express';
import { AttractionService } from '../services/attraction.service';
import { CreateAttractionRequest, UpdateAttractionRequest } from '../interfaces/attraction.interface';

export class AttractionController {
  static async getAttractionsByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const attractions = await AttractionService.getAttractionsByPost(postId);
      res.json({
        success: true,
        data: attractions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAttractionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const attraction = await AttractionService.getAttractionById(id);
      
      if (!attraction) {
        return res.status(404).json({
          success: false,
          message: 'Attraction not found'
        });
      }

      res.json({
        success: true,
        data: attraction
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async createAttraction(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const attractionData: CreateAttractionRequest = req.body;
      const userId = req.body.user_id

      // if (!userId) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'User not authenticated'
      //   });
      // }

      const attraction = await AttractionService.createAttraction(postId, attractionData);
      
      res.status(201).json({
        success: true,
        data: attraction,
        message: 'Attraction created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateAttraction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateAttractionRequest = req.body;
      const userId = req.body.user_id

      // if (!userId) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'User not authenticated'
      //   });
      // }

      const attraction = await AttractionService.updateAttraction(id, userId, updateData);
      
      if (!attraction) {
        return res.status(404).json({
          success: false,
          message: 'Attraction not found or unauthorized'
        });
      }

      res.json({
        success: true,
        data: attraction,
        message: 'Attraction updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteAttraction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.user_id

      // if (!userId) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'User not authenticated'
      //   });
      // }

      const success = await AttractionService.deleteAttraction(id, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Attraction not found or unauthorized'
        });
      }

      res.json({
        success: true,
        message: 'Attraction deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}