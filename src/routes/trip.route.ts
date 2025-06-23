import { Router } from 'express';
import { TripController } from "../controllers/trip.controller";

const router = Router();

router.post('/', TripController.createTrip);
router.get('/my-trips', TripController.getUserTrips);
router.get('/invites', TripController.getUserInvites);
router.get('/:id', TripController.getTripById);
router.put('/:id', TripController.updateTrip);
router.delete('/:id', TripController.deleteTrip);

router.post('/:id/invite', TripController.inviteParticipants);
router.put('/:id/status', TripController.updateParticipantStatus);
router.delete('/:id/leave', TripController.leaveTrip);
router.delete('/:id/participants/:participantId', TripController.removeParticipant);
router.get('/:id/participants', TripController.getTripParticipants);

router.post('/:id/messages', TripController.sendMessage);
router.get('/:id/messages', TripController.getTripMessages);

export { router as tripRoutes };
