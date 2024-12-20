const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getSheetSalesAnalytics, getPopularSheets } = require('../controllers/analyticsController');

// เส้นทางสำหรับดึงยอดขายชีททั้งหมดและยอดขายรวม
router.get('/sheets/sales', protect, getSheetSalesAnalytics);

// เส้นทางสำหรับดึงชีทขายดี 5 อันดับแรก
router.get('/sheets/popular', protect, getPopularSheets);

module.exports = router;
