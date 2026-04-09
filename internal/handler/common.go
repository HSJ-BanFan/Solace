package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// HealthCheck 返回服务器健康状态
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"status":    "healthy",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		},
	})
}

// PlaceholderUpload 上传接口占位响应
func PlaceholderUpload(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"message":   "上传功能即将上线",
			"image_url": "",
		},
	})
}
