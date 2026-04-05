package model

import (
	"time"

	"gorm.io/gorm"
)

// RefreshToken 刷新令牌实体
type RefreshToken struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	Token     string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"token"`
	UserID    uint           `gorm:"not null;index" json:"user_id"`
	ExpiresAt time.Time      `gorm:"not null" json:"expires_at"`
	Revoked   bool           `gorm:"default:false" json:"revoked"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations 关联关系
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName 返回刷新令牌表名
func (RefreshToken) TableName() string {
	return "refresh_tokens"
}

// IsExpired 返回令牌是否已过期
func (rt *RefreshToken) IsExpired() bool {
	return time.Now().After(rt.ExpiresAt)
}

// IsValid 返回令牌是否有效（未过期且未撤销）
func (rt *RefreshToken) IsValid() bool {
	return !rt.IsExpired() && !rt.Revoked
}

// Revoke 将令牌标记为已撤销
func (rt *RefreshToken) Revoke() {
	rt.Revoked = true
}
