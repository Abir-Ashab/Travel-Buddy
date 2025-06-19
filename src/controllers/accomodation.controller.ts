import { Request, Response } from 'express';
import { AccommodationService } from "../services/accomodation.service"
import { CreateAccommodationRequest, UpdateAccommodationRequest } from "../interfaces/accomodation.interface"
export class AccommodationController {
  static async getAccommodationsByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const accommodations = await AccommodationService.getAccommodationsByPost(postId);
      res.json({
        success: true,
        data: accommodations
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAccommodationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const accommodation = await AccommodationService.getAccommodationById(id);
      
      if (!accommodation) {
        return res.status(404).json({
          success: false,
          message: 'Accommodation not found'
        });
      }

      res.json({
        success: true,
        data: accommodation
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async createAccommodation(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const accommodationData: CreateAccommodationRequest = req.body;

      const accommodation = await AccommodationService.createAccommodation(postId, accommodationData);
      
      res.status(201).json({
        success: true,
        data: accommodation,
        message: 'Accommodation created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateAccommodation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateAccommodationRequest = req.body;
      const userId = req.body.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const accommodation = await AccommodationService.updateAccommodation(id, userId, updateData);
      
      if (!accommodation) {
        return res.status(404).json({
          success: false,
          message: 'Accommodation not found or unauthorized'
        });
      }

      res.json({
        success: true,
        data: accommodation,
        message: 'Accommodation updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteAccommodation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const success = await AccommodationService.deleteAccommodation(id, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Accommodation not found or unauthorized'
        });
      }

      res.json({
        success: true,
        message: 'Accommodation deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
