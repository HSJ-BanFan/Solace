package errors

import (
	"fmt"
	"net/http"
)

// AppError 应用错误接口
type AppError interface {
	Error() string
	Code() string
	HTTPStatus() int
	Details() interface{}
}

// appError 基础错误实现
type appError struct {
	code       string
	message    string
	httpStatus int
	details    interface{}
}

func (e *appError) Error() string {
	return e.message
}

func (e *appError) Code() string {
	return e.code
}

func (e *appError) HTTPStatus() int {
	return e.httpStatus
}

func (e *appError) Details() interface{} {
	return e.details
}

// 常用预定义错误
var (
	ErrBadRequest = &appError{
		code:       "BAD_REQUEST",
		message:    "无效的请求",
		httpStatus: http.StatusBadRequest,
	}

	ErrUnauthorized = &appError{
		code:       "UNAUTHORIZED",
		message:    "需要身份验证",
		httpStatus: http.StatusUnauthorized,
	}

	ErrForbidden = &appError{
		code:       "FORBIDDEN",
		message:    "访问被拒绝",
		httpStatus: http.StatusForbidden,
	}

	ErrNotFound = &appError{
		code:       "NOT_FOUND",
		message:    "资源未找到",
		httpStatus: http.StatusNotFound,
	}

	ErrConflict = &appError{
		code:       "CONFLICT",
		message:    "资源已存在",
		httpStatus: http.StatusConflict,
	}

	ErrInternal = &appError{
		code:       "INTERNAL_ERROR",
		message:    "服务器内部错误",
		httpStatus: http.StatusInternalServerError,
	}
)

// NewBadRequest 创建错误请求错误
func NewBadRequest(message string, details interface{}) AppError {
	return &appError{
		code:       "BAD_REQUEST",
		message:    message,
		httpStatus: http.StatusBadRequest,
		details:    details,
	}
}

// NewNotFound 创建未找到错误
func NewNotFound(resource string) AppError {
	return &appError{
		code:       "NOT_FOUND",
		message:    resource + " 未找到",
		httpStatus: http.StatusNotFound,
	}
}

// NewConflict 创建冲突错误
func NewConflict(message string) AppError {
	return &appError{
		code:       "CONFLICT",
		message:    message,
		httpStatus: http.StatusConflict,
	}
}

// NewUnauthorized 创建未授权错误
func NewUnauthorized(message string) AppError {
	return &appError{
		code:       "UNAUTHORIZED",
		message:    message,
		httpStatus: http.StatusUnauthorized,
	}
}

// NewForbidden 创建禁止访问错误
func NewForbidden(message string) AppError {
	return &appError{
		code:       "FORBIDDEN",
		message:    message,
		httpStatus: http.StatusForbidden,
	}
}

// Wrap 包装错误并添加上下文
func Wrap(err error, message string) error {
	return fmt.Errorf("%s: %w", message, err)
}

// IsAppError 检查错误是否为 AppError 类型
func IsAppError(err error) bool {
	_, ok := err.(AppError)
	return ok
}