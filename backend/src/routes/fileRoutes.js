const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { downloadFile } = require('../controllers/fileController');

// เส้นทางสำหรับดาวน์โหลดไฟล์ชีท (ตรวจสอบการซื้อและสถานะการชำระเงิน)
router.get('/download/:id', protect, downloadFile);

module.exports = router;
