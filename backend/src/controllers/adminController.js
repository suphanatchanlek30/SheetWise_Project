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

// ดึงรายการสลิปที่รอการตรวจสอบ
exports.getPendingSlips = async (req, res) => {
  try {
    // ตรวจสอบว่า User เป็น Admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // ดึงรายการสลิปที่มีสถานะ pending
    const pendingSlips = await prisma.paymentSlip.findMany({
      where: { status: 'pending' },
      include: {
        order: {
          include: { sheet: true, user: true }, // ดึงข้อมูลคำสั่งซื้อ, ชีท, และผู้ใช้ที่เกี่ยวข้อง
        },
      },
    });

    // ส่งรายการสลิปกลับไป
    res.status(200).json({
      message: 'Pending slips fetched successfully',
      slips: pendingSlips,
    });
  } catch (error) {
    console.error('Error fetching pending slips:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// อัปเดตสถานะสลิป
exports.updateSlipStatus = async (req, res) => {
  try {
    const { id } = req.params; // รับ ID ของสลิปจาก URL
    const { status } = req.body; // รับสถานะที่ต้องการเปลี่ยน (approved หรือ rejected)

    // ตรวจสอบว่า User เป็น Admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // ตรวจสอบว่าสถานะที่ส่งมาตรงกับ allowed statuses
    const allowedStatuses = ['approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // ดึงข้อมูลสลิปจากฐานข้อมูล
    const paymentSlip = await prisma.paymentSlip.findUnique({
      where: { id: parseInt(id) },
      include: { order: true }, // ดึงข้อมูลคำสั่งซื้อที่เกี่ยวข้อง
    });

    if (!paymentSlip) {
      return res.status(404).json({ message: 'Payment slip not found' });
    }

    // อัปเดตสถานะสลิปในฐานข้อมูล
    const updatedSlip = await prisma.paymentSlip.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    // หากสถานะเป็น approved ให้เปลี่ยนสถานะคำสั่งซื้อเป็น paid
    if (status === 'approved') {
      await prisma.order.update({
        where: { id: paymentSlip.orderId },
        data: { status: 'paid' },
      });
    }

    // ส่งข้อมูลกลับไป
    res.status(200).json({
      message: `Payment slip ${status} successfully`,
      slip: updatedSlip,
    });
  } catch (error) {
    console.error('Error updating slip status:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};