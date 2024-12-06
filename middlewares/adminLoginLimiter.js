import rateLimit from "express-rate-limit";

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 5, // อนุญาตให้พยายามล็อกอินได้สูงสุด 5 ครั้ง
  message: {
    success: false,
    message: "Too many login attempts, please try again later",
  },
});

export default adminLoginLimiter;
