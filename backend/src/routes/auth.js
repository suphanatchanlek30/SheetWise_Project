const express = require('express');
const router = express.Router();
const { register, login, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// เส้นทางสำหรับ Register
router.post('/register', register);

// เส้นทางสำหรับ Login
router.post('/login', login);

// เส้นทางสำหรับดึงข้อมูลโปรไฟล์ผู้ใช้
router.get('/profile', protect, (req, res) => {
    res.status(200).json({
      message: 'User profile fetched successfully',
      user: req.user, // ข้อมูลที่ถูกถอดรหัสจาก JWT
    });
});

// เส้นทางสำหรับ Logout
router.post('/logout', logout);

// เส้นทางสำหรับรีเซ็ตรหัสผ่าน
router.post('/forgot-password', forgotPassword);

// เส้นทางสำหรับรีเซ็ตรหัสผ่าน
router.post('/reset-password', resetPassword);

module.exports = router;
