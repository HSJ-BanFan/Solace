package handler

import (
	"github.com/gin-gonic/gin"
	apperrors "gin-quickstart/internal/pkg/errors"
	"gin-quickstart/internal/dto/request"
	"gin-quickstart/internal/service"
)

// UserHandler 用户处理器
type UserHandler struct {
	userService service.UserService
}

// NewUserHandler 创建用户处理器
func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetMe 获取当前用户信息
// @Summary 获取当前用户信息
// @Tags user
// @Produce json
// @Success 200 {object} Response
// @Failure 401 {object} Response
// @Router /api/v1/users/me [get]
func (h *UserHandler) GetMe(c *gin.Context) {
	userID := c.GetUint("user_id")

	user, err := h.userService.GetMe(c.Request.Context(), userID)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithSuccess(c, user)
}

// UpdateMe 更新当前用户信息
// @Summary 更新当前用户信息
// @Tags user
// @Accept json
// @Produce json
// @Param request body request.UpdateUserRequest true "用户数据"
// @Success 200 {object} Response
// @Failure 400 {object} Response
// @Failure 401 {object} Response
// @Router /api/v1/users/me [put]
func (h *UserHandler) UpdateMe(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req request.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondWithError(c, apperrors.NewBadRequest("无效的请求体", nil))
		return
	}

	user, err := h.userService.UpdateMe(c.Request.Context(), userID, &req)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithSuccess(c, user)
}

// GetUser 根据 ID 获取用户
// @Summary 根据 ID 获取用户
// @Tags user
// @Produce json
// @Param id path int true "用户ID"
// @Success 200 {object} Response
// @Failure 404 {object} Response
// @Router /api/v1/users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		RespondWithError(c, apperrors.NewBadRequest("用户ID不能为空", nil))
		return
	}

	// 解析 ID
	var userID uint
	if _, err := c.Params.Get("id"); !err {
		RespondWithError(c, apperrors.NewBadRequest("无效的用户ID", nil))
		return
	}

	user, err := h.userService.GetByID(c.Request.Context(), userID)
	if err != nil {
		RespondWithError(c, err)
		return
	}

	RespondWithSuccess(c, user)
}