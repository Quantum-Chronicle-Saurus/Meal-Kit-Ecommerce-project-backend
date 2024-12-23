import mongoose from "mongoose";

/* This code snippet is defining a Mongoose schema for an order in a MongoDB database. */
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  totalPrice: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: "Order Placed" },
  paymentMethod: { type: String, required: true },
  name: { type: String, required: true }, //
  date: { type: Date, required: true },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
