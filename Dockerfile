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

# 安装 ca-certificates（HTTPS 请求需要）和 wget（健康检查需要）
RUN apk --no-cache add ca-certificates tzdata wget

# 设置时区
ENV TZ=Asia/Shanghai

# 复制构建产物
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations

# 创建非 root 用户
RUN adduser -D -g '' appuser
USER appuser

# 暴露端口
EXPOSE 8080

# 启动
CMD ["./server"]
