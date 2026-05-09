package repository

import (
	"context"
	"os"
	"strings"
	"testing"
	"time"

	"gin-quickstart/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func openArticleRepositoryTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	dsn := os.Getenv("TEST_DATABASE_DSN")
	if dsn == "" {
		dsn = "host=127.0.0.1 port=15432 user=solace password=change-this-database-password dbname=solace sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("gorm.Open() error = %v", err)
	}

	t.Cleanup(func() {
		cleanupArticleTables(t, db)
	})

	return db
}

func cleanupArticleTables(t *testing.T, db *gorm.DB) {
	t.Helper()

	for _, stmt := range []string{
		`DROP TABLE IF EXISTS article_tags CASCADE`,
		`DROP TABLE IF EXISTS articles CASCADE`,
		`DROP TABLE IF EXISTS categories CASCADE`,
		`DROP TABLE IF EXISTS tags CASCADE`,
	} {
		if err := db.Exec(stmt).Error; err != nil {
			t.Fatalf("cleanup error for %q: %v", stmt, err)
		}
	}
}

func createLegacyArticlesTable(t *testing.T, db *gorm.DB) {
	t.Helper()

	cleanupArticleTables(t, db)
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
}

func TestArticleRepositoryEnsureCoreTablesCreatesMissingTables(t *testing.T) {
	db := openArticleRepositoryTestDB(t)
	cleanupArticleTables(t, db)

	repo := NewArticleRepository(db, 100)
	ctx := context.Background()

	if err := repo.EnsureCoreTables(ctx); err != nil {
		t.Fatalf("EnsureCoreTables() error = %v", err)
	}

	for _, table := range []string{"categories", "tags", "articles", "article_tags"} {
		if !db.Migrator().HasTable(table) {
			t.Fatalf("table %s was not created", table)
		}
	}
}

func TestArticleRepositoryEnsureCoreTablesIsIdempotent(t *testing.T) {
	db := openArticleRepositoryTestDB(t)
	cleanupArticleTables(t, db)

	repo := NewArticleRepository(db, 100)
	ctx := context.Background()

	if err := repo.EnsureCoreTables(ctx); err != nil {
		t.Fatalf("EnsureCoreTables() first error = %v", err)
	}
	if err := repo.EnsureCoreTables(ctx); err != nil {
		t.Fatalf("EnsureCoreTables() second error = %v", err)
	}

	for _, table := range []string{"categories", "tags", "articles", "article_tags"} {
		if !db.Migrator().HasTable(table) {
			t.Fatalf("table %s missing after second ensure", table)
		}
	}
}

func TestArticleRepositoryFindByIDWorksAfterEnsureCoreTables(t *testing.T) {
	db := openArticleRepositoryTestDB(t)
	cleanupArticleTables(t, db)

	repo := NewArticleRepository(db, 100)
	ctx := context.Background()

	if err := repo.EnsureCoreTables(ctx); err != nil {
		t.Fatalf("EnsureCoreTables() error = %v", err)
	}
	if err := repo.EnsureSearchSchema(ctx); err != nil {
		t.Fatalf("EnsureSearchSchema() error = %v", err)
	}

	category := &model.Category{Name: "Backend", Slug: "backend"}
	if err := db.WithContext(ctx).Create(category).Error; err != nil {
		t.Fatalf("create category error = %v", err)
	}

	tag := &model.Tag{Name: "Go", Slug: "go"}
	if err := db.WithContext(ctx).Create(tag).Error; err != nil {
		t.Fatalf("create tag error = %v", err)
	}

	now := time.Now()
	article := &model.Article{
		Title:       "test title",
		Slug:        "test-title",
		Content:     "test content",
		Summary:     "test summary",
		AuthorID:    1,
		CategoryID:  &category.ID,
		Status:      model.StatusPublished,
		Version:     1,
		PublishedAt: &now,
	}
	if err := repo.CreateWithTags(ctx, article, []uint{tag.ID}); err != nil {
		t.Fatalf("CreateWithTags() error = %v", err)
	}

	got, err := repo.FindByID(ctx, article.ID)
	if err != nil {
		t.Fatalf("FindByID() error = %v", err)
	}
	if got.Category == nil || got.Category.ID != category.ID {
		t.Fatalf("FindByID() category = %#v, want ID %d", got.Category, category.ID)
	}
	if len(got.Tags) != 1 || got.Tags[0].ID != tag.ID {
		t.Fatalf("FindByID() tags = %#v, want tag ID %d", got.Tags, tag.ID)
	}
}

func TestArticleRepositoryEnsureSearchSchemaAllowsCreateOnLegacyTable(t *testing.T) {
	db := openArticleRepositoryTestDB(t)
	createLegacyArticlesTable(t, db)

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
