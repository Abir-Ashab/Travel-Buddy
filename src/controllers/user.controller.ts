import { catchAsync } from "../utils/catchAsync";
import { UserServices } from "../services/user.services";

const createAdmin = catchAsync(async (req, res) => {
  const result = await UserServices.createAdminIntoDB(req.body);

  res.status(200).json({
    success: true,
    message: "Admin is created successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserServices.updateUser(userId, req.body);

  res.status(200).json({
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

<<<<<<< HEAD
// user profile
const getUserProfile = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserServices.getUserProfile(userId);

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully!",
    data: result,
  });
});

// delete account
const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  await UserServices.deleteUser(userId);

  res.status(204).json({
    success: true,
    message: "User deleted successfully!",
  });
});

// upgrade to traveler
const upgradeToTraveler = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserServices.upgradeToTraveler(userId);

  res.status(200).json({
    success: true,
    message: "User upgraded to traveler successfully!",
    data: result,
  });
});

export const userControllers = {
  createAdmin,
  updateUser,
  getUserProfile,
  deleteUser,
  upgradeToTraveler,
=======
export const userControllers = {
  createAdmin,
  updateUser,
>>>>>>> b19da4c5f0fa77853257d8697e886f75cbf191af
};
