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

// ดึงชีทขายดีที่สุด 5 อันดับแรก
exports.getPopularSheets = async (req, res) => {
    try {
      // ดึงข้อมูลชีทที่ขายดี 5 อันดับแรก
      const popularSheets = await prisma.sheet.findMany({
        include: {
          orders: {
            where: { status: 'paid' }, // เฉพาะคำสั่งซื้อที่ชำระเงินแล้ว
          },
        },
      });
  
      // คำนวณยอดขายและรายได้รวมของแต่ละชีท
      const sheetsWithSalesData = popularSheets
        .map(sheet => {
          const salesCount = sheet.orders.length; // จำนวนคำสั่งซื้อ
          const totalRevenue = sheet.orders.reduce(
            (sum, order) => sum + order.amount,
            0
          ); // รวมยอดขาย
          return {
            id: sheet.id,
            title: sheet.title,
            sales: salesCount,
            revenue: totalRevenue,
          };
        })
        .sort((a, b) => b.sales - a.sales) // จัดเรียงตามยอดขายมากไปหาน้อย
        .slice(0, 5); // เลือกแค่ 5 อันดับแรก
  
      res.status(200).json({
        message: 'Popular sheets fetched successfully',
        topSheets: sheetsWithSalesData,
      });
    } catch (error) {
      console.error('Error fetching popular sheets:', error);
      res.status(500).json({
        message: 'Something went wrong',
        error: error.message,
      });
    }
};