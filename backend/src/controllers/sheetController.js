const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// อัปโหลดชีท
exports.uploadSheet = async (req, res) => {
    try {
      const { title, description, price, fileUrl } = req.body; // ข้อมูลที่รับจาก Client
      const userId = req.user.userId; // รับ userId จาก JWT ที่ถอดรหัสใน middleware
  
      // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
      if (!title || !description || !price || !fileUrl) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // บันทึกชีทลงในฐานข้อมูล
      const sheet = await prisma.sheet.create({
        data: {
          title,
          description,
          price,
          fileUrl,
          userId,
        },
      });
  
      res.status(201).json({
        message: 'Sheet uploaded successfully',
        sheet,
      });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};

// ดึงรายการชีทที่สถานะเป็น pending
exports.getPendingSheets = async (req, res) => {
    try {
      const sheets = await prisma.sheet.findMany({
        where: { status: 'pending' },
      });
  
      res.status(200).json({ sheets });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};
  
// อนุมัติหรือปฏิเสธชีท
exports.updateSheetStatus = async (req, res) => {
    try {
      const { id } = req.params; // รับ id ของชีทจาก URL
      const { status } = req.body; // รับสถานะใหม่จาก Body
  
      // ตรวจสอบว่าสถานะเป็น 'approved' หรือ 'rejected'
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      // อัปเดตสถานะของชีท
      const updatedSheet = await prisma.sheet.update({
        where: { id: parseInt(id) },
        data: { status },
      });
  
      res.status(200).json({
        message: `Sheet has been ${status}`,
        sheet: updatedSheet,
      });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};

// ดึงรายการชีทที่อนุมัติแล้ว
exports.getApprovedSheets = async (req, res) => {
    try {
      const { search, category, minPrice, maxPrice } = req.query;
  
      // สร้างตัวกรอง
      const filters = {
        status: 'approved', // ดึงเฉพาะชีทที่อนุมัติแล้ว
      };
  
      if (search) {
        filters.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
  
      if (category) {
        filters.category = category;
      }
  
      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.gte = parseFloat(minPrice);
        if (maxPrice) filters.price.lte = parseFloat(maxPrice);
      }
  
      const sheets = await prisma.sheet.findMany({
        where: filters,
      });
  
      res.status(200).json({ sheets });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};

exports.getSheetById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const sheet = await prisma.sheet.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!sheet) {
        return res.status(404).json({ message: 'Sheet not found' });
      }
  
      res.status(200).json({ sheet });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};
  
exports.deleteSheet = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId; // รับ userId จาก JWT
  
      // ตรวจสอบว่าชีทนี้เป็นของผู้ใช้หรือ Admin
      const sheet = await prisma.sheet.findUnique({ where: { id: parseInt(id) } });
  
      if (!sheet) {
        return res.status(404).json({ message: 'Sheet not found' });
      }
  
      if (sheet.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      await prisma.sheet.delete({ where: { id: parseInt(id) } });
  
      res.status(200).json({ message: 'Sheet deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
};
  