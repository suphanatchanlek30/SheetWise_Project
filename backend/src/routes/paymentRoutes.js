const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { generateQRCode, upload, uploadPaymentSlip } = require('../controllers/paymentController');

// สร้าง QR Code สำหรับการชำระเงิน
router.post('/qr', protect, generateQRCode);

// อัปโหลดสลิปการโอนเงิน
router.post('/upload', protect, upload, uploadPaymentSlip);

module.exports = router;
