package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	apperrors "gin-quickstart/internal/pkg/errors"
)

// Response 标准 API 响应结构
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorBody  `json:"error,omitempty"`
}

// ErrorBody 错误响应结构
type ErrorBody struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// PagedResponse 分页响应结构
type PagedResponse struct {
	Success    bool        `json:"success"`
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	Total      int64       `json:"total"`
	TotalPages int         `json:"totalPages"`
}

// RespondWithSuccess 发送成功响应
func RespondWithSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

// RespondWithCreated 发送创建成功响应
func RespondWithCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Success: true,
		Data:    data,
	})
}

// RespondWithPaged 发送分页响应
func RespondWithPaged(c *gin.Context, data interface{}, page, pageSize int, total int64) {
	totalPages := int(total) / pageSize
	if int(total) % pageSize > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, PagedResponse{
		Success:    true,
		Data:       data,
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
		TotalPages: totalPages,
	})
}

// RespondWithError 发送错误响应
func RespondWithError(c *gin.Context, err error) {
	var appErr apperrors.AppError
	if errors.As(err, &appErr) {
		c.JSON(appErr.HTTPStatus(), Response{
			Success: false,
			Error: &ErrorBody{
				Code:    appErr.Code(),
				Message: appErr.Error(),
				Details: appErr.Details(),
			},
		})
		return
	}

	// 未知错误 - 返回通用消息
	c.JSON(http.StatusInternalServerError, Response{
		Success: false,
		Error: &ErrorBody{
			Code:    "INTERNAL_ERROR",
			Message: "服务器内部错误",
		},
	})
}

// RespondWithNoContent 发送无内容响应
func RespondWithNoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}