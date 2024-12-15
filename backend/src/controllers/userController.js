const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // รับ userId จาก JWT ที่ถอดรหัสผ่าน Middleware

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true }, // เลือกเฉพาะฟิลด์ที่ต้องการ
    });

    // ตรวจสอบว่าพบผู้ใช้หรือไม่
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ส่งข้อมูลผู้ใช้กลับไป
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
