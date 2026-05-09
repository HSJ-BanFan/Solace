package repository

import (
	"context"
	"strings"
	"testing"
	"time"

	"gin-quickstart/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func openArticleSchemaTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	dsn := "host=127.0.0.1 port=15432 user=solace password=change-this-database-password dbname=solace sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("gorm.Open() error = %v", err)
	}

	if err := db.Exec(`DROP TABLE IF EXISTS article_tags`).Error; err != nil {
		t.Fatalf("drop article_tags table error = %v", err)
	}
	if err := db.Exec(`DROP TABLE IF EXISTS articles`).Error; err != nil {
		t.Fatalf("drop articles table error = %v", err)
	}
	if err := db.Exec(`
		CREATE TABLE articles (
			id bigserial PRIMARY KEY,
			title varchar(200) NOT NULL,
			slug varchar(200) NOT NULL,
			content text NOT NULL,
			summary varchar(500),
			cover_image varchar(500),
			author_id bigint NOT NULL,
			category_id bigint,
			status varchar(20) DEFAULT 'draft',
			is_top boolean DEFAULT false,
			version integer DEFAULT 1,
			published_at timestamptz,
			created_at timestamptz,
			updated_at timestamptz,
			deleted_at timestamptz
		)
	`).Error; err != nil {
		t.Fatalf("create legacy articles table error = %v", err)
	}

	t.Cleanup(func() {
		_ = db.Exec(`DROP TABLE IF EXISTS article_tags`).Error
		_ = db.Exec(`DROP TABLE IF EXISTS articles`).Error
	})

	return db
}

func TestArticleRepositoryEnsureSearchSchemaAllowsCreateOnLegacyTable(t *testing.T) {
	db := openArticleSchemaTestDB(t)
	repo := NewArticleRepository(db, 100)
	ctx := context.Background()

	now := time.Now()
	legacyArticle := &model.Article{
		Title:       "test title",
		Slug:        "test-title",
		Content:     "test content",
		Summary:     "test summary",
		AuthorID:    1,
		Status:      model.StatusPublished,
		Version:     1,
		PublishedAt: &now,
	}

	err := repo.Create(ctx, legacyArticle)
	if err == nil {
		t.Fatal("Create() error = nil, want missing search_vec failure")
	}
	if !strings.Contains(err.Error(), "search_vec") {
		t.Fatalf("Create() error = %v, want missing search_vec failure", err)
	}

	if err := repo.EnsureSearchSchema(ctx); err != nil {
		t.Fatalf("EnsureSearchSchema() error = %v", err)
	}

	if !db.Migrator().HasColumn(&model.Article{}, "SearchVec") {
		t.Fatal("search_vec column was not created")
	}

	fixedArticle := &model.Article{
		Title:       "test title after ensure",
		Slug:        "test-title-after-ensure",
		Content:     "test content",
		Summary:     "test summary",
		AuthorID:    1,
		Status:      model.StatusPublished,
		Version:     1,
		PublishedAt: &now,
	}

	if err := repo.Create(ctx, fixedArticle); err != nil {
		t.Fatalf("Create() after EnsureSearchSchema error = %v", err)
	}

	var searchVec *string
	if err := db.WithContext(ctx).Raw(`SELECT search_vec::text FROM articles WHERE id = ?`, fixedArticle.ID).Scan(&searchVec).Error; err != nil {
		t.Fatalf("select search_vec error = %v", err)
	}
	if searchVec == nil || *searchVec == "" {
		t.Fatal("search_vec was not populated for created article")
	}
}
