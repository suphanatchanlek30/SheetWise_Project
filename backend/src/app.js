const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const sheetRoutes = require('./routes/sheetRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fileRoutes = require('./routes/fileRoutes');

// โหลดตัวแปรแวดล้อมจาก .env
dotenv.config();

const app = express();

// ใช้งาน Middleware
app.use(cors()); // อนุญาตการเชื่อมต่อจาก Frontend
app.use(bodyParser.json()); // แปลงข้อมูล JSON ที่ส่งมาจาก Client

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sheets', sheetRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/files', fileRoutes);

// เส้นทางพื้นฐาน
app.get('/', (req, res) => {
    res.send('Welcome to SheetWise Backend!');
});

module.exports = app;
