import { TripService } from "../../src/services/trip.service";
import { tripModel } from "../../src/repositories/trip.repository";
import { 
  CreateTripRequest, 
  UpdateTripRequest, 
  InviteParticipantsRequest, 
  SendMessageRequest, 
  TravelPlan, 
  TravelParticipant, 
  Message, 
  TripListResponse, 
  TripDetailsResponse, 
  InviteResponse 
} from "../../src/interfaces/trip.interface";

jest.mock("../../src/repositories/trip.repository");

const mockUserId = "user-1";
const mockTripId = "trip-1";
const mockTrip: TravelPlan = {
  id: mockTripId,
  creator_id: mockUserId,
  location_id: "loc-1",
  trip_name: "Test Trip",
  start_date: new Date(Date.now() + 86400000),
  end_date: new Date(Date.now() + 2 * 86400000),
  total_budget: 1000,
  status_id: "status-1",
  max_participants: 5,
};
const mockParticipant: TravelParticipant = {
  id: "part-1",
  trip_plan_id: mockTripId,
  user_id: mockUserId,
  role: "creator",
  status: "joined",
};
const mockMessage: Message = {
  id: "msg-1",
  trip_plan_id: mockTripId,
  sender_id: mockUserId,
  message: "Hello",
};
const mockTripListResponse: TripListResponse = {
  trips: [mockTrip],
  total: 1,
  page: 1,
  limit: 10,
};
const mockTripDetails: TripDetailsResponse = {
  ...mockTrip,
  participants: [mockParticipant],
  recent_messages: [mockMessage],
};
const mockInviteResponse: InviteResponse = {
  id: "invite-1",
  trip_name: "Trip",
  creator_name: "Alice",
  location_name: "Paris",
  start_date: new Date(),
  end_date: new Date(),
  status: "invited",
  created_at: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TripService", () => {
  describe("createTrip", () => {
    it("should create a trip successfully", async () => {
      (tripModel.getStatusByName as jest.Mock).mockResolvedValue({ id: "status-1" });
      (tripModel.create as jest.Mock).mockResolvedValue(mockTripId);
      (tripModel.addParticipants as jest.Mock).mockResolvedValue(undefined);
      (tripModel.updateParticipantStatus as jest.Mock).mockResolvedValue(true);
      (tripModel.updateParticipantRole as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);

      const req: CreateTripRequest = {
        location_id: "loc-1",
        trip_name: "Trip",
        start_date: new Date(Date.now() + 86400000).toISOString(),
        end_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        total_budget: 1000,
        max_participants: 5,
      };
      const result = await TripService.createTrip(mockUserId, req);
      expect(result).toEqual(mockTrip);
    });

    it("should throw if start date is not in the future", async () => {
      const req: CreateTripRequest = {
        location_id: "loc-1",
        trip_name: "Trip",
        start_date: new Date(Date.now() - 86400000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        total_budget: 1000,
        max_participants: 5,
      };
      await expect(TripService.createTrip(mockUserId, req)).rejects.toThrow("Start date must be in the future");
    });

    it("should throw if end date is before start date", async () => {
      const req: CreateTripRequest = {
        location_id: "loc-1",
        trip_name: "Trip",
        start_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        total_budget: 1000,
        max_participants: 5,
      };
      await expect(TripService.createTrip(mockUserId, req)).rejects.toThrow("End date must be after start date");
    });

    it("should throw if total budget is not positive", async () => {
      const req: CreateTripRequest = {
        location_id: "loc-1",
        trip_name: "Trip",
        start_date: new Date(Date.now() + 86400000).toISOString(),
        end_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        total_budget: 0,
        max_participants: 5,
      };
      await expect(TripService.createTrip(mockUserId, req)).rejects.toThrow("Total budget must be greater than 0");
    });

    it("should throw if max participants is less than 1", async () => {
      const req: CreateTripRequest = {
        location_id: "loc-1",
        trip_name: "Trip",
        start_date: new Date(Date.now() + 86400000).toISOString(),
        end_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        total_budget: 1000,
        max_participants: 0,
      };
      await expect(TripService.createTrip(mockUserId, req)).rejects.toThrow("Maximum participants must be at least 1");
    });

    it("should throw if planning status not found", async () => {
      (tripModel.getStatusByName as jest.Mock).mockResolvedValue(null);
      const req: CreateTripRequest = {
        location_id: "loc-1",
        trip_name: "Trip",
        start_date: new Date(Date.now() + 86400000).toISOString(),
        end_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        total_budget: 1000,
        max_participants: 5,
      };
      await expect(TripService.createTrip(mockUserId, req)).rejects.toThrow("Planning status not found");
    });
  });

  describe("getUserTrips", () => {
    it("should return user trips", async () => {
      (tripModel.findByUserId as jest.Mock).mockResolvedValue({ trips: [mockTrip], total: 1 });
      const result = await TripService.getUserTrips(mockUserId, 1, 10);
      expect(result).toEqual(mockTripListResponse);
    });
  });

  describe("getTripById", () => {
    it("should return trip details if user is participant", async () => {
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(true);
      (tripModel.getParticipants as jest.Mock).mockResolvedValue([mockParticipant]);
      (tripModel.getMessages as jest.Mock).mockResolvedValue([mockMessage]);
      const result = await TripService.getTripById(mockTripId, mockUserId);
      expect(result).toEqual(mockTripDetails);
    });

    it("should return null if trip not found", async () => {
      (tripModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await TripService.getTripById(mockTripId, mockUserId);
      expect(result).toBeNull();
    });

    it("should throw if user is not a participant", async () => {
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(false);
      await expect(TripService.getTripById(mockTripId, mockUserId)).rejects.toThrow("Unauthorized access to trip");
    });
  });

  describe("updateTrip", () => {
    it("should update trip if user is creator", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      (tripModel.getParticipantCount as jest.Mock).mockResolvedValue(1);
      (tripModel.update as jest.Mock).mockResolvedValue(undefined);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      const req: UpdateTripRequest = { trip_name: "New Name" };
      const result = await TripService.updateTrip(mockTripId, mockUserId, req);
      expect(result).toEqual(mockTrip);
    });

    it("should throw if user is not creator", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(false);
      await expect(TripService.updateTrip(mockTripId, mockUserId, {})).rejects.toThrow("Only trip creator can update trip details");
    });

    it("should throw if end date is before start date", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      const req: UpdateTripRequest = {
        start_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
      };
      await expect(TripService.updateTrip(mockTripId, mockUserId, req)).rejects.toThrow("End date must be after start date");
    });

    it("should throw if total budget is not positive", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      const req: UpdateTripRequest = { total_budget: 0 };
      await expect(TripService.updateTrip(mockTripId, mockUserId, req)).rejects.toThrow("Total budget must be greater than 0");
    });

    it("should throw if max participants is less than 1", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      const req: UpdateTripRequest = { max_participants: 0 };
      await expect(TripService.updateTrip(mockTripId, mockUserId, req)).rejects.toThrow("Maximum participants must be at least 1");
    });

    it("should throw if max participants is less than current count", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      (tripModel.getParticipantCount as jest.Mock).mockResolvedValue(3);
      const req: UpdateTripRequest = { max_participants: 2 };
      await expect(TripService.updateTrip(mockTripId, mockUserId, req)).rejects.toThrow("Cannot reduce max participants below current participant count");
    });

    it("should return null if trip not found", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(null);
      const req: UpdateTripRequest = { trip_name: "New Name" };
      const result = await TripService.updateTrip(mockTripId, mockUserId, req);
      expect(result).toBeNull();
    });
  });

  describe("deleteTrip", () => {
    it("should delete trip if user is creator", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.delete as jest.Mock).mockResolvedValue(true);
      const result = await TripService.deleteTrip(mockTripId, mockUserId);
      expect(result).toBe(true);
    });

    it("should throw if user is not creator", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(false);
      await expect(TripService.deleteTrip(mockTripId, mockUserId)).rejects.toThrow("Only trip creator can delete the trip");
    });
  });

  describe("inviteParticipants", () => {
    it("should invite new participants", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      (tripModel.getParticipantCount as jest.Mock).mockResolvedValue(1);
      (tripModel.getParticipants as jest.Mock).mockResolvedValue([mockParticipant]);
      (tripModel.addParticipants as jest.Mock).mockResolvedValue(undefined);

      const req: InviteParticipantsRequest = { user_ids: ["user-2", "user-3"] };
      await expect(TripService.inviteParticipants(mockTripId, mockUserId, req)).resolves.toBeUndefined();
    });

    it("should throw if not creator", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(false);
      const req: InviteParticipantsRequest = { user_ids: ["user-2"] };
      await expect(TripService.inviteParticipants(mockTripId, mockUserId, req)).rejects.toThrow("Only trip creator can invite participants");
    });

    it("should throw if trip not found", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(null);
      const req: InviteParticipantsRequest = { user_ids: ["user-2"] };
      await expect(TripService.inviteParticipants(mockTripId, mockUserId, req)).rejects.toThrow("Trip not found");
    });

    it("should throw if inviting would exceed max participants", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      (tripModel.getParticipantCount as jest.Mock).mockResolvedValue(5);
      const req: InviteParticipantsRequest = { user_ids: ["user-2"] };
      await expect(TripService.inviteParticipants(mockTripId, mockUserId, req)).rejects.toThrow(/Would exceed maximum participants limit/);
    });

    it("should throw if all users are already participants", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      (tripModel.findById as jest.Mock).mockResolvedValue(mockTrip);
      (tripModel.getParticipantCount as jest.Mock).mockResolvedValue(1);
      (tripModel.getParticipants as jest.Mock).mockResolvedValue([{ ...mockParticipant, user_id: "user-2" }]);
      const req: InviteParticipantsRequest = { user_ids: ["user-2"] };
      await expect(TripService.inviteParticipants(mockTripId, mockUserId, req)).rejects.toThrow("All specified users are already participants");
    });
  });

  describe("updateParticipantStatus", () => {
    it("should update status if user is participant", async () => {
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(true);
      (tripModel.updateParticipantStatus as jest.Mock).mockResolvedValue(true);
      const result = await TripService.updateParticipantStatus(mockTripId, mockUserId, "joined");
      expect(result).toBe(true);
    });

    it("should throw if user is not participant", async () => {
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(false);
      await expect(TripService.updateParticipantStatus(mockTripId, mockUserId, "joined")).rejects.toThrow("User is not invited to this trip");
    });
  });

  describe("leaveTrip", () => {
    it("should allow participant to leave", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(false);
      (tripModel.removeParticipant as jest.Mock).mockResolvedValue(true);
      const result = await TripService.leaveTrip(mockTripId, mockUserId);
      expect(result).toBe(true);
    });

    it("should throw if creator tries to leave", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValue(true);
      await expect(TripService.leaveTrip(mockTripId, mockUserId)).rejects.toThrow("Trip creator cannot leave the trip. Transfer ownership or delete the trip instead.");
    });
  });

  describe("removeParticipant", () => {
    it("should remove participant if creator", async () => {
      (tripModel.isUserCreator as jest.Mock).mockImplementation((tripId, userId) => userId === mockUserId);
      (tripModel.removeParticipant as jest.Mock).mockResolvedValue(true);
      const result = await TripService.removeParticipant(mockTripId, mockUserId, "user-2");
      expect(result).toBe(true);
    });

    it("should throw if not creator", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValueOnce(false);
      await expect(TripService.removeParticipant(mockTripId, mockUserId, "user-2")).rejects.toThrow("Only trip creator can remove participants");
    });

    it("should throw if trying to remove creator", async () => {
      (tripModel.isUserCreator as jest.Mock).mockResolvedValueOnce(true).mockResolvedValueOnce(true);
      await expect(TripService.removeParticipant(mockTripId, mockUserId, mockUserId)).rejects.toThrow("Cannot remove trip creator");
    });
  });

  describe("sendMessage", () => {
    it("should send message if participant", async () => {
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(true);
      (tripModel.createMessage as jest.Mock).mockResolvedValue("msg-1");
      (tripModel.getMessages as jest.Mock).mockResolvedValue([mockMessage]);
      const req: SendMessageRequest = { message: "Hello" };
      const result = await TripService.sendMessage(mockTripId, mockUserId, req);
      expect(result).toEqual(mockMessage);
    });

    it("should throw if not participant", async () => {
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(false);
      const req: SendMessageRequest = { message: "Hello" };
      await expect(TripService.sendMessage(mockTripId, mockUserId, req)).rejects.toThrow("Only trip participants can send messages");
    });

    it("should throw if message is empty", async () => {
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(true);
      const req: SendMessageRequest = { message: "   " };
      await expect(TripService.sendMessage(mockTripId, mockUserId, req)).rejects.toThrow("Message cannot be empty");
    });
  });

  describe("getTripMessages", () => {
    it("should return messages if participant", async () => {
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(true);
      (tripModel.getMessages as jest.Mock).mockResolvedValue([mockMessage]);
      const result = await TripService.getTripMessages(mockTripId, mockUserId, 1, 10);
      expect(result).toEqual([mockMessage]);
    });

    it("should throw if not participant", async () => {
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(false);
      await expect(TripService.getTripMessages(mockTripId, mockUserId, 1, 10)).rejects.toThrow("Only trip participants can view messages");
    });
  });

  describe("getUserInvites", () => {
    it("should return user invites", async () => {
      (tripModel.getUserInvites as jest.Mock).mockResolvedValue([mockInviteResponse]);
      const result = await TripService.getUserInvites(mockUserId);
      expect(result).toEqual([mockInviteResponse]);
    });
  });

  describe("getTripParticipants", () => {
    it("should return participants if user is participant", async () => {
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(true);
      (tripModel.getParticipants as jest.Mock).mockResolvedValue([mockParticipant]);
      const result = await TripService.getTripParticipants(mockTripId, mockUserId);
      expect(result).toEqual([mockParticipant]);
    });

    it("should throw if not participant", async () => {
      (tripModel.isUserParticipant as jest.Mock).mockResolvedValue(false);
      await expect(TripService.getTripParticipants(mockTripId, mockUserId)).rejects.toThrow("Only trip participants can view participant list");
    });
  });
});