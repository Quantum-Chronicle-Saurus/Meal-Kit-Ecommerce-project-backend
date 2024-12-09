import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

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

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      longDescription,
      price,
      category,
      categoryGroup,
      ingredients,
      grossWeight,
      nutrition,
    } = req.body;

    // ตรวจสอบว่า product มีชื่อซ้ำหรือไม่
    const exists = await productModel.findOne({ name });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Menu's name already exists" });
    }

    // Increment _id using MongoDB update operation
    const lastProduct = await productModel.findOne().sort({ _id: -1 }); //หา _id ก่อนหน้า
    const nextId = lastProduct ? lastProduct._id + 1 : 1; // ถ้าเจอ lastproduct ให้เอา lastProduct._id +1 เพื่อแทนค่าตัวล่าสุด

    // ตรวจสอบว่า image ถูกส่งมาหรือไม่
    const uploadedImage = req.files?.image || [];
    if (uploadedImage.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    // อัปโหลด image ไปยัง Cloudinary
    const imagesUrl = await Promise.all(
      uploadedImage.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // เตรียมข้อมูล product
    const productData = {
      _id: nextId,
      name,
      description,
      longDescription,
      price: Number(price),
      category,
      categoryGroup,
      ingredients,
      grossWeight,
      image: imagesUrl, // URL ที่ได้จาก Cloudinary
      nutrition,
      date: Date.now(),
    };

    // บันทึก product ลง MongoDB
    const product = new productModel(productData);
    await product.save();

    res.status(200).json({ success: true, message: "Product added", product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// function for list product
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function for updating a product in the database
const updateProduct = async (req, res) => {
  try {
    // แปลง ID จาก string เป็น number
    const id = parseInt(req.params.id, 10); // แปลงเป็น Number (ฐาน 10)

    // ข้อมูลที่ต้องการอัปเดต
    const {
      name,
      description,
      longDescription,
      price,
      category,
      categoryGroup,
      ingredients,
      grossWeight,
      nutrition,
    } = req.body;

    // สร้าง object สำหรับข้อมูลใหม่
    const updatedData = {
      name,
      description,
      longDescription,
      price,
      category,
      categoryGroup,
      ingredients,
      grossWeight,
      nutrition,
    };

    // ค้นหาและอัปเดตสินค้าในฐานข้อมูล
    const updateProduct = await productModel.findByIdAndUpdate(
      id, // ID ที่ถูกแปลงเป็นตัวเลข
      updatedData, // ข้อมูลใหม่
      { new: true } // ส่งคืนเอกสารที่อัปเดต
    );

    // หากไม่พบสินค้า ส่ง 404
    if (!updateProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // ส่งคืนข้อมูลสินค้าที่อัปเดต
    res.status(200).json({ success: true, updateProduct });
  } catch (error) {
    // ส่งข้อผิดพลาดในกรณีล้มเหลว
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to remove a product from the database
const removeProduct = async (req, res) => {
  try {
    // ดึง ID จาก req.params
    const id = parseInt(req.params.id, 10);

    // ตรวจสอบว่า ID เป็นตัวเลขที่ถูกต้อง
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID" });
    }

    // ลบสินค้าโดยใช้ ID
    const deletedProduct = await productModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  getProduct,
  getProductId,
  addProduct,
  listProducts,
  updateProduct,
  removeProduct,
  singleProduct,
};
