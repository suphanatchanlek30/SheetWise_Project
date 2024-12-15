const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { confirmPayment, downloadSheet, getOrders, getOrderById, createOrder } = require('../controllers/orderController');

// ยืนยันการชำระเงิน
router.put('/:id/confirm', protect, confirmPayment);

// เส้นทางสำหรับดาวน์โหลดชีท (ต้องล็อกอินและมีคำสั่งซื้อที่ชำระเงินแล้ว)
router.get('/:id/download', protect, downloadSheet);

// ดึงประวัติคำสั่งซื้อทั้งหมดของผู้ใช้
router.get('/', protect, getOrders);

// ดูรายละเอียดคำสั่งซื้อเฉพาะ
router.get('/:id', protect, getOrderById);

// สร้างคำสั่งซื้อใหม่
router.post('/', protect, createOrder);


module.exports = router;
