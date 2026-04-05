package service

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"

	"gin-quickstart/internal/dto/request"
	"gin-quickstart/internal/model"
)

// MockUserRepository 用户仓储模拟
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) FindByID(ctx context.Context, id uint) (*model.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) FindByUsername(ctx context.Context, username string) (*model.User, error) {
	args := m.Called(ctx, username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) Create(ctx context.Context, user *model.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) Update(ctx context.Context, user *model.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserRepository) ExistsByEmail(ctx context.Context, email string) bool {
	args := m.Called(ctx, email)
	return args.Bool(0)
}

func (m *MockUserRepository) ExistsByUsername(ctx context.Context, username string) bool {
	args := m.Called(ctx, username)
	return args.Bool(0)
}

// 测试用户服务 - GetByID
func TestUserService_GetByID_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	expectedUser := &model.User{
		ID:       1,
		Username: "testuser",
		Email:    "test@example.com",
		Role:     "user",
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(expectedUser, nil)

	user, err := service.GetByID(context.Background(), 1)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser.ID, user.ID)
	assert.Equal(t, expectedUser.Username, user.Username)
	mockRepo.AssertExpectations(t)
}

func TestUserService_GetByID_NotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(nil, gorm.ErrRecordNotFound)

	user, err := service.GetByID(context.Background(), 1)

	assert.Error(t, err)
	assert.Equal(t, ErrUserNotFound, err)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

// 测试用户服务 - GetMe
func TestUserService_GetMe_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	expectedUser := &model.User{
		ID:       1,
		Username: "testuser",
		Email:    "test@example.com",
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(expectedUser, nil)

	user, err := service.GetMe(context.Background(), 1)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser.ID, user.ID)
	mockRepo.AssertExpectations(t)
}

func TestUserService_GetMe_NotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(nil, gorm.ErrRecordNotFound)

	user, err := service.GetMe(context.Background(), 1)

	assert.Error(t, err)
	assert.Equal(t, ErrUserNotFound, err)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

// 测试用户服务 - UpdateMe
func TestUserService_UpdateMe_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	existingUser := &model.User{
		ID:       1,
		Username: "testuser",
		Email:    "test@example.com",
	}

	req := &request.UpdateUserRequest{
		Nickname:  "新昵称",
		AvatarURL: "https://example.com/avatar.png",
		Bio:       "个人简介",
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingUser, nil)
	mockRepo.On("Update", mock.Anything, existingUser).Return(nil)

	user, err := service.UpdateMe(context.Background(), 1, req)

	assert.NoError(t, err)
	assert.Equal(t, "新昵称", user.Nickname)
	assert.Equal(t, "https://example.com/avatar.png", user.AvatarURL)
	assert.Equal(t, "个人简介", user.Bio)
	mockRepo.AssertExpectations(t)
}

func TestUserService_UpdateMe_UserNotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	req := &request.UpdateUserRequest{
		Nickname: "新昵称",
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(nil, gorm.ErrRecordNotFound)

	user, err := service.UpdateMe(context.Background(), 1, req)

	assert.Error(t, err)
	assert.Equal(t, ErrUserNotFound, err)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

// 测试用户服务 - 部分更新
func TestUserService_UpdateMe_PartialUpdate(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	existingUser := &model.User{
		ID:       1,
		Username: "testuser",
		Email:    "test@example.com",
		Nickname: "旧昵称",
		Bio:      "旧简介",
	}

	req := &request.UpdateUserRequest{
		Nickname: "新昵称",
		// Bio 和 AvatarURL 不更新
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingUser, nil)
	mockRepo.On("Update", mock.Anything, existingUser).Return(nil)

	user, err := service.UpdateMe(context.Background(), 1, req)

	assert.NoError(t, err)
	assert.Equal(t, "新昵称", user.Nickname)
	assert.Equal(t, "旧简介", existingUser.Bio) // Bio 保持不变
	mockRepo.AssertExpectations(t)
}