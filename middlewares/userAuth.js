import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    // ตรวจสอบว่า header Authorization มีค่าหรือไม่
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing or invalid",
      });
    }

    // ดึง token ออกจาก Authorization header
    const token = authHeader.split(" ")[1];

    // ตรวจสอบว่า JWT_SECRET ถูกตั้งค่าไว้หรือไม่
    if (!process.env.JWT_SECRET) {
      throw new Error("Server configuration error: JWT_SECRET is missing");
    }

    // ตรวจสอบและถอดรหัส token
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(token_decode);
    // เพิ่มข้อมูลผู้ใช้ใน request object
    req.user = { id: token_decode._id };

    next();
  } catch (error) {
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
    console.error("Authentication error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default authUser;
