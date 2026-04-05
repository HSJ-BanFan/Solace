package router

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"gin-quickstart/internal/handler"
	"gin-quickstart/internal/middleware"
	"gin-quickstart/internal/service"
)

// Router 路由器，持有所有处理器和服务
type Router struct {
	authHandler    *handler.AuthHandler
	userHandler    *handler.UserHandler
	articleHandler *handler.ArticleHandler
	authService    service.AuthService
}

// NewRouter 创建路由器并注入所有依赖
func NewRouter(
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
	articleHandler *handler.ArticleHandler,
	authService service.AuthService,
) *Router {
	return &Router{
		authHandler:    authHandler,
		userHandler:    userHandler,
		articleHandler: articleHandler,
		authService:    authService,
	}
}

// Setup 初始化路由并注册所有路由
func (r *Router) Setup(mode string) *gin.Engine {
	// 设置 Gin 模式
	gin.SetMode(mode)

	engine := gin.New()

	// 全局中间件
	engine.Use(middleware.RequestID())
	engine.Use(middleware.Logging())
	engine.Use(middleware.Recovery())

	// Swagger 文档路由
	engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1 路由
	v1 := engine.Group("/api/v1")
	{
		// 健康检查
		v1.GET("/health", handler.HealthCheck)

		// 认证路由（公开）
		auth := v1.Group("/auth")
		{
			auth.POST("/register", r.authHandler.Register)
			auth.POST("/login", r.authHandler.Login)
			auth.POST("/refresh", r.authHandler.Refresh)
			auth.POST("/logout", r.authHandler.Logout)
		}

		// 公开文章路由
		articles := v1.Group("/articles")
		{
			articles.GET("", r.articleHandler.GetList)
			articles.GET("/:id", r.articleHandler.GetByID)
			articles.GET("/slug/:slug", r.articleHandler.GetBySlug)
		}

		// 占位路由（未来功能）
		v1.GET("/articles/search", handler.PlaceholderSearch)
		v1.POST("/upload", handler.PlaceholderUpload)

		// 受保护路由
		protected := v1.Group("")
		protected.Use(middleware.Auth(r.authService))
		{
			// 用户路由
			users := protected.Group("/users")
			{
				users.GET("/me", r.userHandler.GetMe)
				users.PUT("/me", r.userHandler.UpdateMe)
			}

			// 受保护的文章路由
			protectedArticles := protected.Group("/articles")
			{
				protectedArticles.POST("", r.articleHandler.Create)
				protectedArticles.PUT("/:id", r.articleHandler.Update)
				protectedArticles.DELETE("/:id", r.articleHandler.Delete)
			}
		}
	}

	return engine
}