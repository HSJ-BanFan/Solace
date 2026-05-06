package repository

import (
	"context"
	"time"

	"gin-quickstart/internal/model"
	"gin-quickstart/internal/pkg/logger"
	"gorm.io/gorm"
)

// momentRepo 说说仓储实现
type momentRepo struct {
	db *gorm.DB
}

// NewMomentRepository 创建说说仓储
func NewMomentRepository(db *gorm.DB) MomentRepository {
	return &momentRepo{db: db}
}

func (r *momentRepo) FindByID(ctx context.Context, id uint) (*model.Moment, error) {
	start := time.Now()
	var moment model.Moment
	err := r.db.WithContext(ctx).First(&moment, id).Error
	if err != nil {
		logger.Debug().Err(err).Uint("moment_id", id).Dur("duration", time.Since(start)).Msg("FindByID 失败")
		return nil, err
	}
	logger.Debug().Uint("moment_id", id).Dur("duration", time.Since(start)).Msg("FindByID 成功")
	return &moment, nil
}

func (r *momentRepo) FindAll(ctx context.Context, limit, offset int) ([]*model.Moment, int64, error) {
	start := time.Now()
	var moments []*model.Moment
	var total int64

	if err := r.db.WithContext(ctx).Model(&model.Moment{}).Count(&total).Error; err != nil {
		logger.Error().Err(err).Dur("duration", time.Since(start)).Msg("FindAll 统计失败")
		return nil, 0, err
	}

	if err := r.db.WithContext(ctx).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&moments).Error; err != nil {
		logger.Error().Err(err).Dur("duration", time.Since(start)).Msg("FindAll 查询失败")
		return nil, 0, err
	}

	logger.Debug().Int("count", len(moments)).Int64("total", total).Dur("duration", time.Since(start)).Msg("FindAll 成功")
	return moments, total, nil
}

func (r *momentRepo) Create(ctx context.Context, moment *model.Moment) error {
	start := time.Now()
	err := r.db.WithContext(ctx).Create(moment).Error
	if err != nil {
		logger.Error().Err(err).Str("content", moment.Content).Dur("duration", time.Since(start)).Msg("Create 说说失败")
		return err
	}
	logger.Debug().Uint("moment_id", moment.ID).Dur("duration", time.Since(start)).Msg("Create 说说成功")
	return nil
}

func (r *momentRepo) Delete(ctx context.Context, id uint) error {
	start := time.Now()
	err := r.db.WithContext(ctx).Delete(&model.Moment{}, id).Error
	if err != nil {
		logger.Error().Err(err).Uint("moment_id", id).Dur("duration", time.Since(start)).Msg("Delete 说说失败")
		return err
	}
	logger.Debug().Uint("moment_id", id).Dur("duration", time.Since(start)).Msg("Delete 说说成功")
	return nil
}
