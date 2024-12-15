const jwt = require('jsonwebtoken');

// Middleware ตรวจสอบ JWT Token
exports.protect = (req, res, next) => {
    try {
      console.log('Authorization Header:', req.headers.authorization); // เพิ่ม Log เพื่อตรวจสอบ
  
      const token = req.headers.authorization;
  
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }
  
      const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
  
      req.user = decoded;
  
      next();
    } catch (error) {
      console.error('Token verification failed:', error); // Log ข้อผิดพลาด
      res.status(401).json({ message: 'Token is not valid' });
    }
};