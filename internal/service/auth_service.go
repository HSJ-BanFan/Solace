package service

import (
	"context"
	"errors"
	"time"

	"gin-quickstart/internal/dto/request"
	"gin-quickstart/internal/dto/response"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/pkg/hash"
	"gin-quickstart/internal/pkg/jwt"
	"gin-quickstart/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("邮箱或密码错误")
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
	userRepo         repository.UserRepository
	refreshTokenRepo repository.RefreshTokenRepository
	jwtManager       *jwt.JWTManager
	accessDuration   time.Duration
}

// NewAuthService 创建认证服务
func NewAuthService(
	userRepo repository.UserRepository,
	refreshTokenRepo repository.RefreshTokenRepository,
	jwtManager *jwt.JWTManager,
	accessDuration time.Duration,
) AuthService {
	return &authService{
		userRepo:         userRepo,
		refreshTokenRepo: refreshTokenRepo,
		jwtManager:       jwtManager,
		accessDuration:   accessDuration,
	}
}

func (s *authService) Login(ctx context.Context, req *request.LoginRequest) (*response.AuthResponse, error) {
	// 根据邮箱查找用户
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// 检查密码
	if !hash.CheckPassword(req.Password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	// 生成令牌
	return s.generateTokens(ctx, user)
}

func (s *authService) Logout(ctx context.Context, refreshToken string) error {
	// 查找并撤销刷新令牌
	token, err := s.refreshTokenRepo.FindByToken(ctx, refreshToken)
	if err != nil {
		// 令牌未找到，视为已登出
		return nil
	}

	// 撤销令牌
	return s.refreshTokenRepo.Revoke(ctx, token.Token)
}

func (s *authService) Refresh(ctx context.Context, req *request.RefreshTokenRequest) (*response.RefreshResponse, error) {
	// 验证刷新令牌格式
	if err := s.jwtManager.ValidateRefreshToken(req.RefreshToken); err != nil {
		return nil, err
	}

	// 在数据库中查找刷新令牌
	token, err := s.refreshTokenRepo.FindByToken(ctx, req.RefreshToken)
	if err != nil {
		return nil, ErrTokenRevoked
	}

	// 检查令牌是否有效
	if !token.IsValid() {
		return nil, ErrTokenRevoked
	}

	// 获取用户
	user, err := s.userRepo.FindByID(ctx, token.UserID)
	if err != nil {
		return nil, err
	}

	// 撤销旧的刷新令牌
	if err := s.refreshTokenRepo.Revoke(ctx, token.Token); err != nil {
		return nil, err
	}

	// 生成新令牌
	accessToken, err := s.jwtManager.GenerateAccessToken(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, err
	}

	refreshToken, expiresAt, err := s.jwtManager.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	// 存储新的刷新令牌
	newToken := &model.RefreshToken{
		Token:     refreshToken,
		UserID:    user.ID,
		ExpiresAt: expiresAt,
	}
	if err := s.refreshTokenRepo.Create(ctx, newToken); err != nil {
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

func (s *authService) generateTokens(ctx context.Context, user *model.User) (*response.AuthResponse, error) {
	// 生成访问令牌
	accessToken, err := s.jwtManager.GenerateAccessToken(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, err
	}

	// 生成刷新令牌
	refreshToken, expiresAt, err := s.jwtManager.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	// 存储刷新令牌
	token := &model.RefreshToken{
		Token:     refreshToken,
		UserID:    user.ID,
		ExpiresAt: expiresAt,
	}
	if err := s.refreshTokenRepo.Create(ctx, token); err != nil {
		return nil, err
	}

	return &response.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.accessDuration.Seconds()),
		User:         toUserResponse(user),
	}, nil
}

func toUserResponse(user *model.User) *response.UserResponse {
	return &response.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Nickname:  user.Nickname,
		AvatarURL: user.AvatarURL,
		Bio:       user.Bio,
		GitHubURL: user.GitHubURL,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	}
}
