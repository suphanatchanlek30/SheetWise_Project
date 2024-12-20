const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getSheetSalesAnalytics } = require('../controllers/analyticsController');

// เส้นทางสำหรับดึงยอดขายชีททั้งหมดและยอดขายรวม
router.get('/sheets/sales', protect, getSheetSalesAnalytics);

module.exports = router;
