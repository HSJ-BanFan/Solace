<div align="center">

# Solace

**一个现代化的全栈博客系统**

[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React Version](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

[功能特性](#-功能特性) • [技术栈](#-技术栈) • [快速开始](#-快速开始) • [架构设计](#-架构设计) • [API 文档](#-api-文档)

English | [**简体中文**](./README_CN.md)

</div>

---

## 项目简介

Solace 是一个生产就绪的全栈博客平台，采用现代技术栈构建。后端基于 Go 语言的高性能 Clean Architecture 架构，前端采用响应式 React 设计，提供卓越的开发体验。

系统支持 Markdown 文章管理、分类标签组织、相册展示、访客足迹可视化、SEO 优化以及深色模式等功能。

## ✨ 功能特性

### 内容管理
- 📝 **Markdown 编辑器** - 完整的 Markdown 支持，代码语法高亮
- 🏷️ **分类与标签** - 灵活的内容组织系统
- 🖼️ **相册展示** - 图片懒加载与灯箱查看器
- 🔍 **全文搜索** - 快速文章搜索功能

### 用户体验
- 📊 **访客足迹** - 基于 ECharts 的世界地图可视化
- 🌙 **深色模式** - 自动跟随系统偏好
- 📱 **响应式设计** - 移动优先，适配所有设备
- ⚡ **性能优化** - 代码分割、懒加载、CDN 就绪

### 技术亮点
- 🔐 **JWT 认证** - 安全的用户身份验证
- 📖 **自动 API 文档** - Swagger/OpenAPI 文档自动生成
- 🐳 **Docker 就绪** - 容器化部署
- 🔄 **热重载** - 快速开发迭代

## 🛠 技术栈

### 后端

| 类别 | 技术 |
|------|------|
| 语言 | Go 1.25+ |
| 框架 | Gin |
| ORM | GORM |
| 数据库 | PostgreSQL |
| 认证 | JWT (golang-jwt) |
| 日志 | zerolog |
| API 文档 | Swagger (swaggo) |
| 配置 | TOML |

### 前端

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 语言 | TypeScript 5.6 |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS 3 |
| 服务端状态 | TanStack Query |
| 客户端状态 | Zustand |
| 路由 | React Router 7 |
| 表单 | React Hook Form + Zod |
| 图表 | ECharts |
| 图标 | Iconify |

## 📦 项目结构

```
.
├── backend/                    # Go 后端服务
│   ├── cmd/                    # 应用程序入口
│   │   └── server/main.go      # 服务启动入口
│   ├── internal/               # 私有应用代码
│   │   ├── handler/            # HTTP 处理器（控制器）
│   │   ├── service/            # 业务逻辑层
│   │   ├── repository/         # 数据访问层
│   │   ├── model/              # 领域实体
│   │   ├── middleware/         # HTTP 中间件
│   │   └── docs/               # Swagger 文档
│   ├── migrations/             # 数据库迁移
│   ├── config.toml.example     # 配置模板
│   ├── Dockerfile              # 后端容器
│   └── Makefile                # 构建自动化
│
├── frontend/                   # React 前端应用
│   ├── src/
│   │   ├── components/         # 可复用 UI 组件
│   │   │   ├── ui/             # 基础 UI 原语
│   │   │   └── layout/         # 布局组件
│   │   ├── features/           # 功能模块
│   │   │   ├── articles/       # 文章功能
│   │   │   ├── auth/           # 认证功能
│   │   │   ├── gallery/        # 相册功能
│   │   │   └── admin/          # 管理后台
│   │   ├── hooks/              # 自定义 React Hooks
│   │   ├── api/                # API 客户端与类型
│   │   ├── stores/             # Zustand 状态存储
│   │   ├── utils/              # 工具函数
│   │   └── types/              # TypeScript 类型定义
│   ├── public/                 # 静态资源
│   ├── Dockerfile              # 前端容器
│   └── nginx.conf              # Nginx 配置
│
├── docker-compose.yml          # Docker Compose 编排
├── build-docker.sh             # Docker 构建脚本
└── README.md                   # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- **Go** 1.25 或更高版本
- **Node.js** 18 或更高版本
- **PostgreSQL** 15 或更高版本
- **Docker**（可选，用于容器化部署）

### 方式一：本地开发

#### 1. 克隆仓库

```bash
git clone https://github.com/domye/Solace.git
cd Solace
```

#### 2. 后端设置

```bash
cd backend

# 复制并配置环境变量
cp config.toml.example config.toml
# 编辑 config.toml 填写数据库连接信息

# 安装依赖并运行
go mod download
go run cmd/server/main.go
```

后端服务运行于 `http://localhost:8080`

#### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用运行于 `http://localhost:5173`

### 方式二：Docker 部署

```bash
# 创建配置目录
mkdir -p config
cp backend/config.toml.example config/config.toml

# 编辑配置文件
# vim config/config.toml

# 启动所有服务
docker-compose up -d
```

服务地址：
- 前端：`http://localhost:8088`
- 后端 API：`http://localhost:8080`
- API 文档：`http://localhost:8080/swagger/index.html`

## 🏗 架构设计

### 后端架构（Clean Architecture）

```
┌─────────────────────────────────────────────────────────────┐
│                        Handler 层                            │
│                  （HTTP 请求/响应处理）                       │
├─────────────────────────────────────────────────────────────┤
│                        Service 层                            │
│                   （业务逻辑与编排）                          │
├─────────────────────────────────────────────────────────────┤
│                       Repository 层                          │
│                    （数据访问与查询）                         │
├─────────────────────────────────────────────────────────────┤
│                        Model 层                              │
│                      （领域实体）                             │
└─────────────────────────────────────────────────────────────┘
```

### 前端架构

```
┌─────────────────────────────────────────────────────────────┐
│                          Pages                               │
│                   （React Router 路由页面）                   │
├─────────────────────────────────────────────────────────────┤
│                        Features                              │
│             （功能模块化组织）                                │
├─────────────────────────────────────────────────────────────┤
│                       Components                             │
│                 （可复用 UI 组件）                            │
├─────────────────────────────────────────────────────────────┤
│                         Hooks                                │
│           （数据与行为的自定义 Hooks）                        │
├─────────────────────────────────────────────────────────────┤
│                 API Client & Stores                          │
│      （TanStack Query + Zustand 状态管理）                   │
└─────────────────────────────────────────────────────────────┘
```

## 📖 API 文档

启动后端后，访问 Swagger 文档：

```
http://localhost:8080/swagger/index.html
```

### API 端点概览

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/api/v1/articles` | 获取文章列表 |
| `GET` | `/api/v1/articles/:slug` | 根据 slug 获取文章 |
| `POST` | `/api/v1/articles` | 创建文章（需认证） |
| `PUT` | `/api/v1/articles/:id` | 更新文章（需认证） |
| `DELETE` | `/api/v1/articles/:id` | 删除文章（需认证） |
| `GET` | `/api/v1/categories` | 获取分类列表 |
| `GET` | `/api/v1/tags` | 获取标签列表 |
| `GET` | `/api/v1/albums` | 获取相册列表 |
| `POST` | `/api/v1/auth/login` | 用户登录 |
| `POST` | `/api/v1/auth/register` | 用户注册 |

## 📝 可用脚本

### 后端

```bash
# 开发模式
go run cmd/server/main.go

# 构建
go build -o bin/server cmd/server/main.go

# 测试
go test ./... -cover

# 代码检查
golangci-lint run

# 生成 Swagger 文档
swag init -g cmd/server/main.go -o internal/docs
```

### 前端

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run typecheck

# 代码检查
npm run lint
```

## 🔧 配置说明

### 后端配置（config.toml）

```toml
[server]
port = 8080
mode = "debug"  # debug, release, test

[database]
host = "localhost"
port = 5432
name = "blog"
user = "postgres"
password = "your_password"

[jwt]
secret = "your_jwt_secret"
expire = 24  # hours
```

### 前端环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `VITE_API_BASE` | 后端 API 地址 | `/api/v1` |
| `SITE_BASE_URL` | 站点基础 URL | - |
| `SITE_NAME` | 站点名称 | `Solace` |
| `SITE_DESCRIPTION` | 站点描述 | - |

## 🤝 参与贡献

欢迎参与贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Gin](https://github.com/gin-gonic/gin) - HTTP Web 框架
- [GORM](https://gorm.io/) - ORM 库
- [React](https://react.dev/) - UI 库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [TanStack Query](https://tanstack.com/query) - 数据请求库

---

<div align="center">

**[⬆ 返回顶部](#solace)**

由 [domye](https://github.com/domye) 用 ❤️ 构建

</div>
