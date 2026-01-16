# --- GIAI ĐOẠN 1: BUILD ---
FROM node:20-alpine as build
WORKDIR /app

# Copy file package để cài thư viện
COPY package.json package-lock.json ./

# Dùng npm ci để cài đặt chính xác version trong lock file
RUN npm ci

# Copy toàn bộ code
COPY . .

ARG ENV_CONFIG=production

# Thay đổi dòng build để nhận biến
RUN npm run build -- --configuration=$ENV_CONFIG

# --- GIAI ĐOẠN 2: CHẠY APP ---
FROM nginx:alpine

# Xóa config mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy config nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# [QUAN TRỌNG] Copy file build vào thư mục của Nginx
# Dựa trên angular.json của bạn: dist/frontend/browser
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]