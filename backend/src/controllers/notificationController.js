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

// สร้างการแจ้งเตือนใหม่
exports.createNotification = async (req, res) => {
    try {
      const { userId, message } = req.body; // รับ userId และข้อความแจ้งเตือนจาก Body
  
      // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
      if (!userId || !message) {
        return res.status(400).json({ message: 'User ID and message are required' });
      }
  
      // สร้างการแจ้งเตือนใหม่
      const notification = await prisma.notification.create({
        data: { userId, message },
      });
  
      // ส่งการแจ้งเตือนที่สร้างสำเร็จกลับไป
      res.status(201).json({ message: 'Notification created successfully', notification });
    } catch (error) {
      console.error('Error in createNotification:', error);
      res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// อัปเดตสถานะแจ้งเตือนเป็น "อ่านแล้ว"
exports.markNotificationAsRead = async (req, res) => {
    try {
      const { id } = req.params; // รับ ID ของแจ้งเตือนจาก URL
      const userId = req.user.userId; // รับ userId จาก JWT
  
      // ตรวจสอบว่าการแจ้งเตือนมีอยู่จริงและเป็นของผู้ใช้นี้
      const notification = await prisma.notification.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      if (notification.userId !== userId) {
        return res.status(403).json({ message: 'Access denied: This is not your notification' });
      }
  
      // อัปเดตสถานะแจ้งเตือนเป็น "อ่านแล้ว"
      const updatedNotification = await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { isRead: true },
      });
  
      res.status(200).json({
        message: 'Notification marked as read',
        notification: updatedNotification,
      });
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};