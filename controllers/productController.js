import productModel from "../models/productModel.js";
import mongoose from "mongoose";

// Get all products with optional pagination
const getProduct = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    const productData = await productModel
      .find({})
      .limit(Number(limit))
      .skip(Number(skip));

    res.status(200).json({
      success: true,
      count: productData.length,
      data: productData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a single product by ID
const getProductId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const productData = await productModel.findById(id);
    if (!productData) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: productData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getProduct, getProductId };
