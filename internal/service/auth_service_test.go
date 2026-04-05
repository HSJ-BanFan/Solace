package service

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"gin-quickstart/internal/dto/request"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/pkg/jwt"
)

// MockRefreshTokenRepository 刷新令牌仓储模拟
type MockRefreshTokenRepository struct {
	mock.Mock
}

func (m *MockRefreshTokenRepository) Create(ctx context.Context, token *model.RefreshToken) error {
	args := m.Called(ctx, token)
	return args.Error(0)
}

func (m *MockRefreshTokenRepository) FindByToken(ctx context.Context, tokenString string) (*model.RefreshToken, error) {
	args := m.Called(ctx, tokenString)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.RefreshToken), args.Error(1)
}

func (m *MockRefreshTokenRepository) FindByUserID(ctx context.Context, userID uint) ([]*model.RefreshToken, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]*model.RefreshToken), args.Error(1)
}

func (m *MockRefreshTokenRepository) Revoke(ctx context.Context, tokenString string) error {
	args := m.Called(ctx, tokenString)
	return args.Error(0)
}

func (m *MockRefreshTokenRepository) RevokeAllByUserID(ctx context.Context, userID uint) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *MockRefreshTokenRepository) DeleteExpired(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

// MockJWTManager JWT 管理器模拟
type MockJWTManager struct {
	mock.Mock
}

func (m *MockJWTManager) GenerateAccessToken(userID uint, username, role string) (string, error) {
	args := m.Called(userID, username, role)
	return args.String(0), args.Error(1)
}

func (m *MockJWTManager) GenerateRefreshToken(userID uint) (string, time.Time, error) {
	args := m.Called(userID)
	return args.String(0), args.Get(1).(time.Time), args.Error(2)
}

func (m *MockJWTManager) ValidateAccessToken(tokenString string) (*jwt.Claims, error) {
	args := m.Called(tokenString)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*jwt.Claims), args.Error(1)
}

func (m *MockJWTManager) ValidateRefreshToken(tokenString string) error {
	args := m.Called(tokenString)
	return args.Error(0)
}

// 测试认证服务 - Register
func TestAuthService_Register_Success(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	req := &request.RegisterRequest{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "password123",
	}

	mockUserRepo.On("ExistsByEmail", mock.Anything, "test@example.com").Return(false)
	mockUserRepo.On("ExistsByUsername", mock.Anything, "testuser").Return(false)
	mockUserRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.User")).Return(nil).Run(func(args mock.Arguments) {
		user := args.Get(1).(*model.User)
		user.ID = 1 // 设置生成的 ID
	})
	mockTokenRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.RefreshToken")).Return(nil)

	resp, err := service.Register(context.Background(), req)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.NotEmpty(t, resp.AccessToken)
	assert.NotEmpty(t, resp.RefreshToken)
	assert.Equal(t, "testuser", resp.User.Username)
	mockUserRepo.AssertExpectations(t)
	mockTokenRepo.AssertExpectations(t)
}

func TestAuthService_Register_EmailExists(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	req := &request.RegisterRequest{
		Username: "testuser",
		Email:    "existing@example.com",
		Password: "password123",
	}

	mockUserRepo.On("ExistsByEmail", mock.Anything, "existing@example.com").Return(true)

	resp, err := service.Register(context.Background(), req)

	assert.Error(t, err)
	assert.Equal(t, ErrUserAlreadyExists, err)
	assert.Nil(t, resp)
	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_Register_UsernameExists(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	req := &request.RegisterRequest{
		Username: "existinguser",
		Email:    "test@example.com",
		Password: "password123",
	}

	mockUserRepo.On("ExistsByEmail", mock.Anything, "test@example.com").Return(false)
	mockUserRepo.On("ExistsByUsername", mock.Anything, "existinguser").Return(true)

	resp, err := service.Register(context.Background(), req)

	assert.Error(t, err)
	assert.Equal(t, ErrUserAlreadyExists, err)
	assert.Nil(t, resp)
	mockUserRepo.AssertExpectations(t)
}

// 测试认证服务 - Login
func TestAuthService_Login_Success(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	// 生成真实的 bcrypt 哈希密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("生成密码哈希失败: %v", err)
	}

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	req := &request.LoginRequest{
		Email:    "test@example.com",
		Password: "password123",
	}

	mockUserRepo.On("FindByEmail", mock.Anything, "test@example.com").Return(&model.User{
		ID:           1,
		Email:        "test@example.com",
		PasswordHash: string(hashedPassword),
		Username:     "testuser",
		Role:         "user",
	}, nil)
	mockTokenRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.RefreshToken")).Return(nil)

	resp, err := service.Login(context.Background(), req)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.NotEmpty(t, resp.AccessToken)
	mockUserRepo.AssertExpectations(t)
	mockTokenRepo.AssertExpectations(t)
}

func TestAuthService_Login_UserNotFound(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	req := &request.LoginRequest{
		Email:    "nonexistent@example.com",
		Password: "password123",
	}

	mockUserRepo.On("FindByEmail", mock.Anything, "nonexistent@example.com").Return(nil, gorm.ErrRecordNotFound)

	resp, err := service.Login(context.Background(), req)

	assert.Error(t, err)
	assert.Equal(t, ErrInvalidCredentials, err)
	assert.Nil(t, resp)
	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_Login_WrongPassword(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	// 生成真实的 bcrypt 哈希密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("生成密码哈希失败: %v", err)
	}

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	req := &request.LoginRequest{
		Email:    "test@example.com",
		Password: "wrongpassword",
	}

	mockUserRepo.On("FindByEmail", mock.Anything, "test@example.com").Return(&model.User{
		ID:           1,
		Email:        "test@example.com",
		PasswordHash: string(hashedPassword),
	}, nil)

	resp, err := service.Login(context.Background(), req)

	assert.Error(t, err)
	assert.Equal(t, ErrInvalidCredentials, err)
	assert.Nil(t, resp)
	mockUserRepo.AssertExpectations(t)
}

// 测试认证服务 - Logout
func TestAuthService_Logout_Success(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	token := &model.RefreshToken{
		Token:     "refresh-token",
		UserID:    1,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	mockTokenRepo.On("FindByToken", mock.Anything, "refresh-token").Return(token, nil)
	mockTokenRepo.On("Revoke", mock.Anything, "refresh-token").Return(nil)

	err := service.Logout(context.Background(), "refresh-token")

	assert.NoError(t, err)
	mockTokenRepo.AssertExpectations(t)
}

func TestAuthService_Logout_TokenNotFound(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	mockTokenRepo.On("FindByToken", mock.Anything, "invalid-token").Return(nil, gorm.ErrRecordNotFound)

	err := service.Logout(context.Background(), "invalid-token")

	// Token 不存在视为已登出
	assert.NoError(t, err)
	mockTokenRepo.AssertExpectations(t)
}

// 测试认证服务 - Refresh
func TestAuthService_Refresh_Success(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	// 生成一个有效的刷新令牌
	refreshToken, _, _ := jwtManager.GenerateRefreshToken(1)

	req := &request.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	storedToken := &model.RefreshToken{
		Token:     refreshToken,
		UserID:    1,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Revoked:   false,
	}

	mockTokenRepo.On("FindByToken", mock.Anything, refreshToken).Return(storedToken, nil)
	mockUserRepo.On("FindByID", mock.Anything, uint(1)).Return(&model.User{
		ID:       1,
		Username: "testuser",
		Role:     "user",
	}, nil)
	mockTokenRepo.On("Revoke", mock.Anything, refreshToken).Return(nil)
	mockTokenRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.RefreshToken")).Return(nil)

	resp, err := service.Refresh(context.Background(), req)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.NotEmpty(t, resp.AccessToken)
	assert.NotEmpty(t, resp.RefreshToken)
	mockTokenRepo.AssertExpectations(t)
	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_Refresh_TokenRevoked(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	refreshToken, _, _ := jwtManager.GenerateRefreshToken(1)

	req := &request.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	storedToken := &model.RefreshToken{
		Token:     refreshToken,
		UserID:    1,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Revoked:   true, // 已撤销
	}

	mockTokenRepo.On("FindByToken", mock.Anything, refreshToken).Return(storedToken, nil)

	resp, err := service.Refresh(context.Background(), req)

	assert.Error(t, err)
	assert.Equal(t, ErrTokenRevoked, err)
	assert.Nil(t, resp)
	mockTokenRepo.AssertExpectations(t)
}

func TestAuthService_Refresh_TokenExpired(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	refreshToken, _, _ := jwtManager.GenerateRefreshToken(1)

	req := &request.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	storedToken := &model.RefreshToken{
		Token:     refreshToken,
		UserID:    1,
		ExpiresAt: time.Now().Add(-1 * time.Hour), // 已过期
		Revoked:   false,
	}

	mockTokenRepo.On("FindByToken", mock.Anything, refreshToken).Return(storedToken, nil)

	resp, err := service.Refresh(context.Background(), req)

	assert.Error(t, err)
	assert.Equal(t, ErrTokenRevoked, err)
	assert.Nil(t, resp)
	mockTokenRepo.AssertExpectations(t)
}

// 测试认证服务 - ValidateAccessToken
func TestAuthService_ValidateAccessToken_Success(t *testing.T) {
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	// 生成访问令牌
	accessToken, _ := jwtManager.GenerateAccessToken(1, "testuser", "user")

	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	claims, err := service.ValidateAccessToken(accessToken)

	assert.NoError(t, err)
	assert.NotNil(t, claims)
	assert.Equal(t, uint(1), claims.UserID)
	assert.Equal(t, "testuser", claims.Username)
	assert.Equal(t, "user", claims.Role)
}

func TestAuthService_ValidateAccessToken_Invalid(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockTokenRepo := new(MockRefreshTokenRepository)
	jwtManager := jwt.NewJWTManager("test-secret", 15*time.Minute, 24*time.Hour)

	service := NewAuthService(
		mockUserRepo,
		mockTokenRepo,
		jwtManager,
		15*time.Minute,
	)

	claims, err := service.ValidateAccessToken("invalid-token")

	assert.Error(t, err)
	assert.Nil(t, claims)
}