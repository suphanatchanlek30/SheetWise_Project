const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ยืนยันการชำระเงิน
exports.confirmPayment = async (req, res) => {
    try {
      const { id } = req.params; // รับ ID คำสั่งซื้อจาก URL
      const userId = req.user.userId; // รับ userId จาก JWT
  
      // ตรวจสอบคำสั่งซื้อ
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // ตรวจสอบว่าคำสั่งซื้อเป็นของผู้ใช้หรือไม่
      if (order.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      // อัปเดตสถานะคำสั่งซื้อเป็น paid
      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status: 'paid' },
      });
  
      res.status(200).json({
        message: 'Payment confirmed successfully',
        order: updatedOrder,
      });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

// ฟังก์ชันสำหรับดาวน์โหลดชีท
exports.downloadSheet = async (req, res) => {
  try {
    const { id } = req.params; // รับ id ของคำสั่งซื้อจาก URL
    const userId = req.user.userId; // รับ userId จาก JWT ที่ถอดรหัสผ่าน Middleware

    // 1. ตรวจสอบว่าคำสั่งซื้อมีอยู่จริง และเชื่อมโยงกับผู้ใช้นี้หรือไม่
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }, // ค้นหาด้วย id
      include: { sheet: true }, // ดึงข้อมูลชีทที่เชื่อมโยงกับคำสั่งซื้อ
    });

    // ตรวจสอบว่าพบคำสั่งซื้อหรือไม่
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ตรวจสอบว่าคำสั่งซื้อนี้เป็นของผู้ใช้นี้หรือไม่
    if (order.userId !== userId) {
      return res.status(403).json({ message: "Access denied: This is not your order" });
    }

    // 2. ตรวจสอบว่าสถานะคำสั่งซื้อเป็น 'paid'
    if (order.status !== "paid") {
      return res.status(400).json({
        message: "Payment is not completed. You cannot download this sheet.",
      });
    }

    // 3. ส่งลิงก์สำหรับดาวน์โหลดชีทกลับไปยังผู้ใช้
    return res.status(200).json({
      message: "Sheet download link generated successfully",
      downloadUrl: order.sheet.fileUrl, // ส่งลิงก์ไฟล์ชีทที่เก็บไว้ในฐานข้อมูล
    });
  } catch (error) {
    // กรณีเกิดข้อผิดพลาด
    console.error("Error in downloadSheet:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ดึงประวัติคำสั่งซื้อทั้งหมดของผู้ใช้
exports.getOrders = async (req, res) => {
    try {
      const userId = req.user.userId; // รับ userId จาก JWT
  
      // ดึงคำสั่งซื้อทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
      const orders = await prisma.order.findMany({
        where: { userId: userId },
        include: { sheet: true }, // ดึงข้อมูลชีทที่เกี่ยวข้องกับคำสั่งซื้อ
      });
  
      // ส่งคำสั่งซื้อทั้งหมดกลับไป
      res.status(200).json({ orders });
    } catch (error) {
      console.error('Error in getOrders:', error);
      res.status(500).json({ message: 'Something went wrong', error });
    }
};
  
// ดึงประวัติคำสั่งซื้อโดย ID
exports.getOrderById = async (req, res) => {
    try {
      const { id } = req.params; // รับ ID ของคำสั่งซื้อจาก URL
      const userId = req.user.userId; // รับ userId จาก JWT
  
      // ดึงคำสั่งซื้อเฉพาะ ID และข้อมูลชีท
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: { sheet: true },
      });
  
      // ตรวจสอบว่าคำสั่งซื้อมีอยู่จริงและเป็นของผู้ใช้นี้
      if (!order || order.userId !== userId) {
        return res.status(404).json({ message: 'Order not found or access denied' });
      }
  
      // ส่งข้อมูลคำสั่งซื้อกลับไป
      res.status(200).json({ order });
    } catch (error) {
      console.error('Error in getOrderById:', error);
      res.status(500).json({ message: 'Something went wrong', error });
    }
};
  
exports.createOrder = async (req, res) => {
    try {
      const { sheetId } = req.body; // รับ ID ของชีทจาก Request Body
      const userId = req.user.userId; // รับ userId จาก JWT
  
      // ตรวจสอบว่าชีทมีอยู่และสถานะเป็น 'approved'
      const sheet = await prisma.sheet.findUnique({
        where: { id: parseInt(sheetId) },
      });
  
      if (!sheet || sheet.status !== 'approved') {
        return res.status(400).json({ message: 'Sheet is not available for purchase' });
      }
  
      // ตรวจสอบว่าผู้ใช้นี้ยังไม่ได้ซื้อชีทนี้มาก่อน
      const existingOrder = await prisma.order.findFirst({
        where: { sheetId: sheet.id, userId: userId, status: 'paid' },
      });
  
      if (existingOrder) {
        return res.status(400).json({ message: 'You have already purchased this sheet' });
      }
  
      // สร้างคำสั่งซื้อใหม่พร้อมสถานะ 'pending'
      const newOrder = await prisma.order.create({
        data: {
          userId,
          sheetId: sheet.id,
          amount: sheet.price,
          status: 'pending',
        },
      });
  
      // ส่งคำสั่งซื้อกลับไปยังผู้ใช้
      res.status(201).json({
        message: 'Order created successfully',
        order: newOrder,
      });
    } catch (error) {
      console.error('Error in createOrder:', error);
      res.status(500).json({ message: 'Something went wrong', error });
    }
};