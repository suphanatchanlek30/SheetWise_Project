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

// อัปเดตสถานะชีท
exports.updateSheetStatus = async (req, res) => {
    try {
      const { id } = req.params; // รับ ID ของชีทจาก URL
      const { status } = req.body; // รับสถานะใหม่จาก Body
  
      // ตรวจสอบว่าเป็น Admin หรือไม่
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
      }
  
      // ตรวจสอบว่าสถานะที่ส่งมาถูกต้องหรือไม่
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Allowed values: approved, rejected' });
      }
  
      // ค้นหาชีทที่ต้องการอัปเดต
      const sheet = await prisma.sheet.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!sheet) {
        return res.status(404).json({ message: 'Sheet not found' });
      }
  
      // อัปเดตสถานะชีท
      const updatedSheet = await prisma.sheet.update({
        where: { id: parseInt(id) },
        data: { status },
      });
  
      // แจ้งเตือนผู้ใช้เมื่อสถานะเปลี่ยน
      await prisma.notification.create({
        data: {
          userId: updatedSheet.userId,
          message: `Your sheet "${updatedSheet.title}" has been ${status}.`,
        },
      });
  
      res.status(200).json({
        message: `Sheet status updated to ${status}`,
        sheet: updatedSheet,
      });
    } catch (error) {
      console.error('Error in updateSheetStatus:', error);
      res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};