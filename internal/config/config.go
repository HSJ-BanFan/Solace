package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config 应用配置结构体
type Config struct {
	// Server 服务器配置
	ServerPort    string
	ServerMode    string // debug, release, test

	// Database 数据库配置
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// JWT 令牌配置
	JWTSecret          string
	JWTAccessDuration  time.Duration
	JWTRefreshDuration time.Duration

	// Logging 日志配置
	LogLevel string
	LogEnv   string // development, production

	// Migration 迁移配置
	MigrationPath string
}

// Load 从环境变量加载配置
func Load() *Config {
	// 加载 .env 文件（如果不存在则忽略，使用系统环境变量）
	_ = godotenv.Load()

	return &Config{
		ServerPort:    getEnv("SERVER_PORT", "8080"),
		ServerMode:    getEnv("SERVER_MODE", "debug"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "blog"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		JWTSecret:          getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTAccessDuration:  getDurationEnv("JWT_ACCESS_DURATION", 15*time.Minute),
		JWTRefreshDuration: getDurationEnv("JWT_REFRESH_DURATION", 7*24*time.Hour),

		LogLevel: getEnv("LOG_LEVEL", "info"),
		LogEnv:   getEnv("LOG_ENV", "development"),

		MigrationPath: getEnv("MIGRATION_PATH", "migrations"),
	}
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getDurationEnv 获取时间类型的环境变量（单位：分钟）
func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		minutes, err := strconv.Atoi(value)
		if err != nil {
			return defaultValue
		}
		return time.Duration(minutes) * time.Minute
	}
	return defaultValue
}

// GetDSN 返回数据库连接字符串
func (c *Config) GetDSN() string {
	return "host=" + c.DBHost +
		" port=" + c.DBPort +
		" user=" + c.DBUser +
		" password=" + c.DBPassword +
		" dbname=" + c.DBName +
		" sslmode=" + c.DBSSLMode
}