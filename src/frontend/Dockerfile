# --- GIAI ĐOẠN 1: BUILD ---
FROM node:20-alpine as build
WORKDIR /app

# (Phần copy package giữ nguyên)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# (Phần copy code giữ nguyên)
COPY frontend/ .
COPY .env ../.env 

ARG APP_MODE
ARG CLOUD_API_URL

# Gán ARG vào ENV để các script (như set-env.js hoặc npm build) có thể đọc được qua process.env
ENV APP_MODE=$APP_MODE
ENV CLOUD_API_URL=$CLOUD_API_URL

# Cài dotenv và chạy script
RUN npm install dotenv
RUN node set-env.js 
# ========================================================

ARG ENV_CONFIG=production
RUN npm run build -- --configuration=$ENV_CONFIG

# --- GIAI ĐOẠN 2: CHẠY APP ---
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]