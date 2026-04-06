package middleware

import (
	"strings"

	apperrors "gin-quickstart/internal/pkg/errors"
	"gin-quickstart/internal/pkg/jwt"
	"gin-quickstart/internal/pkg/logger"
	"gin-quickstart/internal/service"
	"github.com/gin-gonic/gin"
)

// Auth JWT 认证中间件
func Auth(authService service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从 Authorization 头提取令牌
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			RespondWithError(c, apperrors.ErrUnauthorized)
			c.Abort()
			return
		}

		// 令牌格式应为 "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			RespondWithError(c, apperrors.NewUnauthorized("授权头格式无效"))
			c.Abort()
			return
		}

		token := parts[1]

		// 验证令牌
		claims, err := authService.ValidateAccessToken(token)
		if err != nil {
			logger.Warn().
				Str("request_id", c.GetString("request_id")).
				Err(err).
				Msg("令牌验证失败")

			if err == jwt.ErrTokenExpired {
				RespondWithError(c, apperrors.NewUnauthorized("令牌已过期"))
			} else {
				RespondWithError(c, apperrors.NewUnauthorized("无效的令牌"))
			}
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)

		c.Next()
	}
}

// OptionalAuth 可选认证中间件，允许未认证请求通过
func OptionalAuth(authService service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}

		token := parts[1]
		claims, err := authService.ValidateAccessToken(token)
		if err != nil {
			c.Next()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)

		c.Next()
	}
}

// RequireRole 检查用户是否具有所需角色
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.GetString("role")
		if userRole == "" {
			RespondWithError(c, apperrors.ErrUnauthorized)
			c.Abort()
			return
		}

		hasRole := false
		for _, role := range roles {
			if userRole == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			RespondWithError(c, apperrors.ErrForbidden)
			c.Abort()
			return
		}

		c.Next()
	}
}

// RespondWithError 中间件错误响应辅助函数
func RespondWithError(c *gin.Context, err error) {
	var appErr apperrors.AppError
	if apperrors.IsAppError(err) {
		appErr = err.(apperrors.AppError)
		c.JSON(appErr.HTTPStatus(), gin.H{
			"success": false,
			"error": gin.H{
				"code":    appErr.Code(),
				"message": appErr.Error(),
			},
		})
		return
	}

	c.JSON(500, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "INTERNAL_ERROR",
			"message": "服务器内部错误",
		},
	})
}
