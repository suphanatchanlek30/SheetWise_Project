const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crypto = require('crypto');

exports.register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือยัง
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
  
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
  
      // แฮชรหัสผ่าน
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // สร้างผู้ใช้ใหม่
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
  
      // ส่ง Response สำเร็จ
      res.status(201).json({
        message: "User registered successfully",
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      });
    } catch (error) {
      console.error("Error in register:", error);
  
      res.status(500).json({
        message: "Something went wrong",
        error: error.message || "Unknown error occurred",
      });
    }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // ตรวจสอบว่ามีผู้ใช้อยู่หรือไม่
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // ตรวจสอบรหัสผ่าน
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // สร้าง JWT Token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );      
  
      // ส่ง Token กลับไปยังผู้ใช้
      res.status(200).json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};

exports.logout = (req, res) => {
    try {
      // ลบ Token ในฝั่ง Client (Frontend จะจัดการ)
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};
  
exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // ค้นหาผู้ใช้ในระบบ
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // สร้าง Token สำหรับรีเซ็ตรหัสผ่าน
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  
      // อัปเดต Token ลงในฐานข้อมูล
      await prisma.user.update({
        where: { email },
        data: {
          resetToken: resetTokenHash,
          resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000), // Token มีอายุ 10 นาที
        },
      });
  
      // ส่งอีเมล (จำลอง)
      console.log(`Password reset link: http://localhost:3000/reset-password?token=${resetToken}`);
  
      res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};

exports.resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
  
      // แปลง Token เป็น Hash
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
      // ค้นหาผู้ใช้ด้วย Token และตรวจสอบว่า Token ยังไม่หมดอายุ
      const user = await prisma.user.findFirst({
        where: {
          resetToken: resetTokenHash,
          resetTokenExpires: {
            gt: new Date(), // Token ต้องยังไม่หมดอายุ
          },
        },
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      // เข้ารหัสรหัสผ่านใหม่
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // อัปเดตรหัสผ่านและลบ Token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        },
      });
  
      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};
  