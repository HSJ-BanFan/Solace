package service

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"

	"gin-quickstart/internal/model"
)

// MockArticleRepository 文章仓储模拟
type MockArticleRepository struct {
	mock.Mock
}

func (m *MockArticleRepository) FindByID(ctx context.Context, id uint) (*model.Article, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Article), args.Error(1)
}

func (m *MockArticleRepository) FindBySlug(ctx context.Context, slug string) (*model.Article, error) {
	args := m.Called(ctx, slug)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Article), args.Error(1)
}

func (m *MockArticleRepository) FindAll(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]*model.Article, int64, error) {
	args := m.Called(ctx, limit, offset, filters)
	return args.Get(0).([]*model.Article), args.Get(1).(int64), args.Error(2)
}

func (m *MockArticleRepository) Create(ctx context.Context, article *model.Article) error {
	args := m.Called(ctx, article)
	return args.Error(0)
}

func (m *MockArticleRepository) Update(ctx context.Context, article *model.Article) error {
	args := m.Called(ctx, article)
	return args.Error(0)
}

func (m *MockArticleRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockArticleRepository) IncrementViewCount(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// 测试文章服务 - Create
func TestArticleService_Create_Success(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	mockRepo.On("FindBySlug", mock.Anything, "test-article").Return(nil, gorm.ErrRecordNotFound)
	mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.Article")).Return(nil)
	mockRepo.On("FindByID", mock.Anything, mock.AnythingOfType("uint")).Return(&model.Article{
		ID:      1,
		Title:   "Test Article",
		Slug:    "test-article",
		Content: "Content",
		Author:  &model.User{ID: 1, Username: "author"},
	}, nil)

	article, err := service.Create(context.Background(), "Test Article", "Content", "Summary", "draft", 1)

	assert.NoError(t, err)
	assert.NotNil(t, article)
	assert.Equal(t, "Test Article", article.Title)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_Create_SlugConflict(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	// 模拟 slug 冲突 - 返回已存在的文章
	existingArticle := &model.Article{ID: 2, Slug: "test-article"}
	mockRepo.On("FindBySlug", mock.Anything, "test-article").Return(existingArticle, nil)
	// 第二次调用 FindBySlug 会检查带时间戳的 slug（我们不关心具体值）
	mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.Article")).Return(nil).Run(func(args mock.Arguments) {
		article := args.Get(1).(*model.Article)
		// 验证生成的 slug 不是原来的冲突 slug
		assert.NotEqual(t, "test-article", article.Slug)
		assert.Contains(t, article.Slug, "test-article")
	})
	mockRepo.On("FindByID", mock.Anything, mock.AnythingOfType("uint")).Return(&model.Article{
		ID:      1,
		Title:   "Test Article",
		Content: "Content",
		Slug:    "test-article-123456", // 模拟带时间戳的 slug
	}, nil)

	article, err := service.Create(context.Background(), "Test Article", "Content", "", "draft", 1)

	assert.NoError(t, err)
	assert.NotNil(t, article)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_Create_PublishedArticle(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	mockRepo.On("FindBySlug", mock.Anything, mock.Anything).Return(nil, gorm.ErrRecordNotFound)
	mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.Article")).Return(nil).Run(func(args mock.Arguments) {
		article := args.Get(1).(*model.Article)
		article.ID = 1
		assert.Equal(t, "published", article.Status)
		assert.NotNil(t, article.PublishedAt)
	})
	mockRepo.On("FindByID", mock.Anything, mock.AnythingOfType("uint")).Return(&model.Article{
		ID:      1,
		Title:   "Test Article",
		Status:  "published",
	}, nil)

	article, err := service.Create(context.Background(), "Test Article", "Content", "", "published", 1)

	assert.NoError(t, err)
	assert.NotNil(t, article)
	mockRepo.AssertExpectations(t)
}

// 测试文章服务 - GetByID
func TestArticleService_GetByID_Success(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	expectedArticle := &model.Article{
		ID:      1,
		Title:   "Test Article",
		Content: "Content",
		Author:  &model.User{ID: 1, Username: "author"},
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(expectedArticle, nil)
	// IncrementViewCount 在 goroutine 中异步调用，使用 Maybe() 表示可选调用
	mockRepo.On("IncrementViewCount", mock.Anything, uint(1)).Return(nil).Maybe()

	article, err := service.GetByID(context.Background(), 1)

	assert.NoError(t, err)
	assert.Equal(t, expectedArticle.ID, article.ID)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_GetByID_NotFound(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(nil, gorm.ErrRecordNotFound)

	article, err := service.GetByID(context.Background(), 1)

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotFound, err)
	assert.Nil(t, article)
	mockRepo.AssertExpectations(t)
}

// 测试文章服务 - GetList
func TestArticleService_GetList_Success(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	articles := []*model.Article{
		{ID: 1, Title: "Article 1"},
		{ID: 2, Title: "Article 2"},
	}

	mockRepo.On("FindAll", mock.Anything, 10, 0, mock.Anything).Return(articles, int64(2), nil)

	result, err := service.GetList(context.Background(), 1, 10, "", nil)

	assert.NoError(t, err)
	assert.Len(t, result.Items, 2)
	assert.Equal(t, int64(2), result.Total)
	mockRepo.AssertExpectations(t)
}

// 测试文章服务 - GetBySlug
func TestArticleService_GetBySlug_Success(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	expectedArticle := &model.Article{
		ID:      1,
		Title:   "Test Article",
		Slug:    "test-article",
		Content: "Content",
		Author:  &model.User{ID: 1, Username: "author"},
	}

	mockRepo.On("FindBySlug", mock.Anything, "test-article").Return(expectedArticle, nil)

	article, err := service.GetBySlug(context.Background(), "test-article")

	assert.NoError(t, err)
	assert.Equal(t, expectedArticle.ID, article.ID)
	assert.Equal(t, "test-article", article.Slug)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_GetBySlug_NotFound(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	mockRepo.On("FindBySlug", mock.Anything, "nonexistent").Return(nil, gorm.ErrRecordNotFound)

	article, err := service.GetBySlug(context.Background(), "nonexistent")

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotFound, err)
	assert.Nil(t, article)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_GetList_WithFilters(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	articles := []*model.Article{
		{ID: 1, Title: "Article 1", Status: "published"},
	}
	authorID := uint(1)

	mockRepo.On("FindAll", mock.Anything, 10, 0, map[string]interface{}{
		"status":    "published",
		"author_id": authorID,
	}).Return(articles, int64(1), nil)

	result, err := service.GetList(context.Background(), 1, 10, "published", &authorID)

	assert.NoError(t, err)
	assert.Len(t, result.Items, 1)
	mockRepo.AssertExpectations(t)
}

// 测试文章服务 - Update
func TestArticleService_Update_Success(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	existingArticle := &model.Article{
		ID:       1,
		Title:    "Old Title",
		Slug:     "old-title",
		Content:  "Old Content",
		AuthorID: 1,
		Version:  1,
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil).Twice()
	// Update 时检查新 slug 的唯一性
	mockRepo.On("FindBySlug", mock.Anything, "new-title").Return(nil, gorm.ErrRecordNotFound)
	mockRepo.On("Update", mock.Anything, existingArticle).Return(nil)

	article, err := service.Update(context.Background(), 1, 1, 1, "New Title", "New Content", "Summary", "")

	assert.NoError(t, err)
	assert.NotNil(t, article)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_Update_NotAuthorized(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	existingArticle := &model.Article{
		ID:       1,
		AuthorID: 1,
		Version:  1,
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil)

	article, err := service.Update(context.Background(), 1, 2, 1, "New Title", "", "", "")

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotAuthorized, err)
	assert.Nil(t, article)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_Update_VersionConflict(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	existingArticle := &model.Article{
		ID:       1,
		AuthorID: 1,
		Version:  2, // 数据库中版本为 2
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil)

	article, err := service.Update(context.Background(), 1, 1, 1, "New Title", "", "", "") // 客户端版本为 1

	assert.Error(t, err)
	assert.Equal(t, ErrArticleVersionConflict, err)
	assert.Nil(t, article)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_Update_PublishDraft(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	now := time.Now()
	existingArticle := &model.Article{
		ID:       1,
		Title:    "Title",
		Slug:     "title",
		AuthorID: 1,
		Version:  1,
		Status:   "draft",
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil).Twice()
	// 不更新 title，所以不会调用 FindBySlug
	mockRepo.On("Update", mock.Anything, existingArticle).Return(nil).Run(func(args mock.Arguments) {
		article := args.Get(1).(*model.Article)
		assert.Equal(t, "published", article.Status)
		assert.NotNil(t, article.PublishedAt)
		assert.True(t, article.PublishedAt.After(now.Add(-time.Second)))
	})

	article, err := service.Update(context.Background(), 1, 1, 1, "", "", "", "published")

	assert.NoError(t, err)
	assert.NotNil(t, article)
	mockRepo.AssertExpectations(t)
}

// 测试文章服务 - Delete
func TestArticleService_Delete_Success(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	existingArticle := &model.Article{
		ID:       1,
		AuthorID: 1,
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil)
	mockRepo.On("Delete", mock.Anything, uint(1)).Return(nil)

	err := service.Delete(context.Background(), 1, 1)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_Delete_NotAuthorized(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	existingArticle := &model.Article{
		ID:       1,
		AuthorID: 1,
	}

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil)

	err := service.Delete(context.Background(), 1, 2)

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotAuthorized, err)
	mockRepo.AssertExpectations(t)
}

func TestArticleService_Delete_NotFound(t *testing.T) {
	mockRepo := new(MockArticleRepository)
	service := NewArticleService(mockRepo)

	mockRepo.On("FindByID", mock.Anything, uint(1)).Return(nil, gorm.ErrRecordNotFound)

	err := service.Delete(context.Background(), 1, 1)

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotFound, err)
	mockRepo.AssertExpectations(t)
}