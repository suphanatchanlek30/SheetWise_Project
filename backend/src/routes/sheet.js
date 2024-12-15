const express = require('express');
const router = express.Router();
const { uploadSheet } = require('../controllers/sheetController');
const { protect } = require('../middlewares/authMiddleware');

// เส้นทางสำหรับอัปโหลดชีท
router.post('/upload', protect, uploadSheet);

module.exports = router;
