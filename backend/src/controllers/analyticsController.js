const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ดึงจำนวนชีทที่ขายทั้งหมดและยอดขายรวม
exports.getSheetSalesAnalytics = async (req, res) => {
  try {
    // คำนวณจำนวนชีทที่ขายทั้งหมด (คำสั่งซื้อที่มีสถานะ paid)
    const totalSheetsSold = await prisma.order.count({
      where: { status: 'paid' },
    });

    // คำนวณยอดขายรวม
    const totalRevenue = await prisma.order.aggregate({
      _sum: { amount: true }, // รวมยอดขายจากฟิลด์ amount
      where: { status: 'paid' },
    });

    res.status(200).json({
      message: 'Sheet sales analytics fetched successfully',
      totalSheetsSold,
      totalRevenue: totalRevenue._sum.amount || 0, // ถ้าไม่มียอดขาย ให้แสดงเป็น 0
    });
  } catch (error) {
    console.error('Error fetching sheet sales analytics:', error);
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message,
    });
  }
};
