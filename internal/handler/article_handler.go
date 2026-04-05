package handler

import (
	"strconv"

	"gin-quickstart/internal/dto/request"
	apperrors "gin-quickstart/interna
	"gin-quickstart/internal/service"
n
)

// ArticleHandler 文章处理器
type ArticleHandler struct {
	articleService service.ArticleService
}

// NewArticleHandler 创建文章处理器
func NewArticleHandler(articleService service.ArticleService) *ArticleHandler {
	return &ArticleHandler{articleService: articleService}
}

// Create 创建文章
// @Summary 创建文章
// @Tags article
// @Accept json
// @Produce json
// @Param request body request.CreateArticleRequest true "文章数据"
// @Success 201 {object} Response
// @Failure 400 {object} Response
// @Failure 401 {object} Response
// @Router /articles [post]
func (h *ArticleHandler) Create(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req request.CreateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondWithError(c, apperrors.NewBadRequest("无效的请求体", nil))
		return
	}

	// 默认状态为草稿
	status := req.Status
	if status == "" {
		status = "draft"
	}

	article, err := h.articleService.Create(
		c.Request.Context(),
		req.Title,
		req.Content,
		req.Summary,
		status,
		userID,
	)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithCreated(c, article)
}

// GetByID 根据 ID 获取文章
// @Summary 根据 ID 获取文章
// @Tags article
// @Produce json
// @Param id path int true "文章ID"
// @Success 200 {object} Response
// @Failure 404 {object} Response
// @Router /articles/{id} [get]
func (h *ArticleHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		RespondWithError(c, apperrors.NewBadRequest("无效的文章ID", nil))
		return
	}

	article, err := h.articleService.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithSuccess(c, article)
}

// GetBySlug 根据 Slug 获取文章
// @Summary 根据 Slug 获取文章
// @Tags article
// @Produce json
// @Param slug path string true "文章 Slug"
// @Success 200 {object} Response
// @Failure 404 {object} Response
// @Router /articles/slug/{slug} [get]
func (h *ArticleHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		RespondWithError(c, apperrors.NewBadRequest("文章 Slug 不能为空", nil))
		return
	}

	article, err := h.articleService.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithSuccess(c, article)
}

// GetList 获取文章列表
// @Summary 获取文章列表
// @Tags article
// @Produce json
// @Param page query int false "页码" default(1)
// @Param pageSize query int false "每页数量" default(10)
// @Param status query string false "按状态筛选"
// @Param author_id query int false "按作者ID筛选"
// @Success 200 {object} Response
// @Router /articles [get]
func (h *ArticleHandler) GetList(c *gin.Context) {
	var query request.ArticleListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		RespondWithError(c, apperrors.NewBadRequest("无效的查询参数", nil))
		return
	}

	// 设置默认值
	if query.Page == 0 {
		query.Page = 1
	}
	if query.PageSize == 0 {
		query.PageSize = 10
	}

	var authorID *uint
	if query.AuthorID > 0 {
		authorID = &query.AuthorID
	}

	resp, err := h.articleService.GetList(
		c.Request.Context(),
		query.Page,
		query.PageSize,
		query.Status,
		authorID,
	)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithPaged(c, resp.Items, resp.Page, resp.PageSize, resp.Total)
}

// Update 更新文章
// @Summary 更新文章
// @Tags article
// @Accept json
// @Produce json
// @Param id path int true "文章ID"
// @Param request body request.UpdateArticleRequest true "文章数据"
// @Success 200 {object} Response
// @Failure 400 {object} Response
// @Failure 401 {object} Response
// @Failure 404 {object} Response
// @Router /articles/{id} [put]
func (h *ArticleHandler) Update(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		RespondWithError(c, apperrors.NewBadRequest("无效的文章ID", nil))
		return
	}

	var req request.UpdateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondWithError(c, apperrors.NewBadRequest("无效的请求体", nil))
		return
	}

	article, err := h.articleService.Update(
		c.Request.Context(),
		uint(id),
		userID,
		req.Version,
		req.Title,
		req.Content,
		req.Summary,
		req.Status,
	)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithSuccess(c, article)
}

// Delete 删除文章
// @Summary 删除文章
// @Tags article
// @Param id path int true "文章ID"
// @Success 204 "无内容"
// @Failure 400 {object} Response
// @Failure 401 {object} Response
// @Failure 404 {object} Response
// @Router /articles/{id} [delete]
func (h *ArticleHandler) Delete(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		RespondWithError(c, apperrors.NewBadRequest("无效的文章ID", nil))
		return
	}

	if err := h.articleService.Delete(c.Request.Context(), uint(id), userID); err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithNoContent(c)
}