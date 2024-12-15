const app = require('./app');

// โหลดค่า PORT จาก .env หรือใช้ค่าเริ่มต้น 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
