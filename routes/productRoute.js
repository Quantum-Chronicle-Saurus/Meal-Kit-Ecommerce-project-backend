import express from "express";
import upload from "../middlewares/upload.js";
import adminAuth from "../middlewares/adminAuth.js";
import {
  getProduct,
  addProduct,
  removeProduct,
  updateProduct,
  singleProduct,
} from "../controllers/productController.js";

const productRouter = express.Router();

// Fetch all products
productRouter.get("/", getProduct);

// Add a new product (requires admin authentication and image upload)
productRouter.post(
  "/add",
  adminAuth,
  upload.fields([{ name: "image", maxCount: 1 }]),
  addProduct
);

// Remove a product (use DELETE method, pass ID in URL)
productRouter.delete("/:id", adminAuth, removeProduct);

// Fetch single product details
productRouter.post("/single", singleProduct);

// Update a product (requires admin authentication, ID passed in URL)
productRouter.put("/:id", adminAuth, updateProduct);

export default productRouter;
