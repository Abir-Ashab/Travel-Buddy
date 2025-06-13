import config from "../config";
import { catchAsync } from "../utils/catchAsync";
import { AuthServices } from "../services/auth.service";

const register = catchAsync(async (req, res) => {
<<<<<<< HEAD
  console.log("body", req.body);
  const result = await AuthServices.register(req.body);
=======
  const result = await AuthServices.register(req.body);

>>>>>>> b19da4c5f0fa77853257d8697e886f75cbf191af
  res.status(200).json({
    success: true,
    message: "User registered successfully!",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = await AuthServices.login(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "User logged in successfully!",
    data: {
      accessToken,
    },
  });
});

export const authControllers = {
  register,
  login,
};
