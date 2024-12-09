import express from "express";
import validateRegisterInput from "../middlewares/validateRegister.js";
import validateLoginInput from "../middlewares/validateLogin.js";
import adminLoginLimiter from "../middlewares/adminLoginLimiter.js";

import {
  getUser,
  registerUser,
  loginUser,
  adminLogin,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", getUser);
userRouter.post("/register", validateRegisterInput, registerUser);
userRouter.post("/login", validateLoginInput, loginUser);

// Admin Login Route
userRouter.post("/admin", adminLoginLimiter, adminLogin);

export default userRouter;
