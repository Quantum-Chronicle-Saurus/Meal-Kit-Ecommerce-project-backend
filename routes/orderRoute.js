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
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Admin
orderRouter.post("/list", authAdmin, allOrders);
orderRouter.post("/status", authAdmin, updateStatus);

// Payment
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);

// user
orderRouter.post("/userorders", authUser, userOrders);

//verify Payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);

export default orderRouter;
