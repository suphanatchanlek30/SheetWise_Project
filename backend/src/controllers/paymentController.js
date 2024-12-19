const QRCode = require('qrcode');
const promptpay = require('promptpay-qr');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');

// สร้าง QR Code สำหรับการชำระเงิน
exports.generateQRCode = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    // ตรวจสอบคำสั่งซื้อในฐานข้อมูล
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // สร้าง QR Code สำหรับ PromptPay
    const recipientPromptPayId = '0612601997'; // เปลี่ยนเป็น PromptPay ID ของคุณ
    const payload = promptpay(recipientPromptPayId, parseFloat(amount)); // สร้าง Payload
    const qrCode = await QRCode.toDataURL(payload); // แปลงเป็น QR Code

    // ส่ง QR Code กลับไป
    res.status(200).json({
      message: 'QR Code generated successfully',
      qrCode, // รูป QR Code
      amount,
      orderId,
    });
  } catch (error) {
    console.error('Error generating QR Code:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads'); // ตรวจสอบว่าโฟลเดอร์นี้มีอยู่
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`); // ตั้งชื่อไฟล์
    },
  });

const upload = multer({ storage });

// อัปโหลดสลิปการโอนเงิน
exports.uploadPaymentSlip = async (req, res) => {
    try {
      const { orderId } = req.body; // รับ orderId จากผู้ใช้
      const slipUrl = `/uploads/${req.file.filename}`; // URL ของไฟล์สลิป
  
      // ตรวจสอบคำสั่งซื้อ
      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
      });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // บันทึกข้อมูลสลิปในฐานข้อมูล
      const paymentSlip = await prisma.paymentSlip.create({
        data: {
          orderId: parseInt(orderId),
          slipUrl,
          status: 'pending', // สถานะเริ่มต้น
        },
      });
  
      res.status(201).json({
        message: 'Payment slip uploaded successfully',
        slip: paymentSlip,
      });
    } catch (error) {
      console.error('Error uploading payment slip:', error);
      res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
  
// Export multer upload สำหรับใช้ใน Route
exports.upload = upload.single('slip');