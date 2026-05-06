package response

import "time"

// MomentResponse 说说数据响应
type MomentResponse struct {
	ID        uint      `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// MomentListResponse 说说列表响应
type MomentListResponse struct {
	Items    []*MomentResponse `json:"items"`
	Page     int               `json:"page"`
	PageSize int               `json:"pageSize"`
	Total    int64             `json:"total"`
}
