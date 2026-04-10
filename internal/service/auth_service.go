package service

import (
	"context"
	"errors"
	"time"

	"gin-quickstart/internal/config"
	"gin-quickstart/internal/dto/request"
	"gin-quickstart/internal/dto/response"
	"gin-quickstart/internal/pkg/hash"
	"gin-quickstart/internal/pkg/jwt"
)

var (
	ErrInvalidCredentials = errors.New("用户名或密码错误")
	ErrTokenExpired       = errors.New("令牌已过期")
	ErrTokenRevoked       = errors.New("令牌已被撤销")
)

// AuthService 认证业务逻辑接口
type AuthService interface {
	Login(ctx context.Context, req *request.LoginRequest) (*response.AuthResponse, error)
	Logout(ctx context.Context, refreshToken string) error
	Refresh(ctx context.Context, req *request.RefreshTokenRequest) (*response.RefreshResponse, error)
	ValidateAccessToken(token string) (*jwt.Claims, error)
}

// authService 认证服务实现
type authService struct {
	cfg            *config.Config
	jwtManager     *jwt.JWTManager
	accessDuration time.Duration
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
	}
}

func (s *authService) Login(ctx context.Context, req *request.LoginRequest) (*response.AuthResponse, error) {
	// 验证邮箱是否匹配配置的管理员邮箱
	if req.Email != s.cfg.AdminEmail() {
		return nil, ErrInvalidCredentials
	}

	// 验证密码
	if !hash.CheckPassword(req.Password, s.cfg.AdminPasswordHash()) {
		return nil, ErrInvalidCredentials
	}

	// 生成令牌
	return s.generateTokens()
}

func (s *authService) Logout(ctx context.Context, refreshToken string) error {
	// 单用户模式，登出无需额外处理
	// JWT 令牌会在过期后自动失效
	return nil
}

func (s *authService) Refresh(ctx context.Context, req *request.RefreshTokenRequest) (*response.RefreshResponse, error) {
	// 验证刷新令牌
	if err := s.jwtManager.ValidateRefreshToken(req.RefreshToken); err != nil {
		return nil, err
	}

	// 生成新令牌
	accessToken, err := s.jwtManager.GenerateAccessToken(1, s.cfg.AdminUsername(), "admin")
	if err != nil {
		return nil, err
	}

	refreshToken, _, err := s.jwtManager.GenerateRefreshToken(1)
	if err != nil {
		return nil, err
	}

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
