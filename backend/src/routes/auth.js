const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// เส้นทางสำหรับ Register
router.post('/register', register);

// เส้นทางสำหรับ Login
router.post('/login', login);

module.exports = router;
