# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# 安装依赖
RUN apk add --no-cache git

# 复制 go mod 文件
COPY go.mod go.sum ./
RUN go mod download

# 复制源代码
COPY . .

# 构建
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# Runtime stage
FROM alpine:latest

WORKDIR /app

# 安装 ca-certificates（HTTPS 请求需要）、wget（健康检查需要）、su-exec（用户切换）
RUN apk --no-cache add ca-certificates tzdata wget su-exec

# 设置时区
ENV TZ=Asia/Shanghai

# 复制构建产物
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations

# 复制默认配置文件示例
COPY config.toml.example config.toml.example

# 创建配置目录（可被挂载）
RUN mkdir -p /app/config

# 复制启动脚本（确保 LF 换行符）
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh

# 创建非 root 用户
RUN adduser -D -g '' appuser

# 暴露端口
EXPOSE 8080

# 使用 entrypoint 脚本启动（以 root 运行，脚本内部切换用户）
ENTRYPOINT ["docker-entrypoint.sh"]
