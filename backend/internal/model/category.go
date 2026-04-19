package model

import (
	"time"

	"gorm.io/gorm"
)

// Category 分类实体
type Category struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	Slug        string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"slug"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	ParentID    *uint          `gorm:"index" json:"parent_id,omitempty"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations 关联关系
	Parent   *Category  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []Category `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Articles []Article  `gorm:"foreignKey:CategoryID" json:"articles,omitempty"`
}

// TableName 返回分类表名
func (Category) TableName() string {
	return "categories"
}

// CategoryWithCount 分类带文章数统计
type CategoryWithCount struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	Description  string `json:"description,omitempty"`
	ParentID     *uint  `json:"parent_id,omitempty"`
	SortOrder    int    `json:"sort_order"`
	ArticleCount int    `json:"article_count"`
}
