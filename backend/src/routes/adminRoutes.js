const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getPendingSheets } = require('../controllers/adminController');

// ดึงรายการชีทที่รอตรวจสอบ
router.get('/review-sheets', protect, getPendingSheets);

module.exports = router;
