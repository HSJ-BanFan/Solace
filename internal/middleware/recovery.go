package middleware

import (
	"net/http"
	"runtime/debug"

	"gin-quickstart/internal/pkg/logger"
	"github.com/gin-gonic/gin"
)

// Recovery 异常恢复中间件，捕获 panic 并返回 500 错误
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				requestID := c.GetString("request_id")

				logger.Error().
					Str("request_id", requestID).
					Interface("error", err).
					Str("stack", string(debug.Stack())).
					Msg("捕获到 panic")

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error": gin.H{
						"code":    "INTERNAL_ERROR",
						"message": "服务器内部错误",
					},
				})
			}
		}()
		c.Next()
	}
}
