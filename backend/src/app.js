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
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

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
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// เส้นทางพื้นฐาน
app.get('/', (req, res) => {
    res.send('Welcome to SheetWise Backend!');
});

module.exports = app;
