import express from "express";
import upload from "../middlewares/upload.js";
import adminAuth from "../middlewares/adminAuth.js";
import {
  getProduct,
  getProductId,
  addProduct,
  removeProduct,
  singleProduct,
  listProducts,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getProduct);
productRouter.get("/:id", getProductId);

productRouter.post(
  "/add",
  adminAuth,
  upload.fields([{ name: "image", maxCount: 1 }]),
  addProduct
);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);

export default productRouter;
