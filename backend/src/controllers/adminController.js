const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ดึงรายการชีทที่รอตรวจสอบ
exports.getPendingSheets = async (req, res) => {
  try {
    // ตรวจสอบว่า user ที่ร้องขอเป็น Admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // ค้นหาชีทที่มีสถานะเป็น pending
    const pendingSheets = await prisma.sheet.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' }, // เรียงลำดับจากใหม่ไปเก่า
    });

    // ส่งรายการชีทกลับไป
    res.status(200).json({ sheets: pendingSheets });
  } catch (error) {
    console.error('Error in getPendingSheets:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
