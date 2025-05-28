# Dockerfile.dev
FROM node:lts-alpine

# 1. Thiết lập thư mục làm việc
WORKDIR /app

# 2. Copy package.json + cài cả devDependencies để có nodemon
COPY package*.json ./
RUN npm install

# 3. Copy toàn bộ source
COPY . .

# 4. Expose port ứng dụng (theo code: chạy trên 3001)
EXPOSE 3001

# 5. Chạy nodemon để dev với hot-reload
CMD ["npm", "run", "prod"]
