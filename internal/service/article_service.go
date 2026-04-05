package service

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"gin-quickstart/internal/dto/response"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/pkg/slug"
)

var (
	ErrArticleNotFound        = errors.New("文章未找到")
	ErrArticleNotAuthorized   = errors.New("无权修改此文章")
	ErrArticleVersionConflict = errors.New("文章版本冲突，请刷新后重试")
	ErrArticleAlreadyDeleted  = errors.New("文章已被删除")
)

// ArticleService 文章业务逻辑接口
type ArticleService interface {
	Create(ctx context.Context, title, content, summary string, status string, authorID uint) (*response.ArticleResponse, error)
	GetByID(ctx context.Context, id uint) (*response.ArticleResponse, error)
	GetBySlug(ctx context.Context, slug string) (*response.ArticleResponse, error)
	GetList(ctx context.Context, page, pageSize int, status string, authorID *uint) (*response.ArticleListResponse, error)
	Update(ctx context.Context, id uint, userID uint, version int, title, content, summary, status string) (*response.ArticleResponse, error)
	Delete(ctx context.Context, id uint, userID uint) error
}

// articleRepository 文章数据访问接口
type articleRepository interface {
	FindByID(ctx context.Context, id uint) (*model.Article, error)
	FindBySlug(ctx context.Context, slug string) (*model.Article, error)
	FindAll(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]*model.Article, int64, error)
	Create(ctx context.Context, article *model.Article) error
	Update(ctx context.Context, article *model.Article) error
	Delete(ctx context.Context, id uint) error
	IncrementViewCount(ctx context.Context, id uint) error
}

// articleService 文章服务实现
type articleService struct {
	articleRepo articleRepository
}

// NewArticleService 创建文章服务
func NewArticleService(articleRepo articleRepository) ArticleService {
	return &articleService{articleRepo: articleRepo}
}

func (s *articleService) Create(ctx context.Context, title, content, summary string, status string, authorID uint) (*response.ArticleResponse, error) {
	// 生成 slug
	articleSlug := slug.Generate(title)

	// 检查 slug 唯一性
	existing, err := s.articleRepo.FindBySlug(ctx, articleSlug)
	if err == nil && existing != nil {
		// slug 已存在，生成带时间戳的唯一 slug
		articleSlug = slug.GenerateWithTimestamp(title)
	}

	now := time.Now()
	article := &model.Article{
		Title:    title,
		Slug:     articleSlug,
		Content:  content,
		Summary:  summary,
		AuthorID: authorID,
		Status:   status,
		Version:  1,
	}

	// 如果状态为已发布，设置发布时间
	if status == model.StatusPublished {
		article.PublishedAt = &now
	}

	if err := s.articleRepo.Create(ctx, article); err != nil {
		return nil, err
	}

	// 获取带作者信息的文章
	article, err = s.articleRepo.FindByID(ctx, article.ID)
	if err != nil {
		return nil, err
	}

	return toArticleResponse(article), nil
}

func (s *articleService) GetByID(ctx context.Context, id uint) (*response.ArticleResponse, error) {
	article, err := s.articleRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrArticleNotFound
		}
		return nil, err
	}

	// 异步增加浏览量
	go func() {
		_ = s.articleRepo.IncrementViewCount(context.Background(), id)
	}()

	return toArticleResponse(article), nil
}

func (s *articleService) GetBySlug(ctx context.Context, articleSlug string) (*response.ArticleResponse, error) {
	article, err := s.articleRepo.FindBySlug(ctx, articleSlug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrArticleNotFound
		}
		return nil, err
	}

	return toArticleResponse(article), nil
}

func (s *articleService) GetList(ctx context.Context, page, pageSize int, status string, authorID *uint) (*response.ArticleListResponse, error) {
	filters := make(map[string]interface{})
	if status != "" {
		filters["status"] = status
	}
	if authorID != nil {
		filters["author_id"] = *authorID
	}

	offset := (page - 1) * pageSize
	articles, total, err := s.articleRepo.FindAll(ctx, pageSize, offset, filters)
	if err != nil {
		return nil, err
	}

	items := make([]*response.ArticleResponse, len(articles))
	for i, article := range articles {
		items[i] = toArticleResponse(article)
	}

	return &response.ArticleListResponse{
		Items:    items,
		Page:     page,
		PageSize: pageSize,
		Total:    total,
	}, nil
}

func (s *articleService) Update(ctx context.Context, id uint, userID uint, version int, title, content, summary, status string) (*response.ArticleResponse, error) {
	article, err := s.articleRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrArticleNotFound
		}
		return nil, err
	}

	// 检查权限
	if article.AuthorID != userID {
		return nil, ErrArticleNotAuthorized
	}

	// 乐观锁检查
	if article.Version != version {
		return nil, ErrArticleVersionConflict
	}

	// 更新字段
	if title != "" {
		article.Title = title
		// 标题变更时更新 slug
		newSlug := slug.Generate(title)
		if newSlug != article.Slug {
			// 检查唯一性
			existing, err := s.articleRepo.FindBySlug(ctx, newSlug)
			if err == nil && existing != nil && existing.ID != article.ID {
				newSlug = slug.GenerateWithTimestamp(title)
			}
			article.Slug = newSlug
		}
	}
	if content != "" {
		article.Content = content
	}
	if summary != "" {
		article.Summary = summary
	}

	// 处理状态变更
	if status != "" && status != article.Status {
		article.Status = status
		if status == model.StatusPublished && article.PublishedAt == nil {
			now := time.Now()
			article.PublishedAt = &now
		}
	}

	// 递增版本号
	article.Version++

	if err := s.articleRepo.Update(ctx, article); err != nil {
		return nil, err
	}

	// 获取更新后的文章
	article, err = s.articleRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return toArticleResponse(article), nil
}

func (s *articleService) Delete(ctx context.Context, id uint, userID uint) error {
	article, err := s.articleRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrArticleNotFound
		}
		return err
	}

	// 检查权限
	if article.AuthorID != userID {
		return ErrArticleNotAuthorized
	}

	return s.articleRepo.Delete(ctx, id)
}

func toArticleResponse(article *model.Article) *response.ArticleResponse {
	resp := &response.ArticleResponse{
		ID:          article.ID,
		Title:       article.Title,
		Slug:        article.Slug,
		Content:     article.Content,
		Summary:     article.Summary,
		CoverImage:  article.CoverImage,
		AuthorID:    article.AuthorID,
		Status:      article.Status,
		ViewCount:   article.ViewCount,
		IsTop:       article.IsTop,
		Version:     article.Version,
		PublishedAt: article.PublishedAt,
		CreatedAt:   article.CreatedAt,
		UpdatedAt:   article.UpdatedAt,
	}

	if article.Author != nil {
		resp.Author = toUserResponse(article.Author)
	}

	return resp
}