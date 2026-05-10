package middleware

import (
	"crypto/sha256"
	"crypto/subtle"
	stderrors "errors"
	"strings"

	apperrors "gin-quickstart/internal/pkg/errors"
	"gin-quickstart/internal/pkg/jwt"
	"gin-quickstart/internal/pkg/logger"
	"gin-quickstart/internal/service"
	"github.com/gin-gonic/gin"
)

func MomentAuth(authService service.AuthService, momentSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		momentSecretHeader := c.GetHeader("X-Moment-Secret")

		if momentSecretHeader != "" && momentSecret != "" {
			providedHash := sha256.Sum256([]byte(momentSecretHeader))
			expectedHash := sha256.Sum256([]byte(momentSecret))
			if subtle.ConstantTimeCompare(providedHash[:], expectedHash[:]) == 1 {
				c.Set("user_id", uint(0))
				c.Set("username", "moment-secret-user")
				c.Set("role", "moment-secret")
				c.Next()
				return
			}
			RespondWithError(c, apperrors.NewUnauthorized("无效的 Moment Secret"))
			c.Abort()
			return
		}

		if authHeader == "" {
			RespondWithError(c, apperrors.ErrUnauthorized)
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			RespondWithError(c, apperrors.NewUnauthorized("授权头格式无效"))
			c.Abort()
			return
		}

		token := parts[1]

		claims, err := authService.ValidateAccessToken(token)
		if err != nil {
			logger.Warn().
				Str("request_id", c.GetString("request_id")).
				Err(err).
				Msg("令牌验证失败")

			if stderrors.Is(err, jwt.ErrTokenExpired) {
				RespondWithError(c, apperrors.NewUnauthorized("令牌已过期"))
			} else {
				RespondWithError(c, apperrors.NewUnauthorized("无效的令牌"))
			}
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)

		c.Next()
	}
}
