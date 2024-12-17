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

// ดึงประวัติการชำระเงินทั้งหมด
exports.getAllTransactions = async (req, res) => {
    try {
      // ตรวจสอบว่า user ที่ร้องขอเป็น Admin หรือไม่
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
      }
  
      // ดึงรายการคำสั่งซื้อทั้งหมด
      const transactions = await prisma.order.findMany({
        include: {
          sheet: { select: { id: true, title: true, price: true } }, // ดึงข้อมูลชีท
          user: { select: { id: true, name: true, email: true } },  // ดึงข้อมูลผู้ใช้
        },
        orderBy: { createdAt: 'desc' }, // เรียงลำดับจากใหม่ไปเก่า
      });
  
      res.status(200).json({ transactions });
    } catch (error) {
      console.error('Error in getAllTransactions:', error);
      res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
  
// ดึงข้อมูลแดชบอร์ดสำหรับ Admin
exports.getAdminDashboard = async (req, res) => {
  try {
    // ตรวจสอบว่า user เป็น Admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // 1. นับจำนวนชีทตามสถานะ
    const pendingSheetsCount = await prisma.sheet.count({
      where: { status: 'pending' },
    });

    const approvedSheetsCount = await prisma.sheet.count({
      where: { status: 'approved' },
    });

    // 2. นับจำนวนคำสั่งซื้อทั้งหมด
    const totalOrdersCount = await prisma.order.count();

    // 3. คำนวณรายได้รวมจากคำสั่งซื้อที่ชำระเงินแล้ว (status = 'paid')
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
      where: { status: 'paid' },
    });

    // ส่งข้อมูลแดชบอร์ดกลับไป
    res.status(200).json({
      pendingSheets: pendingSheetsCount,
      approvedSheets: approvedSheetsCount,
      totalOrders: totalOrdersCount,
      totalRevenue: totalRevenue._sum.amount || 0, // ถ้าไม่มีรายได้ให้แสดงเป็น 0
    });
  } catch (error) {
    console.error('Error in getAdminDashboard:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};