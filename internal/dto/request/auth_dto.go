package request

// RegisterRequest 用户注册请求体
type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=100"`
}

// LoginRequest 用户登录请求体
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RefreshTokenRequest 刷新令牌请求体
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// UpdateUserRequest 更新用户信息请求体
type UpdateUserRequest struct {
	Nickname  string `json:"nickname" validate:"omitempty,max=100"`
	AvatarURL string `json:"avatar_url" validate:"omitempty,url,max=500"`
	Bio       string `json:"bio" validate:"omitempty,max=500"`
}
