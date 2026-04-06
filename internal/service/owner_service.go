package service

import (
	"context"

	"gin-quickstart/internal/dto/response"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/pkg/hash"
	"gin-quickstart/internal/repository"
)

// OwnerService 站长服务接口
type OwnerService interface {
	GetOwner(ctx context.Context) (*response.OwnerResponse, error)
}

// ownerService 站长服务实现
type ownerService struct {
	userRepo repository.UserRepository
}

// NewOwnerService 创建站长服务
func NewOwnerService(userRepo repository.UserRepository) OwnerService {
	return &ownerService{userRepo: userRepo}
}

func (s *ownerService) GetOwner(ctx context.Context) (*response.OwnerResponse, error) {
	// 获取第一个用户（站长）
	users, err := s.userRepo.FindAll(ctx)
	if err != nil || len(users) == 0 {
		return nil, err
	}

	owner := users[0]
	return &response.OwnerResponse{
		Nickname:  owner.Nickname,
		AvatarURL: owner.AvatarURL,
		Bio:       owner.Bio,
		GitHubURL: owner.GitHubURL,
	}, nil
}

// InitAdminUser 初始化管理员用户
func InitAdminUser(userRepo repository.UserRepository, cfg AdminConfig) error {
	ctx := context.Background()

	// 检查用户是否已存在
	if userRepo.ExistsByUsername(ctx, cfg.Username) {
		// 用户已存在，更新信息
		user, err := userRepo.FindByUsername(ctx, cfg.Username)
		if err != nil {
			return err
		}
		user.Nickname = cfg.Nickname
		user.AvatarURL = cfg.AvatarURL
		user.Bio = cfg.Bio
		user.GitHubURL = cfg.GitHubURL
		return userRepo.Update(ctx, user)
	}

	// 创建新用户
	passwordHash, err := hash.HashPassword(cfg.Password)
	if err != nil {
		return err
	}

	user := &model.User{
		Username:     cfg.Username,
		Email:        cfg.Email,
		PasswordHash: passwordHash,
		Nickname:     cfg.Nickname,
		AvatarURL:    cfg.AvatarURL,
		Bio:          cfg.Bio,
		GitHubURL:    cfg.GitHubURL,
		Role:         model.RoleAdmin,
	}

	return userRepo.Create(ctx, user)
}

// AdminConfig 管理员配置
type AdminConfig struct {
	Username  string
	Email     string
	Password  string
	Nickname  string
	AvatarURL string
	Bio       string
	GitHubURL string
}

// UserRepository 需要添加 FindAll 方法
// 在 repository.go 中添加
