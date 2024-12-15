const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

// โหลดตัวแปรแวดล้อมจาก .env
dotenv.config();

const app = express();

// ใช้งาน Middleware
app.use(cors()); // อนุญาตการเชื่อมต่อจาก Frontend
app.use(bodyParser.json()); // แปลงข้อมูล JSON ที่ส่งมาจาก Client

// Routes
app.use('/api/auth', authRoutes);

// เส้นทางพื้นฐาน
app.get('/', (req, res) => {
    res.send('Welcome to SheetWise Backend!');
});

module.exports = app;
