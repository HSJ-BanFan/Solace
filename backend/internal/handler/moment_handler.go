package handler

import (
	"github.com/gin-gonic/gin"

	"gin-quickstart/internal/dto/request"
	apperrors "gin-quickstart/internal/pkg/errors"
	"gin-quickstart/internal/pkg/validator"
	"gin-quickstart/internal/service"
)

const maxMomentPageSize = 50

// MomentHandler 说说处理器
type MomentHandler struct {
	momentService service.MomentService
}

// NewMomentHandler 创建说说处理器
func NewMomentHandler(momentService service.MomentService) *MomentHandler {
	return &MomentHandler{momentService: momentService}
}

// Create 创建说说
// @Summary 创建说说
// @Tags moment
// @Accept json
// @Produce json
// @Param request body request.CreateMomentRequest true "说说数据"
// @Success 201 {object} Response
// @Failure 400 {object} Response
// @Failure 401 {object} Response
// @Router /moments [post]
func (h *MomentHandler) Create(c *gin.Context) {
	var req request.CreateMomentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondWithError(c, apperrors.NewBadRequest("无效的请求体", nil))
		return
	}
	if err := validator.ValidateStruct(&req); err != nil {
		RespondWithError(c, apperrors.NewBadRequest("请求参数校验失败", validator.FormatError(err)))
		return
	}

	moment, err := h.momentService.Create(c.Request.Context(), req.Content)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithCreated(c, moment)
}

// GetByID 根据 ID 获取说说
// @Summary 根据 ID 获取说说
// @Tags moment
// @Produce json
// @Param id path int true "说说ID"
// @Success 200 {object} Response
// @Failure 404 {object} Response
// @Router /moments/{id} [get]
func (h *MomentHandler) GetByID(c *gin.Context) {
	id, err := ParseID(c, "id")
	if err != nil {
		RespondWithError(c, err)
		return
	}

	moment, err := h.momentService.GetByID(c.Request.Context(), id)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithSuccess(c, moment)
}

// GetList 获取说说列表
// @Summary 获取说说列表
// @Tags moment
// @Produce json
// @Param page query int false "页码" minimum(1) default(1)
// @Param pageSize query int false "每页数量" minimum(1) maximum(50) default(5)
// @Success 200 {object} Response
// @Router /moments [get]
func (h *MomentHandler) GetList(c *gin.Context) {
	var query request.MomentListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		RespondWithError(c, apperrors.NewBadRequest("无效的查询参数", nil))
		return
	}

	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 5
	}
	if query.PageSize > maxMomentPageSize {
		query.PageSize = maxMomentPageSize
	}

	resp, err := h.momentService.GetList(
		c.Request.Context(),
		query.Page,
		query.PageSize,
	)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithPaged(c, resp.Items, resp.Page, resp.PageSize, resp.Total)
}

// Delete 删除说说
// @Summary 删除说说
// @Tags moment
// @Param id path int true "说说ID"
// @Success 204 "无内容"
// @Failure 400 {object} Response
// @Failure 401 {object} Response
// @Failure 404 {object} Response
// @Router /moments/{id} [delete]
func (h *MomentHandler) Delete(c *gin.Context) {
	id, err := ParseID(c, "id")
	if err != nil {
		RespondWithError(c, err)
		return
	}

	if err := h.momentService.Delete(c.Request.Context(), id); err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithNoContent(c)
}
