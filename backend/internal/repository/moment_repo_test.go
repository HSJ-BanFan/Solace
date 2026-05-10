package repository

import (
	"context"
	"os"
	"testing"

	"gin-quickstart/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func openMomentTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	dsn := os.Getenv("TEST_DATABASE_DSN")
	if dsn == "" {
		dsn = "host=127.0.0.1 port=15432 user=solace password=change-this-database-password dbname=solace sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("gorm.Open() error = %v", err)
	}

	if err := db.Exec(`DROP TABLE IF EXISTS moments`).Error; err != nil {
		t.Fatalf("drop moments table error = %v", err)
	}

	return db
}

func TestMomentRepositoryEnsureTableCreatesMissingTable(t *testing.T) {
	db := openMomentTestDB(t)
	repo := NewMomentRepository(db)

	if err := repo.EnsureTable(context.Background()); err != nil {
		t.Fatalf("EnsureTable() error = %v", err)
	}

	if !db.Migrator().HasTable(&model.Moment{}) {
		t.Fatal("moments table was not created")
	}
}
