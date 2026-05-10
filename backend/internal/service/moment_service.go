package service

import (
	"context"
	stderrors "errors"
	"html"
	"strings"
	"time"

	"gorm.io/gorm"

	"gin-quickstart/internal/dto/response"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/pkg/errors"
	"gin-quickstart/internal/pkg/logger"
)

var ErrMomentNotFound = errors.NewNotFound("说说未找到")

// MomentService 说说业务逻辑接口
type MomentService interface {
	Create(ctx context.Context, content string) (*response.MomentResponse, error)
	GetByID(ctx context.Context, id uint) (*response.MomentResponse, error)
	GetList(ctx context.Context, page, pageSize int) (*response.MomentListResponse, error)
	Delete(ctx context.Context, id uint) error
}

// momentRepository 说说数据访问接口
type momentRepository interface {
	FindByID(ctx context.Context, id uint) (*model.Moment, error)
	FindAll(ctx context.Context, limit, offset int) ([]*model.Moment, int64, error)
	GetContributions(ctx context.Context, from, to time.Time) ([]*model.Moment, error)
	Create(ctx context.Context, moment *model.Moment) error
	Delete(ctx context.Context, id uint) error
}

// momentService 说说服务实现
type momentService struct {
	momentRepo momentRepository
}

// NewMomentService 创建说说服务
func NewMomentService(momentRepo momentRepository) MomentService {
	return &momentService{momentRepo: momentRepo}
}

func (s *momentService) Create(ctx context.Context, content string) (*response.MomentResponse, error) {
	log := logger.WithContext(ctx)

	log.Info().Str("content", content).Msg("创建说说开始")

	trimmedContent := strings.TrimSpace(content)
	if trimmedContent == "" {
		log.Warn().Msg("说说内容为空")
		return nil, errors.NewBadRequest("内容不能为空", nil)
	}

	moment := &model.Moment{
		Content: html.EscapeString(trimmedContent),
	}

	if err := s.momentRepo.Create(ctx, moment); err != nil {
		log.Error().Err(err).Msg("创建说说失败")
		return nil, err
	}

	log.Info().Uint("moment_id", moment.ID).Msg("说说创建成功")

	return toMomentResponse(moment), nil
}

func (s *momentService) GetByID(ctx context.Context, id uint) (*response.MomentResponse, error) {
	log := logger.WithContext(ctx)

	moment, err := s.momentRepo.FindByID(ctx, id)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			log.Warn().Uint("moment_id", id).Msg("说说不存在")
			return nil, ErrMomentNotFound
		}
		log.Error().Err(err).Uint("moment_id", id).Msg("获取说说失败")
		return nil, err
	}

	log.Debug().Uint("moment_id", id).Msg("获取说说成功")
	return toMomentResponse(moment), nil
}

func (s *momentService) GetList(ctx context.Context, page, pageSize int) (*response.MomentListResponse, error) {
	log := logger.WithContext(ctx)

	offset := (page - 1) * pageSize

	moments, total, err := s.momentRepo.FindAll(ctx, pageSize, offset)
	if err != nil {
		log.Error().Err(err).Msg("获取说说列表失败")
		return nil, err
	}

	items := make([]*response.MomentResponse, len(moments))
	for i, moment := range moments {
		items[i] = toMomentResponse(moment)
	}

	log.Debug().Int("count", len(moments)).Int64("total", total).Msg("获取说说列表成功")

	return &response.MomentListResponse{
		Items:    items,
		Page:     page,
		PageSize: pageSize,
		Total:    total,
	}, nil
}

func (s *momentService) Delete(ctx context.Context, id uint) error {
	log := logger.WithContext(ctx)

	log.Info().Uint("moment_id", id).Msg("删除说说开始")

	_, err := s.momentRepo.FindByID(ctx, id)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			log.Warn().Uint("moment_id", id).Msg("说说不存在")
			return ErrMomentNotFound
		}
		log.Error().Err(err).Uint("moment_id", id).Msg("获取说说失败")
		return err
	}

	if err := s.momentRepo.Delete(ctx, id); err != nil {
		log.Error().Err(err).Uint("moment_id", id).Msg("删除说说失败")
		return err
	}

	log.Info().Uint("moment_id", id).Msg("说说删除成功")
	return nil
}

func toMomentResponse(moment *model.Moment) *response.MomentResponse {
	return &response.MomentResponse{
		ID:        moment.ID,
		Content:   moment.Content,
		CreatedAt: moment.CreatedAt,
	}
}
