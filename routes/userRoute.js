import express from "express";
import validateRegisterInput from "../middlewares/validateRegister.js";
import validateLoginInput from "../middlewares/validateLogin.js";
import adminLoginLimiter from "../middlewares/adminLoginLimiter.js";
import authAdmin from "../middlewares/adminAuth.js";
import authUser from "../middlewares/userAuth.js";
import {
  registerUser,
  loginUser,
  adminLogin,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", validateRegisterInput, registerUser);
userRouter.post("/login", validateLoginInput, authUser, loginUser);
userRouter.post("/admin", adminLoginLimiter, authAdmin, adminLogin);

export default userRouter;
