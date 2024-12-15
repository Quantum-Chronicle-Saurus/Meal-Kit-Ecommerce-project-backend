import express from "express";
import authAdmin from "../middlewares/adminAuth.js";
import authUser from "../middlewares/userAuth.js";
import {
  verifyStripe,
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  insertOrders,
  getOrders,
  getUserOrders,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Admin
orderRouter.get("/list", authAdmin, allOrders); //api ดึงข้อมูลทั้งหมดของลูกค้า
orderRouter.post("/status", authAdmin, updateStatus);

// Payment
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);

// user
orderRouter.post("/insertOrders", authUser, insertOrders); //api เส้นนี้ไว้เก็บข้อมูลตะกร้าสินค้า ข้อมูล user และข้อมูลการจัดส่ง
orderRouter.post("/userOrder", authUser, getOrders); //api โชว์ current order
orderRouter.post("/listOrders", authUser, getUserOrders); //api โชว์ orders ของ user ทั้งหมด

orderRouter.post("/userorders", authUser, userOrders);

//verify Payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);

export default orderRouter;
