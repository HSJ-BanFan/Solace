package request

// CreateCategoryRequest 创建分类请求体
type CreateCategoryRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=100"`
	Description string `json:"description" validate:"omitempty,max=500"`
	ParentID    *uint  `json:"parent_id" validate:"omitempty"`
	SortOrder   int    `json:"sort_order" validate:"omitempty,min=0"`
}

// UpdateCategoryRequest 更新分类请求体
type UpdateCategoryRequest struct {
	Name        string `json:"name" validate:"omitempty,min=1,max=100"`
	Description string `json:"description" validate:"omitempty,max=500"`
	ParentID    *uint  `json:"parent_id" validate:"omitempty"`
	SortOrder   int    `json:"sort_order" validate:"omitempty,min=0"`
}

// CategoryListQuery 分类列表查询参数
type CategoryListQuery struct {
	ParentID *uint `form:"parent_id" validate:"omitempty"`
}
