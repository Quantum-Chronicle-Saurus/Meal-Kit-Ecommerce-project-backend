import productModel from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";

// Get all products with optional pagination
const getProduct = async (req, res) => {
  try {
    // console.log("list product");
    const products = await productModel.find({});

    if (!products.length) {
      // กรณีไม่มีสินค้า
      return res.status(200).json({
        success: true,
        message: "No products found",
        products: [],
      });
    }

    // กรณีดึงสินค้าสำเร็จ
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    // ส่งข้อความผิดพลาดทั่วไป
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
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
      size,
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
    const lastProduct = await productModel.findOne().sort({ _id: -1 });
    const nextId = lastProduct ? lastProduct._id + 1 : 1;

    // ตรวจสอบว่า image ถูกส่งมาหรือไม่
    const uploadedImage = req.files?.image || [];
    if (uploadedImage.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    // อัปโหลด image ไปยัง Cloudinary และเก็บ public_id
    const images = await Promise.all(
      uploadedImage.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return { url: result.secure_url, publicId: result.public_id };
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
      size,
      image: images.map((img) => img.url), // เก็บเฉพาะ URL ของรูปภาพ
      imagePublicId: images.map((img) => img.publicId), // เก็บ public_id
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

// Function for updating a product in the database
const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10); // แปลง ID จาก params

    // ข้อมูลที่ต้องการอัปเดต
    const { name, price, category, categoryGroup } = req.body;
    console.log(req.body);
    console.log(id);
    // ตรวจสอบการแปลงราคาให้เป็นตัวเลขที่ถูกต้อง
    const priceValue = Number(price);
    if (isNaN(priceValue)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid price value" });
    }

    // ตรวจสอบว่ามีการอัปโหลดรูปภาพใหม่หรือไม่
    const uploadedImage = req.files?.image || [];
    const updatedData = {
      name,
      price: priceValue,
      category,
      categoryGroup,
    };

    // ดึงข้อมูลสินค้าเดิม
    const existingProduct = await productModel.findById(id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // หากมีรูปภาพใหม่ ให้ลบรูปเก่าออกจาก Cloudinary และอัปเดตรูปใหม่
    if (uploadedImage.length > 0) {
      // ลบรูปภาพเก่าออกจาก Cloudinary
      await Promise.all(
        existingProduct.imagePublicId.map(async (publicId) => {
          await cloudinary.uploader.destroy(publicId);
        })
      );

      // อัปโหลดรูปภาพใหม่ไปยัง Cloudinary
      const imagesUrl = await Promise.all(
        uploadedImage.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return {
            url: result.secure_url,
            publicId: result.public_id,
          };
        })
      );

      // อัปเดตข้อมูลรูปภาพใหม่
      updatedData.image = imagesUrl.map((img) => img.url);
      updatedData.imagePublicId = imagesUrl.map((img) => img.publicId);
    } else {
      // หากไม่มีการอัปโหลดรูปภาพใหม่ ให้เก็บรูปภาพเดิมไว้
      updatedData.image = existingProduct.image;
      updatedData.imagePublicId = existingProduct.imagePublicId;
    }

    // ค้นหาและอัปเดตสินค้าในฐานข้อมูล
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to remove a product from the database
const removeProduct = async (req, res) => {
  try {
    const id = req.params.id;

    // ค้นหาสินค้าที่จะลบ
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ลบรูปภาพใน Cloudinary
    const imagePublicIds = product.imagePublicId || [];
    for (const publicId of imagePublicIds) {
      await cloudinary.uploader.destroy(publicId);
    }

    // ลบสินค้าจากฐานข้อมูล
    await productModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// function for single product info
const singleProduct = async (req, res) => {
  try {
    const { _id } = req.body;
    const product = await productModel.findById(_id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getProduct, addProduct, updateProduct, removeProduct, singleProduct };
