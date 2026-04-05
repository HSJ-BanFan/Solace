package response

import "time"

// AuthResponse 认证成功响应
type AuthResponse struct {
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresIn    int64         `json:"expires_in"` // 秒
	User         *UserResponse `json:"user"`
}

// UserResponse 用户数据响应
type UserResponse struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Nickname  string    `json:"nickname,omitempty"`
	AvatarURL string    `json:"avatar_url,omitempty"`
	Bio       string    `json:"bio,omitempty"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// RefreshResponse 刷新令牌响应
type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}