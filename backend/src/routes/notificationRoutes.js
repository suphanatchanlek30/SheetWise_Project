const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getNotifications, createNotification } = require('../controllers/notificationController');

// ดึงรายการแจ้งเตือนของผู้ใช้
router.get('/', protect, getNotifications);

// สร้างการแจ้งเตือนใหม่
router.post('/', protect, createNotification);

module.exports = router;
