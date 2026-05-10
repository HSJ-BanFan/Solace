package service

import (
	"context"
	"net/http"
	"testing"
	"time"

	apperrors "gin-quickstart/internal/pkg/errors"
	"gin-quickstart/internal/model"
)

type stubMomentRepository struct {
	created *model.Moment
}

func (r *stubMomentRepository) FindByID(ctx context.Context, id uint) (*model.Moment, error) {
	return nil, nil
}

func (r *stubMomentRepository) FindAll(ctx context.Context, limit, offset int) ([]*model.Moment, int64, error) {
	return nil, 0, nil
}

func (r *stubMomentRepository) GetContributions(ctx context.Context, from, to time.Time) ([]*model.Moment, error) {
	return nil, nil
}

func (r *stubMomentRepository) Create(ctx context.Context, moment *model.Moment) error {
	r.created = moment
	moment.ID = 1
	return nil
}

func (r *stubMomentRepository) Delete(ctx context.Context, id uint) error {
	return nil
}

func TestMomentServiceCreateTrimsAndEscapesContent(t *testing.T) {
	repo := &stubMomentRepository{}
	svc := NewMomentService(repo)

	moment, err := svc.Create(context.Background(), "  <script>alert(1)</script>  ")
	if err != nil {
		t.Fatalf("Create returned error: %v", err)
	}

	const want = "&lt;script&gt;alert(1)&lt;/script&gt;"

	if repo.created == nil {
		t.Fatal("expected repository Create to be called")
	}

	if repo.created.Content != want {
		t.Fatalf("created content = %q, want %q", repo.created.Content, want)
	}

	if moment.Content != want {
		t.Fatalf("response content = %q, want %q", moment.Content, want)
	}
}

func TestMomentServiceCreateRejectsWhitespaceOnlyContent(t *testing.T) {
	repo := &stubMomentRepository{}
	svc := NewMomentService(repo)

	_, err := svc.Create(context.Background(), "  \n\t  ")
	if err == nil {
		t.Fatal("expected error for whitespace-only content")
	}

	appErr, ok := err.(apperrors.AppError)
	if !ok {
		t.Fatalf("expected AppError, got %T", err)
	}

	if appErr.HTTPStatus() != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", appErr.HTTPStatus(), http.StatusBadRequest)
	}

	if repo.created != nil {
		t.Fatal("expected repository Create not to be called")
	}
}
