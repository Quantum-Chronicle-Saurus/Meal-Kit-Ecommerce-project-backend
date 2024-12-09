import multer from "multer";

// เอาไว้ upload ไฟล์
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname); // กำหนดชื่อไฟล์ที่อัปโหลด
  },
});

// กำหนดให้รองรับฟิลด์ชื่อ "image"
const upload = multer({ storage }); // รับเพียง 1 ไฟล์ที่ชื่อ "image"

export default upload;
