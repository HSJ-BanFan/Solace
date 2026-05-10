package middleware

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"gin-quickstart/internal/dto/request"
	"gin-quickstart/internal/dto/response"
	"gin-quickstart/internal/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func TestLoggingPreservesNonMultipartRequestBody(t *testing.T) {
	gin.SetMode(gin.TestMode)

	wantBody := string(bytes.Repeat([]byte("a"), 8192))
	router := gin.New()
	router.Use(LoggingWithConfig(LoggingConfig{
		LogRequestBody: true,
		MaxBodySize:    4096,
	}))
	router.POST("/echo", func(c *gin.Context) {
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
		c.String(http.StatusOK, string(body))
	})

	request := httptest.NewRequest(http.MethodPost, "/echo", bytes.NewBufferString(wantBody))
	request.Header.Set("Content-Type", "text/plain")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("response status = %d, want %d", response.Code, http.StatusOK)
	}
	if response.Body.String() != wantBody {
		t.Fatalf("response body length = %d, want %d", response.Body.Len(), len(wantBody))
	}
}

func TestLoggingDoesNotConsumeMultipartRequestBody(t *testing.T) {
	gin.SetMode(gin.TestMode)

	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)
	part, err := writer.CreateFormFile("image", "image.png")
	if err != nil {
		t.Fatalf("CreateFormFile() error = %v", err)
	}
	if _, err := part.Write(bytes.Repeat([]byte("a"), 8192)); err != nil {
		t.Fatalf("part.Write() error = %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("writer.Close() error = %v", err)
	}

	router := gin.New()
	router.Use(LoggingWithConfig(LoggingConfig{
		LogRequestBody: true,
		MaxBodySize:    4096,
	}))
	router.POST("/upload", func(c *gin.Context) {
		file, _, err := c.Request.FormFile("image")
		if err != nil {
			c.String(http.StatusBadRequest, err.Error())
			return
		}
		defer file.Close()

		c.Status(http.StatusNoContent)
	})

	request := httptest.NewRequest(http.MethodPost, "/upload", &requestBody)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusNoContent {
		t.Fatalf("response status = %d, want %d; body = %q", response.Code, http.StatusNoContent, response.Body.String())
	}
}

type fakeMomentAuthService struct{}

func (fakeMomentAuthService) Login(context.Context, *request.LoginRequest) (*response.AuthResponse, error) {
	panic("unexpected call")
}

func (fakeMomentAuthService) Logout(context.Context, string) error {
	panic("unexpected call")
}

func (fakeMomentAuthService) Refresh(context.Context, *request.RefreshTokenRequest) (*response.RefreshResponse, error) {
	panic("unexpected call")
}

func (fakeMomentAuthService) ValidateAccessToken(string) (*jwt.Claims, error) {
	return &jwt.Claims{UserID: 1, Username: "admin", Role: "admin"}, nil
}

func TestMomentAuthAcceptsMomentSecret(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(MomentAuth(fakeMomentAuthService{}, "secret"))
	router.GET("/moments", func(c *gin.Context) {
		if got := c.GetUint("user_id"); got != 0 {
			t.Fatalf("user_id = %d, want 0", got)
		}
		if got := c.GetString("role"); got != "moment-secret" {
			t.Fatalf("role = %q, want %q", got, "moment-secret")
		}
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/moments", nil)
	req.Header.Set("X-Moment-Secret", "secret")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %q", rec.Code, http.StatusOK, rec.Body.String())
	}
}

func TestMomentAuthFallsBackToJWT(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(MomentAuth(fakeMomentAuthService{}, "secret"))
	router.GET("/moments", func(c *gin.Context) {
		if got := c.GetUint("user_id"); got != 1 {
			t.Fatalf("user_id = %d, want 1", got)
		}
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/moments", nil)
	req.Header.Set("Authorization", "Bearer token")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %q", rec.Code, http.StatusOK, rec.Body.String())
	}
}

func TestMomentAuthRejectsInvalidMomentSecret(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(MomentAuth(fakeMomentAuthService{}, "secret"))
	router.GET("/moments", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/moments", nil)
	req.Header.Set("X-Moment-Secret", "wrong-secret")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d; body = %q", rec.Code, http.StatusUnauthorized, rec.Body.String())
	}
}
