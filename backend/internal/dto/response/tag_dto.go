package response

import "time"

// TagResponse 标签响应
type TagResponse struct {
	ID           uint      `json:"id"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	ArticleCount int       `json:"article_count,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// TagListResponse 标签列表响应
type TagListResponse struct {
	Items []*TagResponse `json:"items"`
}

// TagDetailResponse 标签详情响应（包含文章列表）
type TagDetailResponse struct {
	ID           uint              `json:"id"`
	Name         string            `json:"name"`
	Slug         string            `json:"slug"`
	ArticleCount int               `json:"article_count"`
	Articles     []*ArticleSummary `json:"articles,omitempty"`
}