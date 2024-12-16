const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getNotifications } = require('../controllers/notificationController');

// ดึงรายการแจ้งเตือนของผู้ใช้
router.get('/', protect, getNotifications);

module.exports = router;
