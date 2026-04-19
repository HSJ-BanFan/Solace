package response

import "time"

// CategoryResponse 分类响应
type CategoryResponse struct {
	ID           uint      `json:"id"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	Description  string    `json:"description,omitempty"`
	ParentID     *uint     `json:"parent_id,omitempty"`
	SortOrder    int       `json:"sort_order"`
	ArticleCount int       `json:"article_count,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CategoryListResponse 分类列表响应
type CategoryListResponse struct {
	Items []*CategoryResponse `json:"items"`
}

// CategoryDetailResponse 分类详情响应（包含文章列表）
type CategoryDetailResponse struct {
	ID           uint              `json:"id"`
	Name         string            `json:"name"`
	Slug         string            `json:"slug"`
	Description  string            `json:"description,omitempty"`
	ParentID     *uint             `json:"parent_id,omitempty"`
	SortOrder    int               `json:"sort_order"`
	ArticleCount int               `json:"article_count"`
	Articles     []*ArticleSummary `json:"articles,omitempty"`
}