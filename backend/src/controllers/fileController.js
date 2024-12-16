const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ให้ผู้ใช้ดาวน์โหลดไฟล์ชีทที่ซื้อแล้ว
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params; // รับ ID ของชีทจาก URL
    const userId = req.user.userId; // รับ userId จาก JWT ผ่าน Middleware

    // ตรวจสอบว่าผู้ใช้มีคำสั่งซื้อที่สถานะเป็น paid สำหรับชีทนี้หรือไม่
    const order = await prisma.order.findFirst({
      where: {
        userId: userId,
        sheetId: parseInt(id),
        status: 'paid',
      },
      include: {
        sheet: true, // ดึงข้อมูลชีทที่เกี่ยวข้อง
      },
    });

    // ถ้าไม่มีคำสั่งซื้อที่ตรงกับเงื่อนไข
    if (!order) {
      return res.status(403).json({
        message: 'Access denied: You have not purchased this sheet or payment is incomplete',
      });
    }

    // ส่งลิงก์ดาวน์โหลดไฟล์ชีทกลับไป
    return res.status(200).json({
      message: 'File download link generated successfully',
      downloadUrl: order.sheet.fileUrl, // ลิงก์ไฟล์ PDF ที่เก็บไว้ในฐานข้อมูล
    });
  } catch (error) {
    console.error('Error in downloadFile:', error);
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message,
    });
  }
};
