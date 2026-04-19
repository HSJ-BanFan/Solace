<div align="center">

# Solace

**A Modern Full-Stack Blog System**

[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React Version](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Docs](#-api-documentation)

[**简体中文**](./README_CN.md) | English

</div>

---

## Overview

Solace is a production-ready, full-stack blog platform built with modern technologies. It features a high-performance Go backend with clean architecture and a responsive React frontend with an exceptional developer experience.

The system supports article management with Markdown, category/tag organization, photo albums with lazy loading, visitor footprint visualization, SEO optimization, and dark mode support.

## ✨ Features

### Content Management
- 📝 **Markdown Editor** - Full Markdown support with syntax highlighting
- 🏷️ **Categories & Tags** - Flexible content organization system
- 🖼️ **Photo Albums** - Lazy loading images with lightbox viewer
- 🔍 **Full-text Search** - Fast article search functionality

### User Experience
- 📊 **Visitor Footprints** - ECharts-powered world map visualization
- 🌙 **Dark Mode** - Auto-follow system preference
- 📱 **Responsive Design** - Mobile-first, works on all devices
- ⚡ **Performance Optimized** - Code splitting, lazy loading, CDN ready

### Technical Excellence
- 🔐 **JWT Authentication** - Secure user authentication
- 📖 **Auto API Docs** - Swagger/OpenAPI documentation
- 🐳 **Docker Ready** - Containerized deployment
- 🔄 **Hot Reload** - Fast development iteration

## 🛠 Tech Stack

### Backend

| Category | Technology |
|----------|------------|
| Language | Go 1.25+ |
| Framework | Gin |
| ORM | GORM |
| Database | PostgreSQL |
| Auth | JWT (golang-jwt) |
| Logging | zerolog |
| API Docs | Swagger (swaggo) |
| Config | TOML |

### Frontend

| Category | Technology |
|----------|------------|
| Framework | React 18 |
| Language | TypeScript 5.6 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| State (Server) | TanStack Query |
| State (Client) | Zustand |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| Charts | ECharts |
| Icons | Iconify |

## 📦 Project Structure

```
.
├── backend/                    # Go backend service
│   ├── cmd/                    # Application entrypoints
│   │   └── server/main.go      # Server entry point
│   ├── internal/               # Private application code
│   │   ├── handler/            # HTTP handlers (controllers)
│   │   ├── service/            # Business logic layer
│   │   ├── repository/         # Data access layer
│   │   ├── model/              # Domain entities
│   │   ├── middleware/         # HTTP middlewares
│   │   └── docs/               # Swagger documentation
│   ├── migrations/             # Database migrations
│   ├── config.toml.example     # Configuration template
│   ├── Dockerfile              # Backend container
│   └── Makefile                # Build automation
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/             # Base UI primitives
│   │   │   └── layout/         # Layout components
│   │   ├── features/           # Feature-based modules
│   │   │   ├── articles/       # Article feature
│   │   │   ├── auth/           # Authentication
│   │   │   ├── gallery/        # Photo albums
│   │   │   └── admin/          # Admin dashboard
│   │   ├── hooks/              # Custom React hooks
│   │   ├── api/                # API client & types
│   │   ├── stores/             # Zustand stores
│   │   ├── utils/              # Utility functions
│   │   └── types/              # TypeScript definitions
│   ├── public/                 # Static assets
│   ├── Dockerfile              # Frontend container
│   └── nginx.conf              # Nginx configuration
│
├── docker-compose.yml          # Docker Compose orchestration
├── build-docker.sh             # Docker build script
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Go** 1.25 or later
- **Node.js** 18 or later
- **PostgreSQL** 15 or later
- **Docker** (optional, for containerized deployment)

### Option 1: Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/domye/Solace.git
cd Solace
```

#### 2. Backend Setup

```bash
cd backend

# Copy and configure environment
cp config.toml.example config.toml
# Edit config.toml with your database credentials

# Install dependencies and run
go mod download
go run cmd/server/main.go
```

Backend will be available at `http://localhost:8080`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Option 2: Docker Deployment

```bash
# Create config directory
mkdir -p config
cp backend/config.toml.example config/config.toml

# Edit configuration
# vim config/config.toml

# Start all services
docker-compose up -d
```

Services:
- Frontend: `http://localhost:8088`
- Backend API: `http://localhost:8080`
- API Docs: `http://localhost:8080/swagger/index.html`

## 🏗 Architecture

### Backend Architecture (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                        Handler Layer                         │
│              (HTTP Request/Response Handling)                │
├─────────────────────────────────────────────────────────────┤
│                        Service Layer                         │
│                  (Business Logic & Orchestration)            │
├─────────────────────────────────────────────────────────────┤
│                      Repository Layer                        │
│                   (Data Access & Queries)                    │
├─────────────────────────────────────────────────────────────┤
│                        Model Layer                           │
│                     (Domain Entities)                        │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          Pages                               │
│                   (React Router Routes)                      │
├─────────────────────────────────────────────────────────────┤
│                      Features                                │
│          (Feature-based module organization)                 │
├─────────────────────────────────────────────────────────────┤
│                     Components                               │
│              (Reusable UI components)                        │
├─────────────────────────────────────────────────────────────┤
│                       Hooks                                  │
│           (Custom hooks for data & behavior)                 │
├─────────────────────────────────────────────────────────────┤
│              API Client & Stores                             │
│    (TanStack Query + Zustand for state management)          │
└─────────────────────────────────────────────────────────────┘
```

## 📖 API Documentation

After starting the backend, access the Swagger documentation at:

```
http://localhost:8080/swagger/index.html
```

### API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/articles` | List all articles |
| `GET` | `/api/v1/articles/:slug` | Get article by slug |
| `POST` | `/api/v1/articles` | Create article (auth required) |
| `PUT` | `/api/v1/articles/:id` | Update article (auth required) |
| `DELETE` | `/api/v1/articles/:id` | Delete article (auth required) |
| `GET` | `/api/v1/categories` | List categories |
| `GET` | `/api/v1/tags` | List tags |
| `GET` | `/api/v1/albums` | List photo albums |
| `POST` | `/api/v1/auth/login` | User login |
| `POST` | `/api/v1/auth/register` | User registration |

## 📝 Available Scripts

### Backend

```bash
# Development
go run cmd/server/main.go

# Build
go build -o bin/server cmd/server/main.go

# Tests
go test ./... -cover

# Lint
golangci-lint run

# Generate Swagger docs
swag init -g cmd/server/main.go -o internal/docs
```

### Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Lint
npm run lint
```

## 🔧 Configuration

### Backend (config.toml)

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

### Frontend Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API URL | `/api/v1` |
| `SITE_BASE_URL` | Site base URL | - |
| `SITE_NAME` | Site name | `Solace` |
| `SITE_DESCRIPTION` | Site description | - |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Gin](https://github.com/gin-gonic/gin) - HTTP web framework
- [GORM](https://gorm.io/) - ORM library
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [TanStack Query](https://tanstack.com/query) - Data fetching

---

<div align="center">

**[⬆ Back to Top](#solace)**

Made with ❤️ by [domye](https://github.com/domye)

</div>
