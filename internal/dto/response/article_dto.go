package response

import "time"

// ArticleResponse 文章数据响应
type ArticleResponse struct {
	ID          uint              `json:"id"`
	Title       string            `json:"title"`
	Slug        string            `json:"slug"`
	Content     string            `json:"content"`
	Summary     string            `json:"summary,omitempty"`
	CoverImage  string            `json:"cover_image,omitempty"`
	AuthorID    uint              `json:"author_id"`
	Author      *UserResponse     `json:"author,omitempty"`
	Category    *CategoryResponse `json:"category,omitempty"`
	Tags        []*TagResponse    `json:"tags,omitempty"`
	Status      string            `json:"status"`
	ViewCount   int               `json:"view_count"`
	IsTop       bool              `json:"is_top"`
	Version     int               `json:"version"`
	WordCount   int               `json:"word_count"` // 字数（计算）
	ReadTime    int               `json:"read_time"`  // 阅读时间（分钟）
	PublishedAt *time.Time        `json:"published_at,omitempty"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`

	// Navigation for detail page
	Prev *ArticleNav `json:"prev,omitempty"`
	Next *ArticleNav `json:"next,omitempty"`
}

// ArticleNav 文章导航（prev/next）
type ArticleNav struct {
	Title string `json:"title"`
	Slug  string `json:"slug"`
}

// ArticleSummary 文章摘要（用于列表、归档等）
type ArticleSummary struct {
	ID          uint              `json:"id"`
	Title       string            `json:"title"`
	Slug        string            `json:"slug"`
	Summary     string            `json:"summary,omitempty"`
	CoverImage  string            `json:"cover_image,omitempty"`
	Author      *UserResponse     `json:"author,omitempty"`
	Category    *CategoryResponse `json:"category,omitempty"`
	Tags        []*TagResponse    `json:"tags,omitempty"`
	Status      string            `json:"status"`
	ViewCount   int               `json:"view_count"`
	PublishedAt *time.Time        `json:"published_at,omitempty"`
	CreatedAt   time.Time         `json:"created_at"`
}

// ArticleListResponse 文章列表响应
type ArticleListResponse struct {
	Items    []*ArticleSummary `json:"items"`
	Page     int               `json:"page"`
	PageSize int               `json:"pageSize"`
	Total    int64             `json:"total"`
}

// ArchiveGroup 归档分组
type ArchiveGroup struct {
	Year   int            `json:"year"`
	Count  int            `json:"count"`
	Months []ArchiveMonth `json:"months"`
}

// ArchiveMonth 月度归档
type ArchiveMonth struct {
	Month    int               `json:"month"`
	Count    int               `json:"count"`
	Articles []*ArticleSummary `json:"articles"`
}

// ArchiveResponse 归档响应
type ArchiveResponse struct {
	Groups []*ArchiveGroup `json:"groups"`
}

// SearchResult 搜索结果
type SearchResult struct {
	ID          uint       `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Summary     string     `json:"summary,omitempty"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
}
