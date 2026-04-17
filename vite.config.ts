import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      // 打包分析工具 - 生成 stats.html 可视化报告
      visualizer({ open: false, gzipSize: true }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          // 从环境变量读取后端地址，默认 localhost:8080
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React 核心 - 基础框架
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // 状态管理
            'vendor-query': ['@tanstack/react-query', 'zustand'],
            // Markdown 渲染 - 较大，单独拆分
            'vendor-markdown': ['react-markdown', 'remark-gfm', 'remark-directive', 'unist-util-visit'],
            // 代码高亮 - 最大的包，单独拆分
            'vendor-highlight': ['react-syntax-highlighter'],
            // 图片相关组件
            'vendor-image': ['react-lazy-load-image-component', 'react-photo-album', 'yet-another-react-lightbox'],
            // ECharts 地图 - 按需导入后单独拆分
            'vendor-echarts': ['echarts'],
          },
        },
      },
    },
  }
})
