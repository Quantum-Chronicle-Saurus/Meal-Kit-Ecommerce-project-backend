import express from "express";

const orderRouter = express.Router();

// Admin
orderRouter.post("/list", adminAuth, allOrder);
orderRouter.post("/status", adminAuth, updateStatus);

// Payment
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);

// user
orderRouter.post("/userorders", authUser, userOrders);

//verify Payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);

export default orderRouter;
