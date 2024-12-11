import express from "express";
import validateRegisterInput from "../middlewares/validateRegister.js";
import validateLoginInput from "../middlewares/validateLogin.js";

import {
  getUser,
  registerUser,
  loginUser,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", getUser);
userRouter.post("/register", validateRegisterInput, registerUser);
userRouter.post("/login", validateLoginInput, loginUser);

export default userRouter;
