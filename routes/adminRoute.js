import express from "express";
import adminLoginLimiter from "../middlewares/adminLoginLimiter.js";
import authAdmin from "../middlewares/adminAuth.js";
import { adminLogin } from "../controllers/userController.js";

const adminRouter = express.Router();

// Admin Login Route (ไม่ต้องใช้ authAdmin เพราะเป็นจุดเริ่มต้น)
adminRouter.post("/login", adminLoginLimiter, adminLogin);

// Protected Routes (ใช้ authAdmin เพื่อป้องกัน resource)
adminRouter.get("/dashboard", authAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the admin dashboard",
  });
});

export default adminRouter;
