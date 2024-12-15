const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getUserProfile } = require('../controllers/userController');

// ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน
router.get('/profile', protect, getUserProfile);

module.exports = router;
