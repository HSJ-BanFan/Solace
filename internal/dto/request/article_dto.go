package request

// CreateArticleRequest 创建文章请求体
type CreateArticleRequest struct {
	Title   string `json:"title" validate:"required,min=1,max=200"`
	Content string `json:"content" validate:"required,min=1"`
	Summary string `json:"summary" validate:"omitempty,max=500"`
	Status  string `json:"status" validate:"omitempty,oneof=draft published"`
}

// UpdateArticleRequest 更新文章请求体
type UpdateArticleRequest struct {
	Title   string `json:"title" validate:"omitempty,min=1,max=200"`
	Content string `json:"content" validate:"omitempty,min=1"`
	Summary string `json:"summary" validate:"omitempty,max=500"`
	Status  string `json:"status" validate:"omitempty,oneof=draft published"`
	Version int    `json:"version" validate:"required,min=1"`
}

// ArticleListQuery 文章列表查询参数
type ArticleListQuery struct {
	Page     int    `form:"page" validate:"omitempty,min=1"`
	PageSize int    `form:"pageSize" validate:"omitempty,min=1,max=100"`
	Status   string `form:"status" validate:"omitempty,oneof=draft published"`
	AuthorID uint   `form:"author_id" validate:"omitempty"`
}
