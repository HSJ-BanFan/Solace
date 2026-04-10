# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建参数：用于构建时的默认值
# 运行时配置通过 docker-entrypoint.sh 注入
ARG VITE_API_BASE=/api/v1
ENV VITE_API_BASE=$VITE_API_BASE

# 构建
RUN npm run build

# Runtime stage: Nginx
FROM nginx:alpine

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 entrypoint 脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
# 修复 Windows 换行符 (CRLF -> LF)
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# 暴露端口
EXPOSE 80

# 使用自定义 entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
