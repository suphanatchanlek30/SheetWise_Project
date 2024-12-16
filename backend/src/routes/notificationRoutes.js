const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getNotifications, createNotification, markNotificationAsRead } = require('../controllers/notificationController');

// ดึงรายการแจ้งเตือนของผู้ใช้
router.get('/', protect, getNotifications);

// สร้างการแจ้งเตือนใหม่
router.post('/', protect, createNotification);

// อัปเดตสถานะแจ้งเตือนเป็น "อ่านแล้ว"
router.put('/:id', protect, markNotificationAsRead);

module.exports = router;
