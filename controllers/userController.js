import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Callback function for /register path
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Checking user already exists or not (with email)
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "User account created" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Callback function for /login path
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ตรวจสอบว่ามีผู้ใช้งานหรือไม่
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // ตรวจสอบความถูกต้องของรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // สร้าง JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // ส่ง Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Callback function for /admin path
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ตรวจสอบว่า ADMIN_EMAIL และ ADMIN_PASSWORD ถูกตั้งค่าใน .env
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error(
        "Admin credentials are not set in the environment variables"
      );
    }

    // ตรวจสอบ email และ password
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: "admin", email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Token หมดอายุใน 1 ชั่วโมง
      );

      res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { registerUser, loginUser, adminLogin };
