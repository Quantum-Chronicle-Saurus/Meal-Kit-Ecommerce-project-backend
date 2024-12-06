import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
  try {
    // ตรวจสอบว่า header Authorization มีค่า
    const authHeader = req.headers.authorization;

    // เขียนแบบนี้ก็ได้
    // const authHeader = req.headers["authorization"];
    // authHeader = bearer $2askjdfjkljalsdkjf....

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing or invalid",
      });
    }

    // ดึง token ออกจาก Authorization header
    const token = authHeader.split(" ")[1];

    // ตรวจสอบและถอดรหัส token
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // ตรวจสอบว่า token นี้เป็นของ admin
    if (
      token_decode.role !== "admin" ||
      token_decode.email !== process.env.ADMIN_EMAIL
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    // ให้ผ่านไปยังฟังก์ชันถัดไป
    next();
  } catch (error) {
    console.error(error);

    // ตรวจสอบข้อผิดพลาดของ JWT
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // ข้อผิดพลาดอื่นๆ
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default authAdmin;
