import express from "express";
import { getProduct, getProductId } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getProduct);
productRouter.get("/:id", getProductId);

// productRouter.post(
//   "/add",
//   adminAuth,
//   upload.fields([{ name: "image1", maxCount: 1 }]),
//   addProduct
// );
// productRouter.post("/remove", adminAuth, removeProduct);
// productRouter.post("/single", singleProduct);
// productRouter.get("/list", listProducts);

export default productRouter;
