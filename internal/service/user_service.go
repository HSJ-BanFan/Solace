package service

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"gin-quickstart/internal/dto/request"
	"gin-quickstart/internal/dto/response"
	"gin-quickstart/internal/repository"
)

var (
	ErrUserNotFound = errors.New("用户未找到")
)

// UserService 用户业务逻辑接口
type UserService interface {
	GetByID(ctx context.Context, id uint) (*response.UserResponse, error)
	GetMe(ctx context.Context, userID uint) (*response.UserResponse, error)
	UpdateMe(ctx context.Context, userID uint, req *request.UpdateUserRequest) (*response.UserResponse, error)
}

// userService 用户服务实现
type userService struct {
	userRepo repository.UserRepository
}

// NewUserService 创建用户服务
func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) GetByID(ctx context.Context, id uint) (*response.UserResponse, error) {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return toUserResponse(user), nil
}

func (s *userService) GetMe(ctx context.Context, userID uint) (*response.UserResponse, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return toUserResponse(user), nil
}

func (s *userService) UpdateMe(ctx context.Context, userID uint, req *request.UpdateUserRequest) (*response.UserResponse, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	// 更新字段
	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}
	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}
	if req.Bio != "" {
		user.Bio = req.Bio
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	return toUserResponse(user), nil
}