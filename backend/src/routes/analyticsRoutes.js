const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getSheetSalesAnalytics, getPopularSheets, getUserSummary } = require('../controllers/analyticsController');

// เส้นทางสำหรับดึงยอดขายชีททั้งหมดและยอดขายรวม
router.get('/sheets/sales', protect, getSheetSalesAnalytics);

// เส้นทางสำหรับดึงชีทขายดี 5 อันดับแรก
router.get('/sheets/popular', protect, getPopularSheets);

// เส้นทางสำหรับดึงข้อมูลสรุปผู้ใช้งาน
router.get('/users/summary', protect, getUserSummary);

module.exports = router;
