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
      // 极限压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          // 移除 console（生产环境）
          drop_console: mode === 'production',
          // 移除 debugger
          drop_debugger: true,
          // 移除无用代码
          dead_code: true,
          // 优化条件表达式
          conditionals: true,
          // 移除未使用的变量
          unused: true,
          // 合并连续声明
          sequences: true,
          // 优化布尔值
          booleans: true,
          // 内联简单函数
          inline: 2,
        },
        format: {
          // 移除注释
          comments: false,
        },
      },
      // CSS 配置
      cssMinify: true,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // React 核心 - 基础框架（保持合并以减少请求）
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
      // 优化 preload - 只 preload 首屏需要的 chunks
      modulePreload: {
        polyfill: true,
        resolveDependencies: (url, deps) => {
          // 只 preload 首屏必需的依赖
          const firstScreenChunks = ['vendor-react', 'vendor-query'];
          return deps.filter(dep => 
            firstScreenChunks.some(chunk => dep.includes(chunk))
          );
        },
      },
      // 提高块大小警告阈值（因为我们有懒加载）
      chunkSizeWarningLimit: 1000,
    },
  }
})
