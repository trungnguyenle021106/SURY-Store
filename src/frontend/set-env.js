const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 1. Cố gắng load file .env nểu có (Cho Local)
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    console.log(`✅ [Local] Loading .env from ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    // Trong Docker build sẽ nhảy vào đây
    console.log('🐳 [Docker] .env file not found. Using process.env passed from ARG.');
}

// 2. Lấy giá trị (Ưu tiên process.env thực tế)
// Lưu ý: process.env.APP_MODE sẽ được Docker truyền vào qua ARG
const appMode = process.env.APP_MODE || 'LOCAL';

console.log(`ℹ️  Current APP_MODE: ${appMode}`);

const gatewayUrls = {
    'LOCAL':  process.env.LOCAL_BASE_URL || 'http://localhost:5000',
    'DOCKER': 'http://localhost:5000', // Hardcode cho nội bộ Docker
    'CLOUD':  process.env.CLOUD_API_URL 
};

const apiUrl = gatewayUrls[appMode] || gatewayUrls['LOCAL'];
const isProduction = process.env.NODE_ENV === 'production';

// 3. Tạo nội dung file environment mới
const envFileContent = `
export const environment = {
  production: ${isProduction},
  apiUrl: '${apiUrl}'
};
`;

// ... (Phần trên giữ nguyên)

// 4. [SỬA ĐƯỜNG DẪN CHO ĐÚNG VỚI FILE THẬT CỦA BẠN]
// Thêm chữ /app vào đường dẫn
const targetPath = path.join(__dirname, './src/app/environments/environment.ts');
const targetPathProd = path.join(__dirname, './src/app/environments/environment.prod.ts');

// Ghi file thường
fs.writeFile(targetPath, envFileContent, function (err) {
   if (err) console.log('❌ Lỗi ghi environment.ts:', err);
   else console.log(`✅ Đã cập nhật environment.ts tại ${targetPath}`);
});

// Ghi file prod
fs.writeFile(targetPathProd, envFileContent, function (err) {
   if (err) console.log('❌ Lỗi ghi environment.prod.ts:', err);
   else console.log(`✅ Đã cập nhật environment.prod.ts tại ${targetPathProd}`);
});