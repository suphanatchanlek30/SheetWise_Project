const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { confirmPayment, downloadSheet } = require('../controllers/orderController');

// ยืนยันการชำระเงิน
router.put('/:id/confirm', protect, confirmPayment);

// เส้นทางสำหรับดาวน์โหลดชีท (ต้องล็อกอินและมีคำสั่งซื้อที่ชำระเงินแล้ว)
router.get('/:id/download', protect, downloadSheet);


module.exports = router;
