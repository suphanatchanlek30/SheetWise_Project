const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');

// เส้นทางสำหรับ Register
router.post('/register', register);

module.exports = router;
