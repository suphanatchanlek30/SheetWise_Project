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
  