const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { confirmPayment } = require('../controllers/orderController');

// ยืนยันการชำระเงิน
router.put('/:id/confirm', protect, confirmPayment);

module.exports = router;
