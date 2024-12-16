const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ดึงรายการแจ้งเตือนของผู้ใช้ปัจจุบัน
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId; // รับ userId จาก JWT

    // ค้นหารายการแจ้งเตือนของผู้ใช้
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // เรียงจากล่าสุดไปหาเก่าสุด
    });

    // ส่งรายการแจ้งเตือนกลับไป
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
