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
