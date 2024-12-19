const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getPendingSheets, updateSheetStatus, getAllTransactions, getAdminDashboard, getPendingSlips, updateSlipStatus, confirmPaymentManual} = require('../controllers/adminController');

// ดึงรายการชีทที่รอตรวจสอบ
router.get('/review-sheets', protect, getPendingSheets);

// อัปเดตสถานะชีท
router.put('/review-sheets/:id', protect, updateSheetStatus);

// ดูประวัติการชำระเงินทั้งหมด
router.get('/transactions', protect, getAllTransactions);

// ดึงข้อมูลแดชบอร์ดสำหรับ Admin
router.get('/dashboard', protect, getAdminDashboard);

// ดึงรายการสลิปที่รอการตรวจสอบ
router.get('/slips', protect, getPendingSlips);

// อัปเดตสถานะสลิป
router.put('/slips/:id', protect, updateSlipStatus);

// ยืนยันการชำระเงินแบบ Manual
router.post('/payments/confirm', protect, confirmPaymentManual);

module.exports = router;
