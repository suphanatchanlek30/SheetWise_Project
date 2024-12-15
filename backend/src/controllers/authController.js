const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ตรวจสอบว่ามีผู้ใช้งานอยู่แล้วหรือไม่
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // เข้ารหัสรหัสผ่าน (Hash Password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกผู้ใช้ลงในฐานข้อมูล
    const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
    });
      

    // สร้าง JWT Token
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, 'secret_key', {
      expiresIn: '24h',
    });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
