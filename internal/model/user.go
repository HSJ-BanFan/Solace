package model

import (
	"time"

	"gorm.io/gorm"
)

// User 用户实体
type User struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	Username     string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	Email        string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	Nickname     string         `gorm:"type:varchar(100)" json:"nickname,omitempty"`
	AvatarURL    string         `gorm:"type:varchar(500)" json:"avatar_url,omitempty"`
	Bio          string         `gorm:"type:text" json:"bio,omitempty"`
	Role         string         `gorm:"type:varchar(20);default:user" json:"role"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations 关联关系
	Articles []Article `gorm:"foreignKey:AuthorID" json:"articles,omitempty"`
}

// TableName 返回用户表名
func (User) TableName() string {
	return "users"
}

// 用户角色常量
const (
	RoleUser      = "user"
	RoleAdmin     = "admin"
	RoleModerator = "moderator"
)
