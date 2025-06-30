import { TripController } from '../../src/controllers/trip.controller';
import { TripService } from '../../src/services/trip.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/trip.service');

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
};

describe('TripController', () => {
    let res: Response;

    beforeEach(() => {
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('createTrip', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { body: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.createTrip(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return 201 and created trip', async () => {
            const req = { body: { user_id: '123', name: 'Trip' } } as unknown as Request;
            const mockTrip = { id: 1, name: 'Trip' };
            (TripService.createTrip as jest.Mock).mockResolvedValue(mockTrip);
            const next = jest.fn();
            await TripController.createTrip(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockTrip,
                message: 'Trip created successfully',
            });
        });
    });

    describe('getUserTrips', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { query: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.getUserTrips(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return user trips', async () => {
            const req = { query: { user_id: '123', page: '1', limit: '10' } } as unknown as Request;
            const mockTrips = [{ id: 1, name: 'Trip' }];
            (TripService.getUserTrips as jest.Mock).mockResolvedValue(mockTrips);
            const next = jest.fn();
            await TripController.getUserTrips(req, res, next);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTrips });
        });
    });

    describe('getTripById', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1' }, query: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.getTripById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return 404 if trip not found', async () => {
            const req = { params: { id: '1' }, query: { user_id: '123' } } as unknown as Request;
            (TripService.getTripById as jest.Mock).mockResolvedValue(null);
            const next = jest.fn();
            await TripController.getTripById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Trip not found' });
        });

        it('should return trip by ID', async () => {
            const req = { params: { id: '1' }, query: { user_id: '123' } } as unknown as Request;
            const mockTrip = { id: 1, name: 'Trip' };
            (TripService.getTripById as jest.Mock).mockResolvedValue(mockTrip);
            const next = jest.fn();
            await TripController.getTripById(req, res, next);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTrip });
        });
    });

    describe('updateTrip', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1' }, body: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.updateTrip(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return 404 if trip not found', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
            (TripService.updateTrip as jest.Mock).mockResolvedValue(null);
            const next = jest.fn();
            await TripController.updateTrip(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Trip not found' });
        });

        it('should update and return trip', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123', name: 'Updated' } } as unknown as Request;
            const mockTrip = { id: 1, name: 'Updated' };
            (TripService.updateTrip as jest.Mock).mockResolvedValue(mockTrip);
            const next = jest.fn();
            await TripController.updateTrip(req, res, next);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockTrip,
                message: 'Trip updated successfully',
            });
        });
    });

    describe('deleteTrip', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1' }, body: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.deleteTrip(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return 404 if trip not found', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
            (TripService.deleteTrip as jest.Mock).mockResolvedValue(false);
            const next = jest.fn();
            await TripController.deleteTrip(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Trip not found' });
        });

        it('should return success message on successful deletion', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
            (TripService.deleteTrip as jest.Mock).mockResolvedValue(true);
            const next = jest.fn();
            await TripController.deleteTrip(req, res, next);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Trip deleted successfully',
            });
        });
    });

    describe('inviteParticipants', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1' }, body: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.inviteParticipants(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return 400 if user_ids array is missing or empty', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123', user_ids: [] } } as unknown as Request;
            const next = jest.fn();
            await TripController.inviteParticipants(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'user_ids array is required and cannot be empty' });
        });

        it('should invite participants', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123', user_ids: ['2', '3'] } } as unknown as Request;
            (TripService.inviteParticipants as jest.Mock).mockResolvedValue(undefined);
            const next = jest.fn();
            await TripController.inviteParticipants(req, res, next);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Participants invited successfully',
            });
        });
    });

    describe('updateParticipantStatus', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1' }, body: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.updateParticipantStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return 400 if status is invalid', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123', status: 'invalid' } } as unknown as Request;
            const next = jest.fn();
            await TripController.updateParticipantStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Valid status (joined or declined) is required' });
        });

        it('should return 404 if invitation not found', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123', status: 'joined' } } as unknown as Request;
            (TripService.updateParticipantStatus as jest.Mock).mockResolvedValue(false);
            const next = jest.fn();
            await TripController.updateParticipantStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Trip invitation not found' });
        });

        it('should update participant status', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123', status: 'joined' } } as unknown as Request;
            (TripService.updateParticipantStatus as jest.Mock).mockResolvedValue(true);
            const next = jest.fn();
            await TripController.updateParticipantStatus(req, res, next);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Trip invitation joined successfully',
            });
        });
    });

    describe('leaveTrip', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1' }, body: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.leaveTrip(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return 404 if trip not found or user not a participant', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
            (TripService.leaveTrip as jest.Mock).mockResolvedValue(false);
            const next = jest.fn();
            await TripController.leaveTrip(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Trip not found or user not a participant' });
        });

        it('should leave trip successfully', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123' } } as unknown as Request;
            (TripService.leaveTrip as jest.Mock).mockResolvedValue(true);
            const next = jest.fn();
            await TripController.leaveTrip(req, res, next);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Left trip successfully',
            });
        });
    });

    describe('removeParticipant', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1', participantId: '2' }, body: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.removeParticipant(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return 404 if participant not found or cannot be removed', async () => {
            const req = { params: { id: '1', participantId: '2' }, body: { user_id: '123' } } as unknown as Request;
            (TripService.removeParticipant as jest.Mock).mockResolvedValue(false);
            const next = jest.fn();
            await TripController.removeParticipant(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Participant not found or cannot be removed' });
        });

        it('should remove participant successfully', async () => {
            const req = { params: { id: '1', participantId: '2' }, body: { user_id: '123' } } as unknown as Request;
            (TripService.removeParticipant as jest.Mock).mockResolvedValue(true);
            const next = jest.fn();
            await TripController.removeParticipant(req, res, next);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Participant removed successfully',
            });
        });
    });

    describe('sendMessage', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1' }, body: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.sendMessage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return 400 if message content is missing', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123', message: '' } } as unknown as Request;
            const next = jest.fn();
            await TripController.sendMessage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Message content is required' });
        });

        it('should send message successfully', async () => {
            const req = { params: { id: '1' }, body: { user_id: '123', message: 'Hello' } } as unknown as Request;
            const mockMessage = { id: 1, message: 'Hello' };
            (TripService.sendMessage as jest.Mock).mockResolvedValue(mockMessage);
            const next = jest.fn();
            await TripController.sendMessage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockMessage,
                message: 'Message sent successfully',
            });
        });
    });

    describe('getTripMessages', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1' }, query: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.getTripMessages(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return trip messages', async () => {
            const req = { params: { id: '1' }, query: { user_id: '123', page: '1', limit: '50' } } as unknown as Request;
            const mockMessages = [{ id: 1, message: 'Hello' }];
            (TripService.getTripMessages as jest.Mock).mockResolvedValue(mockMessages);
            const next = jest.fn();
            await TripController.getTripMessages(req, res, next);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockMessages });
        });
    });

    describe('getUserInvites', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { query: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.getUserInvites(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return user invites', async () => {
            const req = { query: { user_id: '123' } } as unknown as Request;
            const mockInvites = [{ id: 1, trip: 'Trip' }];
            (TripService.getUserInvites as jest.Mock).mockResolvedValue(mockInvites);
            const next = jest.fn();
            await TripController.getUserInvites(req, res, next);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockInvites });
        });
    });

    describe('getTripParticipants', () => {
        it('should return 401 if user not authenticated', async () => {
            const req = { params: { id: '1' }, query: {} } as unknown as Request;
            const next = jest.fn();
            await TripController.getTripParticipants(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not authenticated' });
        });

        it('should return trip participants', async () => {
            const req = { params: { id: '1' }, query: { user_id: '123' } } as unknown as Request;
            const mockParticipants = [{ id: 1, name: 'User' }];
            (TripService.getTripParticipants as jest.Mock).mockResolvedValue(mockParticipants);
            const next = jest.fn();
            await TripController.getTripParticipants(req, res, next);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockParticipants });
        });
    });
});