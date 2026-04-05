package response

import "time"

// ArticleResponse 文章数据响应
type ArticleResponse struct {
	ID          uint          `json:"id"`
	Title       string        `json:"title"`
	Slug        string        `json:"slug"`
	Content     string        `json:"content"`
	Summary     string        `json:"summary,omitempty"`
	CoverImage  string        `json:"cover_image,omitempty"`
	AuthorID    uint          `json:"author_id"`
	Author      *UserResponse `json:"author,omitempty"`
	Status      string        `json:"status"`
	ViewCount   int           `json:"view_count"`
	IsTop       bool          `json:"is_top"`
	Version     int           `json:"version"`
	PublishedAt *time.Time    `json:"published_at,omitempty"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

// ArticleListResponse 文章列表响应
type ArticleListResponse struct {
	Items    []*ArticleResponse `json:"items"`
	Page     int                `json:"page"`
	PageSize int                `json:"pageSize"`
	Total    int64              `json:"total"`
}