package request

// CreateTagRequest 创建标签请求体
type CreateTagRequest struct {
	Name string `json:"name" validate:"required,min=1,max=50"`
}

// UpdateTagRequest 更新标签请求体
type UpdateTagRequest struct {
	Name string `json:"name" validate:"omitempty,min=1,max=50"`
}
