package service

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"gin-quickstart/internal/dto/response"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/pkg/slug"
)

// TagService 标签业务逻辑接口
type TagService interface {
	Create(ctx context.Context, name, customSlug string) (*response.TagResponse, error)
	GetByID(ctx context.Context, id uint) (*response.TagResponse, error)
	GetBySlug(ctx context.Context, slug string) (*response.TagResponse, error)
	GetList(ctx context.Context) (*response.TagListResponse, error)
	Update(ctx context.Context, id uint, name, customSlug string) (*response.TagResponse, error)
	Delete(ctx context.Context, id uint) error
}

// tagService 标签服务实现
type tagService struct {
	tagRepo tagRepository
}

// NewTagService 创建标签服务
func NewTagService(tagRepo tagRepository) TagService {
	return &tagService{tagRepo: tagRepo}
}

func (s *tagService) Create(ctx context.Context, name, customSlug string) (*response.TagResponse, error) {
	// 检查名称唯一性
	if s.tagRepo.ExistsByName(ctx, name) {
		return nil, ErrTagAlreadyExists
	}

	// 生成或使用自定义 slug
	tagSlug := customSlug
	if tagSlug == "" {
		// 没有提供 slug，从名称自动生成
		tagSlug = slug.Generate(name)
	} else {
		// 提供了自定义 slug，进行格式化处理
		tagSlug = slug.Generate(tagSlug)
	}

	// 检查 slug 唯一性
	if s.tagRepo.ExistsBySlug(ctx, tagSlug) {
		tagSlug = slug.GenerateWithTimestamp(name)
	}

	tag := &model.Tag{
		Name: name,
		Slug: tagSlug,
	}

	if err := s.tagRepo.Create(ctx, tag); err != nil {
		return nil, err
	}

	return toTagResponse(tag, 0), nil
}

func (s *tagService) GetByID(ctx context.Context, id uint) (*response.TagResponse, error) {
	tag, err := s.tagRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTagNotFound
		}
		return nil, err
	}

	articleCount := s.tagRepo.CountArticles(ctx, id)
	return toTagResponse(tag, articleCount), nil
}

func (s *tagService) GetBySlug(ctx context.Context, tagSlug string) (*response.TagResponse, error) {
	tag, err := s.tagRepo.FindBySlug(ctx, tagSlug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTagNotFound
		}
		return nil, err
	}

	articleCount := s.tagRepo.CountArticles(ctx, tag.ID)
	return toTagResponse(tag, articleCount), nil
}

func (s *tagService) GetList(ctx context.Context) (*response.TagListResponse, error) {
	tags, err := s.tagRepo.FindAllWithCount(ctx)
	if err != nil {
		return nil, err
	}

	items := make([]*response.TagResponse, len(tags))
	for i, t := range tags {
		items[i] = &response.TagResponse{
			ID:           t.ID,
			Name:         t.Name,
			Slug:         t.Slug,
			ArticleCount: t.ArticleCount,
		}
	}

	return &response.TagListResponse{Items: items}, nil
}

func (s *tagService) Update(ctx context.Context, id uint, name, customSlug string) (*response.TagResponse, error) {
	tag, err := s.tagRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTagNotFound
		}
		return nil, err
	}

	// 更新字段
	if name != "" {
		// 检查名称唯一性
		if name != tag.Name && s.tagRepo.ExistsByName(ctx, name) {
			return nil, ErrTagAlreadyExists
		}
		tag.Name = name
	}
	// 更新 slug（仅当提供了新 slug 时）
	if customSlug != "" {
		newSlug := slug.Generate(customSlug)
		if newSlug != tag.Slug && s.tagRepo.ExistsBySlug(ctx, newSlug) {
			newSlug = slug.GenerateWithTimestamp(customSlug)
		}
		tag.Slug = newSlug
	}

	if err := s.tagRepo.Update(ctx, tag); err != nil {
		return nil, err
	}

	articleCount := s.tagRepo.CountArticles(ctx, id)
	return toTagResponse(tag, articleCount), nil
}

func (s *tagService) Delete(ctx context.Context, id uint) error {
	return s.tagRepo.Delete(ctx, id)
}

func toTagResponse(tag *model.Tag, articleCount int) *response.TagResponse {
	return &response.TagResponse{
		ID:           tag.ID,
		Name:         tag.Name,
		Slug:         tag.Slug,
		ArticleCount: articleCount,
		CreatedAt:    tag.CreatedAt,
		UpdatedAt:    tag.UpdatedAt,
	}
}