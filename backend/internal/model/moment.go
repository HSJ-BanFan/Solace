package model

import (
	"time"

	"gorm.io/gorm"
)

// Moment 说说实体（纯文字碎碎念）
type Moment struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	Content   string         `gorm:"type:varchar(200);not null" json:"content"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 返回说说表名
func (Moment) TableName() string {
	return "moments"
}
