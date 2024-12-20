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

// ดึงข้อมูลสรุปผู้ใช้งาน
exports.getUserSummary = async (req, res) => {
    try {
      // ดึงจำนวนผู้ใช้ทั้งหมด
      const totalUsers = await prisma.user.count();
  
      // ดึงจำนวนผู้ใช้ที่สมัครวันนี้
      const today = new Date();
      today.setHours(0, 0, 0, 0); // ตั้งเวลาเป็น 00:00:00
      const usersRegisteredToday = await prisma.user.count({
        where: {
          createdAt: {
            gte: today, // สมัครหลังจากเที่ยงคืนของวันนี้
          },
        },
      });
  
      // ดึงข้อมูลผู้ใช้ที่ใช้งานล่าสุด (เรียงตาม createdAt)
      const lastActiveUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }, // เรียงลำดับตามเวลาที่สร้างล่าสุด
        take: 5, // แสดงผู้ใช้ 5 คนล่าสุด
      });
  
      res.status(200).json({
        message: 'User summary fetched successfully',
        totalUsers,
        usersRegisteredToday,
        lastActiveUsers,
      });
    } catch (error) {
      console.error('Error fetching user summary:', error);
      res.status(500).json({
        message: 'Something went wrong',
        error: error.message,
      });
    }
};

// ดึงข้อมูลสรุปคำสั่งซื้อ
exports.getOrderSummary = async (req, res) => {
    try {
      // นับจำนวนคำสั่งซื้อทั้งหมด
      const totalOrders = await prisma.order.count();
  
      // นับจำนวนคำสั่งซื้อที่ชำระเงินแล้ว
      const paidOrders = await prisma.order.count({
        where: { status: 'paid' },
      });
  
      // นับจำนวนคำสั่งซื้อที่รอดำเนินการ
      const pendingOrders = await prisma.order.count({
        where: { status: 'pending' },
      });
  
      res.status(200).json({
        message: 'Order summary fetched successfully',
        totalOrders,
        paidOrders,
        pendingOrders,
      });
    } catch (error) {
      console.error('Error fetching order summary:', error);
      res.status(500).json({
        message: 'Something went wrong',
        error: error.message,
      });
    }
};

// ดึงยอดขายรวมตามวัน, เดือน หรือช่วงเวลา
exports.getOrderRevenue = async (req, res) => {
    try {
      const { startDate, endDate, groupBy } = req.query;
  
      // ตรวจสอบว่ามีการกำหนดวันที่เริ่มต้นหรือสิ้นสุดหรือไม่
      const whereClause = {
        status: 'paid', // เฉพาะคำสั่งซื้อที่ชำระเงินแล้ว
      };
  
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }
  
      // คำนวณยอดขายรวมตามการจัดกลุ่ม
      const revenueData = await prisma.order.groupBy({
        by: [groupBy === 'daily' ? 'createdAt' : groupBy === 'monthly' ? 'createdAt' : 'createdAt'],
        _sum: { amount: true },
        where: whereClause,
        orderBy: { createdAt: 'asc' },
      });
  
      // จัดข้อมูลตามกลุ่ม
      const groupedRevenue = revenueData.reduce((acc, order) => {
        const date = new Date(order.createdAt);
  
        // แปลงวันที่ตามประเภทการจัดกลุ่ม
        let key;
        if (groupBy === 'daily') {
          key = date.toISOString().split('T')[0]; // yyyy-mm-dd
        } else if (groupBy === 'monthly') {
          key = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`; // yyyy-mm
        } else {
          key = date.getFullYear(); // yyyy
        }
  
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += order._sum.amount;
        return acc;
      }, {});
  
      res.status(200).json({
        message: 'Order revenue fetched successfully',
        revenue: groupedRevenue,
      });
    } catch (error) {
      console.error('Error fetching order revenue:', error);
      res.status(500).json({
        message: 'Something went wrong',
        error: error.message,
      });
    }
};