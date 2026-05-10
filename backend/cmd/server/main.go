package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"gin-quickstart/internal/config"
	_ "gin-quickstart/internal/docs" // swagger docs
	"gin-quickstart/internal/handler"
	"gin-quickstart/internal/pkg/database"
	"gin-quickstart/internal/pkg/jwt"
	"gin-quickstart/internal/pkg/logger"
	"gin-quickstart/internal/repository"
	"gin-quickstart/internal/router"
	"gin-quickstart/internal/service"
)

// @title 博客系统 API
// @version 1.0
// @description 博客后端 API 服务，支持文章管理、配置文件认证等功能
// @termsOfService http://swagger.io/terms/

// @contact.name API 支持
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description JWT 认证令牌，格式: Bearer {token}

func ensureSettingsSchema(ctx context.Context, settingsRepo repository.SettingsRepository) error {
	if err := settingsRepo.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure settings schema: %w", err)
	}
	return nil
}

func ensureMediaSchema(ctx context.Context, mediaRepo repository.MediaAssetRepository) error {
	if err := mediaRepo.EnsureTables(ctx); err != nil {
		return fmt.Errorf("ensure media schema: %w", err)
	}
	return nil
}

func ensureArticleCoreSchema(ctx context.Context, articleRepo repository.ArticleRepository) error {
	if err := articleRepo.EnsureCoreTables(ctx); err != nil {
		return fmt.Errorf("ensure article core schema: %w", err)
	}
	return nil
}

func ensureArticleSchema(ctx context.Context, articleRepo repository.ArticleRepository) error {
	if err := articleRepo.EnsureSearchSchema(ctx); err != nil {
		return fmt.Errorf("ensure article schema: %w", err)
	}
	return nil
}

func ensureMomentSchema(ctx context.Context, momentRepo repository.MomentRepository) error {
	if err := momentRepo.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure moments schema: %w", err)
	}
	return nil
}

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化日志
	logger.Init(logger.Config{
		Level:      cfg.LogLevel(),
		Env:        cfg.LogEnv(),
		OutputFile: cfg.LogOutputFile(),
		MaxSize:    cfg.LogMaxSize(),
		MaxBackups: cfg.LogMaxBackups(),
		MaxAge:     cfg.LogMaxAge(),
		Compress:   cfg.LogCompress(),
	})

	if warning := cfg.MomentSecretWarning(); warning != "" {
		logger.Warn().Msg(warning)
	}

	jwtSecret := cfg.JWTSecret()
	if jwtSecret == "" {
		logger.Fatal().Msg("jwt.secret must not be empty")
	}
	if len(jwtSecret) < 32 {
		logger.Fatal().Msg("jwt.secret must be at least 32 characters")
	}

	adminEmail := strings.TrimSpace(cfg.AdminEmail())
	if adminEmail == "" {
		logger.Fatal().Msg("admin.email must not be empty")
	}

	adminPassword := cfg.AdminPassword()
	if adminPassword == "" {
		logger.Fatal().Msg("admin.password must not be empty")
	}
	if len(adminPassword) < 12 {
		logger.Fatal().Msg("admin.password must be at least 12 characters")
	}

	logger.Info().
		Str("port", cfg.ServerPort()).
		Str("mode", cfg.ServerMode()).
		Msg("正在启动服务器")

	// 连接数据库
	db, err := database.Connect(cfg.GetDSN(), cfg.LogLevel())
	if err != nil {
		logger.Fatal().Err(err).Msg("数据库连接失败")
	}

	// 初始化仓储
	articleRepo := repository.NewArticleRepository(db, cfg.MaxSearchQueryLen())
	categoryRepo := repository.NewCategoryRepository(db)
	tagRepo := repository.NewTagRepository(db)
	pageRepo := repository.NewPageRepository(db)
	settingsRepo := repository.NewSettingsRepository(db)
	mediaRepo := repository.NewMediaAssetRepository(db)
	momentRepo := repository.NewMomentRepository(db)

	settingsSchemaCtx, cancelSettingsSchema := context.WithTimeout(context.Background(), 10*time.Second)
	if err := ensureSettingsSchema(settingsSchemaCtx, settingsRepo); err != nil {
		cancelSettingsSchema()
		logger.Fatal().Err(err).Msg("settings 表初始化失败")
	}
	cancelSettingsSchema()

	mediaSchemaCtx, cancelMediaSchema := context.WithTimeout(context.Background(), 10*time.Second)
	if err := ensureMediaSchema(mediaSchemaCtx, mediaRepo); err != nil {
		cancelMediaSchema()
		logger.Fatal().Err(err).Msg("media asset table init failed")
	}
	cancelMediaSchema()

	articleCoreSchemaCtx, cancelArticleCoreSchema := context.WithTimeout(context.Background(), 10*time.Second)
	if err := ensureArticleCoreSchema(articleCoreSchemaCtx, articleRepo); err != nil {
		cancelArticleCoreSchema()
		logger.Fatal().Err(err).Msg("article core schema init failed")
	}
	cancelArticleCoreSchema()

	articleSchemaCtx, cancelArticleSchema := context.WithTimeout(context.Background(), 10*time.Second)
	if err := ensureArticleSchema(articleSchemaCtx, articleRepo); err != nil {
		cancelArticleSchema()
		logger.Fatal().Err(err).Msg("article search schema init failed")
	}
	cancelArticleSchema()

	momentSchemaCtx, cancelMomentSchema := context.WithTimeout(context.Background(), 10*time.Second)
	if err := ensureMomentSchema(momentSchemaCtx, momentRepo); err != nil {
		cancelMomentSchema()
		logger.Fatal().Err(err).Msg("moments schema init failed")
	}
	cancelMomentSchema()

	// 初始化 JWT 管理器
	jwtManager := jwt.NewJWTManager(
		cfg.JWTSecret(),
		cfg.JWTAccessDuration(),
		cfg.JWTRefreshDuration(),
	)

	// 初始化服务
	authService := service.NewAuthService(
		cfg,
		jwtManager,
		cfg.JWTAccessDuration(),
	)
	ownerService := service.NewOwnerService(cfg)
	githubService := service.NewGitHubService(cfg)
	mediaService := service.NewMediaService(mediaRepo, cfg)
	articleService := service.NewArticleService(articleRepo, categoryRepo, tagRepo, momentRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	tagService := service.NewTagService(tagRepo)
	pageService := service.NewPageService(pageRepo)
	settingsService := service.NewSettingsService(settingsRepo)
	momentService := service.NewMomentService(momentRepo)

	// 初始化处理器
	authHandler := handler.NewAuthHandler(authService)
	ownerHandler := handler.NewOwnerHandler(ownerService)
	githubHandler := handler.NewGitHubHandler(githubService, cfg)
	articleHandler := handler.NewArticleHandler(articleService, mediaService)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	tagHandler := handler.NewTagHandler(tagService)
	sitemapHandler := handler.NewSitemapHandler(articleService, categoryService, tagService, pageService, cfg)
	rssHandler := handler.NewRSSHandler(articleService, ownerService, cfg)
	pageHandler := handler.NewPageHandler(pageService, mediaService)
	settingsHandler := handler.NewSettingsHandler(settingsService)
	mediaHandler := handler.NewMediaHandler(mediaService)
	momentHandler := handler.NewMomentHandler(momentService)
	uploadHandler, err := handler.NewUploadHandler(cfg)
	if err != nil {
		logger.Fatal().Err(err).Msg("上传处理器初始化失败")
	}

	// 设置路由
	appRouter := router.NewRouter(
		authHandler,
		articleHandler,
		categoryHandler,
		tagHandler,
		ownerHandler,
		githubHandler,
		authService,
		sitemapHandler,
		rssHandler,
		pageHandler,
		uploadHandler,
		settingsHandler,
		mediaHandler,
		momentHandler,
	)
	r, limiters := appRouter.Setup(cfg)

	// 创建 HTTP 服务器
	srv := &http.Server{
		Addr:    ":" + cfg.ServerPort(),
		Handler: r,
	}

	// 优雅关闭设置
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// 在 goroutine 中启动服务器
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal().Err(err).Msg("服务器启动失败")
		}
	}()

	logger.Info().Msg("服务器启动成功")

	// 等待中断信号
	sig := <-quit
	logger.Info().Str("signal", sig.String()).Msg("正在关闭服务器")

	// 给未完成的请求 30 秒时间完成
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 关闭服务器
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error().Err(err).Msg("服务器关闭错误")
	}

	// 停止所有限流器
	for _, limiter := range limiters {
		limiter.Stop()
	}

	// 关闭数据库连接
	if err := database.Close(db); err != nil {
		logger.Error().Err(err).Msg("数据库关闭错误")
	}

	logger.Info().Msg("服务器已停止")
}
