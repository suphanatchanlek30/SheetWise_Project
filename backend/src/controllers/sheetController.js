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