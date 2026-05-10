package service

import (
	"context"
	"strings"
	"sync"
	"time"

	"gin-quickstart/internal/config"
	"gin-quickstart/internal/dto/request"
	"gin-quickstart/internal/dto/response"
	apperrors "gin-quickstart/internal/pkg/errors"
	"gin-quickstart/internal/pkg/hash"
	"gin-quickstart/internal/pkg/jwt"
	"gin-quickstart/internal/pkg/logger"
)

const (
	maxLoginAttempts    = 5
	lockoutDuration     = 15 * time.Minute
	attemptRetentionTTL = lockoutDuration
)

// 认证相关错误
var (
	ErrInvalidCredentials = apperrors.NewUnauthorized("邮箱或密码错误")
	ErrTokenExpired       = apperrors.NewUnauthorized("令牌已过期")
	ErrAccountLocked      = apperrors.NewUnauthorized("账户已锁定，请稍后再试")
)

// AuthService 认证业务逻辑接口
type AuthService interface {
	Login(ctx context.Context, req *request.LoginRequest) (*response.AuthResponse, error)
	Logout(ctx context.Context, refreshToken string) error
	Refresh(ctx context.Context, req *request.RefreshTokenRequest) (*response.RefreshResponse, error)
	ValidateAccessToken(token string) (*jwt.Claims, error)
}

// loginAttempt 登录尝试记录
type loginAttempt struct {
	count         int
	lockedAt      time.Time
	lastAttemptAt time.Time
}

// authService 认证服务实现
type authService struct {
	cfg            *config.Config
	jwtManager     *jwt.JWTManager
	accessDuration time.Duration
	attempts       map[string]*loginAttempt
	mu             sync.RWMutex
}

// NewAuthService 创建认证服务
func NewAuthService(
	cfg *config.Config,
	jwtManager *jwt.JWTManager,
	accessDuration time.Duration,
) AuthService {
	return &authService{
		cfg:            cfg,
		jwtManager:     jwtManager,
		accessDuration: accessDuration,
		attempts:       make(map[string]*loginAttempt),
	}
}

func (s *authService) Login(ctx context.Context, req *request.LoginRequest) (*response.AuthResponse, error) {
	log := logger.WithContext(ctx)
	log.Info().Msg("登录尝试")

	now := time.Now()
	email := normalizeLoginEmail(req.Email)
	adminEmail := normalizeLoginEmail(s.cfg.AdminEmail())

	s.mu.Lock()
	s.cleanupExpiredAttempts(now)

	if s.isAccountLockedLocked(email, now) {
		s.mu.Unlock()
		log.Warn().Msg("账户已锁定")
		return nil, ErrAccountLocked
	}

	if email != adminEmail {
		s.recordFailedAttemptLocked(email, now)
		s.mu.Unlock()
		log.Warn().Msg("登录失败")
		return nil, ErrInvalidCredentials
	}

	if !hash.CheckPassword(req.Password, s.cfg.AdminPasswordHash()) {
		s.recordFailedAttemptLocked(email, now)
		s.mu.Unlock()
		log.Warn().Msg("登录失败")
		return nil, ErrInvalidCredentials
	}

	delete(s.attempts, email)
	s.mu.Unlock()

	log.Info().Msg("登录成功")
	return s.generateTokens()
}

func normalizeLoginEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func (s *authService) isAccountLocked(email string) bool {
	now := time.Now()
	normalizedEmail := normalizeLoginEmail(email)

	s.mu.Lock()
	defer s.mu.Unlock()

	s.cleanupExpiredAttempts(now)
	return s.isAccountLockedLocked(normalizedEmail, now)
}

func (s *authService) isAccountLockedLocked(email string, now time.Time) bool {
	attempt, exists := s.attempts[email]
	if !exists {
		return false
	}

	if attempt.count < maxLoginAttempts {
		return false
	}

	if now.Sub(attempt.lockedAt) >= lockoutDuration {
		delete(s.attempts, email)
		return false
	}

	return true
}

func (s *authService) recordFailedAttempt(email string) {
	now := time.Now()
	normalizedEmail := normalizeLoginEmail(email)

	s.mu.Lock()
	defer s.mu.Unlock()

	s.cleanupExpiredAttempts(now)
	s.recordFailedAttemptLocked(normalizedEmail, now)
}

func (s *authService) recordFailedAttemptLocked(email string, now time.Time) {
	attempt, exists := s.attempts[email]
	if !exists {
		attempt = &loginAttempt{}
		s.attempts[email] = attempt
	}

	attempt.count++
	attempt.lastAttemptAt = now
	if attempt.count >= maxLoginAttempts {
		attempt.lockedAt = now
	}
}

func (s *authService) cleanupExpiredAttempts(now time.Time) {
	for email, attempt := range s.attempts {
		if now.Sub(attempt.lastAttemptAt) >= attemptRetentionTTL {
			delete(s.attempts, email)
		}
	}
}

func (s *authService) resetAttempts(email string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.attempts, email)
}

func (s *authService) Logout(ctx context.Context, refreshToken string) error {
	log := logger.WithContext(ctx)
	log.Info().Msg("用户登出")
	return nil
}

func (s *authService) Refresh(ctx context.Context, req *request.RefreshTokenRequest) (*response.RefreshResponse, error) {
	log := logger.WithContext(ctx)

	log.Debug().Msg("刷新令牌")

	// 验证刷新令牌
	if err := s.jwtManager.ValidateRefreshToken(req.RefreshToken); err != nil {
		log.Warn().Err(err).Msg("刷新令牌验证失败")
		return nil, ErrTokenExpired
	}

	// 生成新令牌
	accessToken, err := s.jwtManager.GenerateAccessToken(1, s.cfg.AdminUsername(), "admin")
	if err != nil {
		log.Error().Err(err).Msg("生成访问令牌失败")
		return nil, err
	}

	refreshToken, _, err := s.jwtManager.GenerateRefreshToken(1)
	if err != nil {
		log.Error().Err(err).Msg("生成刷新令牌失败")
		return nil, err
	}

	log.Info().Msg("令牌刷新成功")

	return &response.RefreshResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.accessDuration.Seconds()),
	}, nil
}

func (s *authService) ValidateAccessToken(token string) (*jwt.Claims, error) {
	return s.jwtManager.ValidateAccessToken(token)
}

func (s *authService) generateTokens() (*response.AuthResponse, error) {
	// 生成访问令牌
	accessToken, err := s.jwtManager.GenerateAccessToken(1, s.cfg.AdminUsername(), "admin")
	if err != nil {
		return nil, err
	}

	// 生成刷新令牌
	refreshToken, _, err := s.jwtManager.GenerateRefreshToken(1)
	if err != nil {
		return nil, err
	}

	return &response.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.accessDuration.Seconds()),
		User: &response.UserResponse{
			ID:        1,
			Username:  s.cfg.AdminUsername(),
			Email:     s.cfg.AdminEmail(),
			Nickname:  s.cfg.AdminNickname(),
			AvatarURL: s.cfg.AdminAvatarURL(),
			Bio:       s.cfg.AdminBio(),
			GitHubURL: s.cfg.AdminGitHub(),
			Role:      "admin",
		},
	}, nil
}
