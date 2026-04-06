package slug

import (
	"fmt"
	"regexp"
	"strings"
	"time"
)

var (
	// 匹配非字母数字字符（连字符除外）
	nonAlphanumericRegex = regexp.MustCompile(`[^a-zA-Z0-9\-]`)
	// 匹配多个连续连字符
	multipleHyphensRegex = regexp.MustCompile(`-+`)
)

// Generate 从字符串生成 slug
func Generate(s string) string {
	// 转换为小写
	s = strings.ToLower(s)

	// 将空格替换为连字符
	s = strings.ReplaceAll(s, " ", "-")

	// 移除非字母数字字符（连字符除外）
	s = nonAlphanumericRegex.ReplaceAllString(s, "")

	// 将多个连字符合并为单个
	s = multipleHyphensRegex.ReplaceAllString(s, "-")

	// 去除首尾的连字符
	s = strings.Trim(s, "-")

	// 限制长度
	if len(s) > 200 {
		s = s[:200]
	}

	return s
}

// GenerateWithTimestamp 生成带时间戳后缀的 slug 以确保唯一性
func GenerateWithTimestamp(s string) string {
	slug := Generate(s)
	timestamp := time.Now().Unix()
	return fmt.Sprintf("%s-%d", slug, timestamp)
}
