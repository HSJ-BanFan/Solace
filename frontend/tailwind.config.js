/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  // 性能优化：禁用不需要的核心插件
  corePlugins: {
    preflight: true, // 保持基础样式重置
    container: false, // 不使用 container 类
  },
  // 性能优化：只保留需要的变体
  variants: {
    extend: {
      // 仅保留实际使用的变体
    },
  },
  theme: {
    extend: {
      screens: {
        '3xl': '1700px',
      },
      colors: {
        primary: 'var(--primary)',
      },
      borderRadius: {
        'large': 'var(--radius-large)',
        'medium': 'var(--radius-medium)',
        'small': 'var(--radius-small)',
      },
      fontFamily: {
        mono: ['JetBrains Mono Variable', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
      }
    },
  },
  plugins: [],
}
