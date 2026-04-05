package repository

import (
	"context"

	"gin-quickstart/internal/model"
	"gorm.io/gorm"
)

// UserRepository 用户数据访问接口
type UserRepository interface {
	FindByID(ctx context.Context, id uint) (*model.User, error)
	FindByEmail(ctx context.Context, email string) (*model.User, error)
	FindByUsername(ctx context.Context, username string) (*model.User, error)
	Create(ctx context.Context, user *model.User) error
	Update(ctx context.Context, user *model.User) error
	Delete(ctx context.Context, id uint) error
	ExistsByEmail(ctx context.Context, email string) bool
	ExistsByUsername(ctx context.Context, username string) bool
}

// RefreshTokenRepository 刷新令牌数据访问接口
type RefreshTokenRepository interface {
	Create(ctx context.Context, token *model.RefreshToken) error
	FindByToken(ctx context.Context, tokenString string) (*model.RefreshToken, error)
	FindByUserID(ctx context.Context, userID uint) ([]*model.RefreshToken, error)
	Revoke(ctx context.Context, tokenString string) error
	RevokeAllByUserID(ctx context.Context, userID uint) error
	DeleteExpired(ctx context.Context) error
}

// ArticleRepository 文章数据访问接口
type ArticleRepository interface {
	FindByID(ctx context.Context, id uint) (*model.Article, error)
	FindBySlug(ctx context.Context, slug string) (*model.Article, error)
	FindAll(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]*model.Article, int64, error)
	FindPublished(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]*model.Article, int64, error)
	FindByCategory(ctx context.Context, categorySlug string, limit, offset int) ([]*model.Article, int64, error)
	FindByTag(ctx context.Context, tagSlug string, limit, offset int) ([]*model.Article, int64, error)
	FindByIDWithNav(ctx context.Context, id uint) (*model.Article, *model.Article, *model.Article, error)
	FindBySlugWithNav(ctx context.Context, slug string) (*model.Article, *model.Article, *model.Article, error)
	GetArchive(ctx context.Context) ([]*model.Article, error)
	Search(ctx context.Context, query string, limit, offset int) ([]*model.Article, int64, error)
	Create(ctx context.Context, article *model.Article) error
	CreateWithTags(ctx context.Context, article *model.Article, tagIDs []uint) error
	Update(ctx context.Context, article *model.Article) error
	UpdateWithTags(ctx context.Context, article *model.Article, tagIDs []uint) error
	Delete(ctx context.Context, id uint) error
	IncrementViewCount(ctx context.Context, id uint) error
	SyncTags(ctx context.Context, articleID uint, tagIDs []uint) error
}

// CategoryRepository 分类数据访问接口
type CategoryRepository interface {
	FindByID(ctx context.Context, id uint) (*model.Category, error)
	FindBySlug(ctx context.Context, slug string) (*model.Category, error)
	FindAll(ctx context.Context) ([]*model.Category, error)
	FindAllWithCount(ctx context.Context) ([]*model.CategoryWithCount, error)
	FindChildren(ctx context.Context, parentID uint) ([]*model.Category, error)
	Create(ctx context.Context, category *model.Category) error
	Update(ctx context.Context, category *model.Category) error
	Delete(ctx context.Context, id uint) error
	ExistsBySlug(ctx context.Context, slug string) bool
	CountArticles(ctx context.Context, categoryID uint) int
}

// TagRepository 标签数据访问接口
type TagRepository interface {
	FindByID(ctx context.Context, id uint) (*model.Tag, error)
	FindBySlug(ctx context.Context, slug string) (*model.Tag, error)
	FindAll(ctx context.Context) ([]*model.Tag, error)
	FindAllWithCount(ctx context.Context) ([]*model.TagWithCount, error)
	FindByIDs(ctx context.Context, ids []uint) ([]*model.Tag, error)
	Create(ctx context.Context, tag *model.Tag) error
	CreateIfNotExists(ctx context.Context, name string) (*model.Tag, error)
	Update(ctx context.Context, tag *model.Tag) error
	Delete(ctx context.Context, id uint) error
	ExistsBySlug(ctx context.Context, slug string) bool
	ExistsByName(ctx context.Context, name string) bool
	CountArticles(ctx context.Context, tagID uint) int
}

// userRepo 用户仓储实现
type userRepo struct {
	db *gorm.DB
}

// NewUserRepository 创建用户仓储
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) FindByID(ctx context.Context, id uint) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) FindByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) Create(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepo) Update(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepo) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&model.User{}, id).Error
}

func (r *userRepo) ExistsByEmail(ctx context.Context, email string) bool {
	var count int64
	r.db.WithContext(ctx).Model(&model.User{}).Where("email = ?", email).Count(&count)
	return count > 0
}

func (r *userRepo) ExistsByUsername(ctx context.Context, username string) bool {
	var count int64
	r.db.WithContext(ctx).Model(&model.User{}).Where("username = ?", username).Count(&count)
	return count > 0
}

// refreshTokenRepo 刷新令牌仓储实现
type refreshTokenRepo struct {
	db *gorm.DB
}

// NewRefreshTokenRepository 创建刷新令牌仓储
func NewRefreshTokenRepository(db *gorm.DB) RefreshTokenRepository {
	return &refreshTokenRepo{db: db}
}

func (r *refreshTokenRepo) Create(ctx context.Context, token *model.RefreshToken) error {
	return r.db.WithContext(ctx).Create(token).Error
}

func (r *refreshTokenRepo) FindByToken(ctx context.Context, tokenString string) (*model.RefreshToken, error) {
	var token model.RefreshToken
	err := r.db.WithContext(ctx).Where("token = ?", tokenString).First(&token).Error
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func (r *refreshTokenRepo) FindByUserID(ctx context.Context, userID uint) ([]*model.RefreshToken, error) {
	var tokens []*model.RefreshToken
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&tokens).Error
	if err != nil {
		return nil, err
	}
	return tokens, nil
}

func (r *refreshTokenRepo) Revoke(ctx context.Context, tokenString string) error {
	return r.db.WithContext(ctx).
		Model(&model.RefreshToken{}).
		Where("token = ?", tokenString).
		Update("revoked", true).Error
}

func (r *refreshTokenRepo) RevokeAllByUserID(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).
		Model(&model.RefreshToken{}).
		Where("user_id = ? AND revoked = ?", userID, false).
		Update("revoked", true).Error
}

func (r *refreshTokenRepo) DeleteExpired(ctx context.Context) error {
	return r.db.WithContext(ctx).
		Where("expires_at < ?", gorm.Expr("NOW()")).
		Delete(&model.RefreshToken{}).Error
}
