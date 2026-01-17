const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const appMode = process.env.APP_MODE || 'LOCAL';

// Định nghĩa map, nhưng giá trị lấy từ process.env
const gatewayUrls = {
    'LOCAL':  process.env.LOCAL_BASE_URL || 'http://localhost:5000',
    'DOCKER': 'http://localhost:5000',
    
    // URL này sẽ lấy từ dòng CLOUD_API_URL trong file .env
    // Nếu ai đó clone code về mà không có file .env thật, nó sẽ ra undefined (an toàn)
    'CLOUD':  process.env.CLOUD_API_URL 
};

const apiUrl = gatewayUrls[appMode] || gatewayUrls['LOCAL'];
const isProduction = process.env.NODE_ENV === 'production';

// 3. Tạo nội dung file environment.ts mới
const envFileContent = `
// FILE NÀY ĐƯỢC TẠO TỰ ĐỘNG BỞI set-env.js
// KHÔNG SỬA THỦ CÔNG - HÃY SỬA FILE .env GỐC
export const environment = {
  production: ${isProduction},
  apiUrl: '${apiUrl}'
};
`;

// 4. Ghi đè vào file environment.ts đích
const targetPath = path.join(__dirname, './src/environments/environment.ts');

fs.writeFile(targetPath, envFileContent, function (err) {
   if (err) {
       console.log('❌ Lỗi khi ghi file environment:', err);
   } else {
       console.log(`✅ Đã cập nhật environment.ts với API URL: ${apiUrl}`);
   }
});