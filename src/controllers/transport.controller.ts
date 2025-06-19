import { Request, Response } from 'express';
import { TransportService } from "../services/transport.service"
import { CreateTransportRequest, UpdateTransportRequest } from '../interfaces/transport.interface';

export class TransportController {
  static async getTransportsByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const transports = await TransportService.getTransportsByPost(postId);
      res.json({
        success: true,
        data: transports
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getTransportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transport = await TransportService.getTransportById(id);
      
      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found'
        });
      }

      res.json({
        success: true,
        data: transport
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async createTransport(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const transportData: CreateTransportRequest = req.body;

      const transport = await TransportService.createTransport(postId, transportData);
      
      res.status(201).json({
        success: true,
        data: transport,
        message: 'Transport created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateTransport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateTransportRequest = req.body;
      const userId = req.body.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const transport = await TransportService.updateTransport(id, userId, updateData);
      
      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found or unauthorized'
        });
      }

      res.json({
        success: true,
        data: transport,
        message: 'Transport updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteTransport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const success = await TransportService.deleteTransport(id, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Transport not found or unauthorized'
        });
      }

      res.json({
        success: true,
        message: 'Transport deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
