package middleware

import (
	"time"

	"gin-quickstart/internal/pkg/logger"
	"github.com/gin-gonic/gin"
)

// Logging 请求日志中间件
func Logging() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		requestID := c.GetString("request_id")

		// 记录请求开始
		logger.Info().
			Str("request_id", requestID).
			Str("method", method).
			Str("path", path).
			Str("client_ip", c.ClientIP()).
			Msg("请求开始")

		// 处理请求
		c.Next()

		// 记录请求完成
		duration := time.Since(start)
		status := c.Writer.Status()

		event := logger.Info()
		if status >= 400 {
			event = logger.Warn()
		}
		if status >= 500 {
			event = logger.Error()
		}

		event.
			Str("request_id", requestID).
			Str("method", method).
			Str("path", path).
			Int("status", status).
			Dur("duration_ms", duration).
			Int("response_size", c.Writer.Size()).
			Msg("请求完成")
	}
}
