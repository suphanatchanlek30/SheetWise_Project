const express = require('express');
const router = express.Router();
const { uploadSheet, getPendingSheets, updateSheetStatus, getApprovedSheets, getSheetById  } = require('../controllers/sheetController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

// เส้นทางสำหรับอัปโหลดชีท
router.post('/upload', protect, uploadSheet);

// เส้นทางสำหรับดึงรายการชีทที่ pending
router.get('/pending', protect, isAdmin, getPendingSheets);

// เส้นทางสำหรับอนุมัติหรือปฏิเสธชีท
router.put('/:id/status', protect, isAdmin, updateSheetStatus);

// ดึงรายการชีททั้งหมดที่มีสถานะ approved
router.get('/', getApprovedSheets);

// ดึงชีทตาม id
router.get('/:id', getSheetById);


module.exports = router;
