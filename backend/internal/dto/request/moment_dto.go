package request

// CreateMomentRequest 创建说说请求体
type CreateMomentRequest struct {
	Content string `json:"content" validate:"required,min=1,max=200"`
}

// MomentListQuery 说说列表查询参数
type MomentListQuery struct {
	Page     int `form:"page" validate:"omitempty,min=1"`
	PageSize int `form:"pageSize" validate:"omitempty,min=1,max=100"`
}
