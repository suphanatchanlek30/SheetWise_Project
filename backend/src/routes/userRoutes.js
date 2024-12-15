const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getUserProfile, updateUserProfile, getAllUsers } = require('../controllers/userController');

// ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน
router.get('/profile', protect, getUserProfile);

// อัปเดตโปรไฟล์
router.put('/profile', protect, updateUserProfile);

// เพิ่มเส้นทางสำหรับการดึงรายชื่อผู้ใช้ทั้งหมด:
router.get('/', protect, getAllUsers);

module.exports = router;
