const jwt = require('jsonwebtoken');

// Middleware ตรวจสอบ JWT Token
exports.protect = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    // ตรวจสอบว่ามี Token ถูกส่งมาหรือไม่
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // ตรวจสอบและถอดรหัส Token
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);

    // เพิ่มข้อมูลผู้ใช้ที่ถอดรหัสได้ลงใน `req`
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
