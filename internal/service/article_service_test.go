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
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*model.Article), args.Get(1).(int64), args.Error(2)
}

func (m *MockArticleRepository) FindPublished(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]*model.Article, int64, error) {
	args := m.Called(ctx, limit, offset, filters)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*model.Article), args.Get(1).(int64), args.Error(2)
}

func (m *MockArticleRepository) FindByCategory(ctx context.Context, categorySlug string, limit, offset int) ([]*model.Article, int64, error) {
	args := m.Called(ctx, categorySlug, limit, offset)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*model.Article), args.Get(1).(int64), args.Error(2)
}

func (m *MockArticleRepository) FindByTag(ctx context.Context, tagSlug string, limit, offset int) ([]*model.Article, int64, error) {
	args := m.Called(ctx, tagSlug, limit, offset)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*model.Article), args.Get(1).(int64), args.Error(2)
}

func (m *MockArticleRepository) FindBySlugWithNav(ctx context.Context, slug string) (*model.Article, *model.Article, *model.Article, error) {
	args := m.Called(ctx, slug)
	if args.Get(0) == nil {
		return nil, nil, nil, args.Error(3)
	}
	return args.Get(0).(*model.Article), nil, nil, args.Error(3)
}

func (m *MockArticleRepository) GetArchive(ctx context.Context) ([]*model.Article, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.Article), args.Error(1)
}

func (m *MockArticleRepository) Search(ctx context.Context, query string, limit, offset int) ([]*model.Article, int64, error) {
	args := m.Called(ctx, query, limit, offset)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*model.Article), args.Get(1).(int64), args.Error(2)
}

func (m *MockArticleRepository) Create(ctx context.Context, article *model.Article) error {
	args := m.Called(ctx, article)
	return args.Error(0)
}

func (m *MockArticleRepository) CreateWithTags(ctx context.Context, article *model.Article, tagIDs []uint) error {
	args := m.Called(ctx, article, tagIDs)
	return args.Error(0)
}

func (m *MockArticleRepository) Update(ctx context.Context, article *model.Article) error {
	args := m.Called(ctx, article)
	return args.Error(0)
}

func (m *MockArticleRepository) UpdateWithTags(ctx context.Context, article *model.Article, tagIDs []uint) error {
	args := m.Called(ctx, article, tagIDs)
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

func (m *MockArticleRepository) SyncTags(ctx context.Context, articleID uint, tagIDs []uint) error {
	args := m.Called(ctx, articleID, tagIDs)
	return args.Error(0)
}

// MockCategoryRepository 分类仓储模拟
type MockCategoryRepository struct {
	mock.Mock
}

func (m *MockCategoryRepository) FindByID(ctx context.Context, id uint) (*model.Category, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Category), args.Error(1)
}

func (m *MockCategoryRepository) FindBySlug(ctx context.Context, slug string) (*model.Category, error) {
	args := m.Called(ctx, slug)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Category), args.Error(1)
}

func (m *MockCategoryRepository) FindAllWithCount(ctx context.Context) ([]*model.CategoryWithCount, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.CategoryWithCount), args.Error(1)
}

func (m *MockCategoryRepository) Create(ctx context.Context, category *model.Category) error {
	args := m.Called(ctx, category)
	return args.Error(0)
}

func (m *MockCategoryRepository) Update(ctx context.Context, category *model.Category) error {
	args := m.Called(ctx, category)
	return args.Error(0)
}

func (m *MockCategoryRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockCategoryRepository) ExistsBySlug(ctx context.Context, slug string) bool {
	args := m.Called(ctx, slug)
	return args.Bool(0)
}

func (m *MockCategoryRepository) CountArticles(ctx context.Context, categoryID uint) int {
	args := m.Called(ctx, categoryID)
	return args.Int(0)
}

// MockTagRepository 标签仓储模拟
type MockTagRepository struct {
	mock.Mock
}

func (m *MockTagRepository) FindByID(ctx context.Context, id uint) (*model.Tag, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Tag), args.Error(1)
}

func (m *MockTagRepository) FindBySlug(ctx context.Context, slug string) (*model.Tag, error) {
	args := m.Called(ctx, slug)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Tag), args.Error(1)
}

func (m *MockTagRepository) FindByIDs(ctx context.Context, ids []uint) ([]*model.Tag, error) {
	args := m.Called(ctx, ids)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.Tag), args.Error(1)
}

func (m *MockTagRepository) FindAllWithCount(ctx context.Context) ([]*model.TagWithCount, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.TagWithCount), args.Error(1)
}

func (m *MockTagRepository) Create(ctx context.Context, tag *model.Tag) error {
	args := m.Called(ctx, tag)
	return args.Error(0)
}

func (m *MockTagRepository) Update(ctx context.Context, tag *model.Tag) error {
	args := m.Called(ctx, tag)
	return args.Error(0)
}

func (m *MockTagRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockTagRepository) ExistsBySlug(ctx context.Context, slug string) bool {
	args := m.Called(ctx, slug)
	return args.Bool(0)
}

func (m *MockTagRepository) ExistsByName(ctx context.Context, name string) bool {
	args := m.Called(ctx, name)
	return args.Bool(0)
}

func (m *MockTagRepository) CountArticles(ctx context.Context, tagID uint) int {
	args := m.Called(ctx, tagID)
	return args.Int(0)
}

// 测试文章服务 - Create
func TestArticleService_Create_Success(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	mockArticleRepo.On("FindBySlug", mock.Anything, "test-article").Return(nil, gorm.ErrRecordNotFound)
	mockArticleRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.Article")).Return(nil)
	mockArticleRepo.On("FindByID", mock.Anything, mock.AnythingOfType("uint")).Return(&model.Article{
		ID:      1,
		Title:   "Test Article",
		Slug:    "test-article",
		Content: "Content",
		Author:  &model.User{ID: 1, Username: "author"},
	}, nil)

	article, err := svc.Create(context.Background(), "Test Article", "Content", "Summary", "", nil, nil, "draft", 1)

	assert.NoError(t, err)
	assert.NotNil(t, article)
	assert.Equal(t, "Test Article", article.Title)
	mockArticleRepo.AssertExpectations(t)
}

func TestArticleService_Create_WithCategoryAndTags(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	categoryID := uint(1)
	tagIDs := []uint{1, 2}

	mockCategoryRepo.On("FindByID", mock.Anything, categoryID).Return(&model.Category{ID: 1, Name: "Tech", Slug: "tech"}, nil)
	mockTagRepo.On("FindByIDs", mock.Anything, tagIDs).Return([]*model.Tag{
		{ID: 1, Name: "Go", Slug: "go"},
		{ID: 2, Name: "React", Slug: "react"},
	}, nil)
	mockArticleRepo.On("FindBySlug", mock.Anything, "test-article").Return(nil, gorm.ErrRecordNotFound)
	mockArticleRepo.On("CreateWithTags", mock.Anything, mock.AnythingOfType("*model.Article"), tagIDs).Return(nil)
	mockArticleRepo.On("FindByID", mock.Anything, mock.AnythingOfType("uint")).Return(&model.Article{
		ID:       1,
		Title:    "Test Article",
		Slug:     "test-article",
		Content:  "Content",
		Author:   &model.User{ID: 1, Username: "author"},
		Category: &model.Category{ID: 1, Name: "Tech", Slug: "tech"},
		Tags:     []model.Tag{{ID: 1, Name: "Go", Slug: "go"}, {ID: 2, Name: "React", Slug: "react"}},
	}, nil)

	article, err := svc.Create(context.Background(), "Test Article", "Content", "Summary", "", &categoryID, tagIDs, "published", 1)

	assert.NoError(t, err)
	assert.NotNil(t, article)
	mockArticleRepo.AssertExpectations(t)
	mockCategoryRepo.AssertExpectations(t)
	mockTagRepo.AssertExpectations(t)
}

func TestArticleService_Create_PublishedArticle(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	mockArticleRepo.On("FindBySlug", mock.Anything, mock.Anything).Return(nil, gorm.ErrRecordNotFound)
	mockArticleRepo.On("Create", mock.Anything, mock.AnythingOfType("*model.Article")).Return(nil).Run(func(args mock.Arguments) {
		article := args.Get(1).(*model.Article)
		article.ID = 1
		assert.Equal(t, "published", article.Status)
		assert.NotNil(t, article.PublishedAt)
	})
	mockArticleRepo.On("FindByID", mock.Anything, mock.AnythingOfType("uint")).Return(&model.Article{
		ID:      1,
		Title:   "Test Article",
		Status:  "published",
	}, nil)

	article, err := svc.Create(context.Background(), "Test Article", "Content", "", "", nil, nil, "published", 1)

	assert.NoError(t, err)
	assert.NotNil(t, article)
	mockArticleRepo.AssertExpectations(t)
}

// 测试文章服务 - GetByID
func TestArticleService_GetByID_Success(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	expectedArticle := &model.Article{
		ID:      1,
		Title:   "Test Article",
		Content: "Content",
		Author:  &model.User{ID: 1, Username: "author"},
	}

	mockArticleRepo.On("FindByID", mock.Anything, uint(1)).Return(expectedArticle, nil)
	mockArticleRepo.On("IncrementViewCount", mock.Anything, uint(1)).Return(nil).Maybe()

	article, err := svc.GetByID(context.Background(), 1)

	assert.NoError(t, err)
	assert.Equal(t, expectedArticle.ID, article.ID)
	mockArticleRepo.AssertExpectations(t)
}

func TestArticleService_GetByID_NotFound(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	mockArticleRepo.On("FindByID", mock.Anything, uint(1)).Return(nil, gorm.ErrRecordNotFound)

	article, err := svc.GetByID(context.Background(), 1)

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotFound, err)
	assert.Nil(t, article)
	mockArticleRepo.AssertExpectations(t)
}

// 测试文章服务 - GetList
func TestArticleService_GetList_Success(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	articles := []*model.Article{
		{ID: 1, Title: "Article 1"},
		{ID: 2, Title: "Article 2"},
	}

	mockArticleRepo.On("FindPublished", mock.Anything, 10, 0, mock.Anything).Return(articles, int64(2), nil)

	result, err := svc.GetList(context.Background(), 1, 10, "", nil, "", "")

	assert.NoError(t, err)
	assert.Len(t, result.Items, 2)
	assert.Equal(t, int64(2), result.Total)
	mockArticleRepo.AssertExpectations(t)
}

func TestArticleService_GetList_ByCategory(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	articles := []*model.Article{
		{ID: 1, Title: "Article 1", Category: &model.Category{ID: 1, Slug: "tech"}},
	}

	mockArticleRepo.On("FindByCategory", mock.Anything, "tech", 10, 0).Return(articles, int64(1), nil)

	result, err := svc.GetList(context.Background(), 1, 10, "", nil, "tech", "")

	assert.NoError(t, err)
	assert.Len(t, result.Items, 1)
	mockArticleRepo.AssertExpectations(t)
}

func TestArticleService_GetList_ByTag(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	articles := []*model.Article{
		{ID: 1, Title: "Article 1", Tags: []model.Tag{{ID: 1, Slug: "go"}}},
	}

	mockArticleRepo.On("FindByTag", mock.Anything, "go", 10, 0).Return(articles, int64(1), nil)

	result, err := svc.GetList(context.Background(), 1, 10, "", nil, "", "go")

	assert.NoError(t, err)
	assert.Len(t, result.Items, 1)
	mockArticleRepo.AssertExpectations(t)
}

// 测试文章服务 - GetBySlug
func TestArticleService_GetBySlug_Success(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	expectedArticle := &model.Article{
		ID:          1,
		Title:       "Test Article",
		Slug:        "test-article",
		Content:     "Content",
		Author:      &model.User{ID: 1, Username: "author"},
		PublishedAt: &time.Time{},
	}

	mockArticleRepo.On("FindBySlugWithNav", mock.Anything, "test-article").Return(expectedArticle, nil, nil, nil)
	mockArticleRepo.On("IncrementViewCount", mock.Anything, uint(1)).Return(nil).Maybe()

	article, err := svc.GetBySlug(context.Background(), "test-article")

	assert.NoError(t, err)
	assert.Equal(t, expectedArticle.ID, article.ID)
	assert.Equal(t, "test-article", article.Slug)
	mockArticleRepo.AssertExpectations(t)
}

func TestArticleService_GetBySlug_NotFound(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	mockArticleRepo.On("FindBySlugWithNav", mock.Anything, "nonexistent").Return(nil, nil, nil, gorm.ErrRecordNotFound)

	article, err := svc.GetBySlug(context.Background(), "nonexistent")

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotFound, err)
	assert.Nil(t, article)
	mockArticleRepo.AssertExpectations(t)
}

// 测试文章服务 - Update
func TestArticleService_Update_Success(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	existingArticle := &model.Article{
		ID:       1,
		Title:    "Old Title",
		Slug:     "old-title",
		Content:  "Old Content",
		AuthorID: 1,
		Version:  1,
	}

	mockArticleRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil).Twice()
	mockArticleRepo.On("FindBySlug", mock.Anything, "new-title").Return(nil, gorm.ErrRecordNotFound)
	mockArticleRepo.On("Update", mock.Anything, existingArticle).Return(nil)

	// Passing nil for tagIDs means we don't want to update tags
	var tagIDs []uint = nil
	article, err := svc.Update(context.Background(), 1, 1, 1, "New Title", "New Content", "Summary", "", nil, tagIDs, "")

	assert.NoError(t, err)
	assert.NotNil(t, article)
	mockArticleRepo.AssertExpectations(t)
}

func TestArticleService_Update_NotAuthorized(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	existingArticle := &model.Article{
		ID:       1,
		AuthorID: 1,
		Version:  1,
	}

	mockArticleRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil)

	article, err := svc.Update(context.Background(), 1, 2, 1, "New Title", "", "", "", nil, nil, "")

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotAuthorized, err)
	assert.Nil(t, article)
	mockArticleRepo.AssertExpectations(t)
}

func TestArticleService_Update_VersionConflict(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	existingArticle := &model.Article{
		ID:       1,
		AuthorID: 1,
		Version:  2,
	}

	mockArticleRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil)

	article, err := svc.Update(context.Background(), 1, 1, 1, "New Title", "", "", "", nil, nil, "")

	assert.Error(t, err)
	assert.Equal(t, ErrArticleVersionConflict, err)
	assert.Nil(t, article)
	mockArticleRepo.AssertExpectations(t)
}

// 测试文章服务 - Delete
func TestArticleService_Delete_Success(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	existingArticle := &model.Article{
		ID:       1,
		AuthorID: 1,
	}

	mockArticleRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil)
	mockArticleRepo.On("Delete", mock.Anything, uint(1)).Return(nil)

	err := svc.Delete(context.Background(), 1, 1)

	assert.NoError(t, err)
	mockArticleRepo.AssertExpectations(t)
}

func TestArticleService_Delete_NotAuthorized(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	existingArticle := &model.Article{
		ID:       1,
		AuthorID: 1,
	}

	mockArticleRepo.On("FindByID", mock.Anything, uint(1)).Return(existingArticle, nil)

	err := svc.Delete(context.Background(), 1, 2)

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotAuthorized, err)
	mockArticleRepo.AssertExpectations(t)
}

func TestArticleService_Delete_NotFound(t *testing.T) {
	mockArticleRepo := new(MockArticleRepository)
	mockCategoryRepo := new(MockCategoryRepository)
	mockTagRepo := new(MockTagRepository)
	svc := NewArticleService(mockArticleRepo, mockCategoryRepo, mockTagRepo)

	mockArticleRepo.On("FindByID", mock.Anything, uint(1)).Return(nil, gorm.ErrRecordNotFound)

	err := svc.Delete(context.Background(), 1, 1)

	assert.Error(t, err)
	assert.Equal(t, ErrArticleNotFound, err)
	mockArticleRepo.AssertExpectations(t)
}