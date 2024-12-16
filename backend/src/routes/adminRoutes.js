const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getPendingSheets, updateSheetStatus  } = require('../controllers/adminController');

// ดึงรายการชีทที่รอตรวจสอบ
router.get('/review-sheets', protect, getPendingSheets);

// อัปเดตสถานะชีท
router.put('/review-sheets/:id', protect, updateSheetStatus);

module.exports = router;
