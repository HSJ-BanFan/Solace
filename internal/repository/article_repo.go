package repository

import (
	"context"

	"gin-quickstart/internal/model"
	"gorm.io/gorm"
)

// articleRepo 文章仓储实现
type articleRepo struct {
	db *gorm.DB
}

// NewArticleRepository 创建文章仓储
func NewArticleRepository(db *gorm.DB) ArticleRepository {
	return &articleRepo{db: db}
}

func (r *articleRepo) FindByID(ctx context.Context, id uint) (*model.Article, error) {
	var article model.Article
	err := r.db.WithContext(ctx).
		Preload("Author").
		First(&article, id).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *articleRepo) FindBySlug(ctx context.Context, slug string) (*model.Article, error) {
	var article model.Article
	err := r.db.WithContext(ctx).
		Preload("Author").
		Where("slug = ?", slug).
		First(&article).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *articleRepo) FindAll(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]*model.Article, int64, error) {
	var articles []*model.Article
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Article{}).Preload("Author")

	// 应用筛选条件
	if status, ok := filters["status"]; ok {
		query = query.Where("status = ?", status)
	}
	if authorID, ok := filters["author_id"]; ok {
		query = query.Where("author_id = ?", authorID)
	}

	// 统计总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取分页结果
	if err := query.Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&articles).Error; err != nil {
		return nil, 0, err
	}

	return articles, total, nil
}

func (r *articleRepo) Create(ctx context.Context, article *model.Article) error {
	return r.db.WithContext(ctx).Create(article).Error
}

func (r *articleRepo) Update(ctx context.Context, article *model.Article) error {
	return r.db.WithContext(ctx).Save(article).Error
}

func (r *articleRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&model.Article{}, id).Error
}

func (r *articleRepo) IncrementViewCount(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Model(&model.Article{}).
		Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}
