// Định nghĩa các loại môi trường
const ENV_TYPE = 'CLOUD'; // Thay đổi thành: 'LOCAL', 'DOCKER', hoặc 'CLOUD'

const configs = {
  LOCAL: 'http://localhost:5000/api',
  DOCKER: 'http://host.docker.internal:5000/api', // Dùng host.docker.internal để gọi từ container ra máy host
  CLOUD: 'URL WEB HOST'
};

export const environment = {
  production: true,
  apiUrl: configs[ENV_TYPE]
};