const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getPendingSheets, updateSheetStatus, getAllTransactions } = require('../controllers/adminController');

// ดึงรายการชีทที่รอตรวจสอบ
router.get('/review-sheets', protect, getPendingSheets);

// อัปเดตสถานะชีท
router.put('/review-sheets/:id', protect, updateSheetStatus);

// ดูประวัติการชำระเงินทั้งหมด
router.get('/transactions', protect, getAllTransactions);

module.exports = router;
