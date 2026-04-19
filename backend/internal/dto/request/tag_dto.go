package request

// CreateTagRequest 创建标签请求体
type CreateTagRequest struct {
	Name string `json:"name" validate:"required,min=1,max=50"`
	Slug string `json:"slug" validate:"omitempty,min=1,max=50"` // 可选，为空则自动生成
}

// UpdateTagRequest 更新标签请求体
type UpdateTagRequest struct {
	Name string `json:"name" validate:"omitempty,min=1,max=50"`
	Slug string `json:"slug" validate:"omitempty,min=1,max=50"` // 可选，为空则保持不变
}
