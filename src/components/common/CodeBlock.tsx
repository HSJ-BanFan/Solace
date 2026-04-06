import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Icon } from '@iconify/react';

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
}

// 语言显示名称映射
const LANGUAGE_NAMES: Record<string, string> = {
  js: 'JavaScript', javascript: 'JavaScript',
  ts: 'TypeScript', typescript: 'TypeScript',
  py: 'Python', python: 'Python',
  go: 'Go', rust: 'Rust', java: 'Java',
  cpp: 'C++', c: 'C', cs: 'C#', csharp: 'C#',
  php: 'PHP', rb: 'Ruby', ruby: 'Ruby',
  swift: 'Swift', kt: 'Kotlin', kotlin: 'Kotlin',
  sql: 'SQL', sh: 'Shell', shell: 'Shell', bash: 'Bash',
  json: 'JSON', yaml: 'YAML', yml: 'YAML',
  xml: 'XML', html: 'HTML', css: 'CSS',
  scss: 'SCSS', sass: 'Sass', less: 'Less',
  md: 'Markdown', markdown: 'Markdown',
  dockerfile: 'Dockerfile', docker: 'Docker',
  makefile: 'Makefile', lua: 'Lua', perl: 'Perl',
  r: 'R', matlab: 'MATLAB',
  vue: 'Vue', svelte: 'Svelte',
  jsx: 'JSX', tsx: 'TSX',
  graphql: 'GraphQL', gql: 'GraphQL',
  toml: 'TOML', ini: 'INI', diff: 'Diff',
  plaintext: 'Text', text: 'Text', plain: 'Text',
};

function getLanguageName(lang: string): string {
  if (!lang) return 'Code';
  const normalized = lang.toLowerCase().replace('language-', '');
  return LANGUAGE_NAMES[normalized] || normalized.toUpperCase();
}

// 模拟 Mac 窗口控制按钮
const WindowControls = memo(function WindowControls() {
  return (
    <div className="flex items-center gap-1.5 ml-1">
      <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-sm"></div>
      <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-sm"></div>
      <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-sm"></div>
    </div>
  );
});

function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export const CodeBlock = memo(function CodeBlock({ children, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const isDark = useDarkMode();

  const langMatch = className?.match(/language-(\w+)/);
  const lang = langMatch?.[1] || language || 'text';
  const langDisplay = getLanguageName(lang);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [children]);

  // 行号数据
  const lines = children.split('\n');
  const lineCount = lines.length;

  // 主题色配置统一使用 CSS 变量，但在组件内做回退保护
  const theme = useMemo(() => isDark ? {
    bg: 'var(--codeblock-bg, #282c34)',
    headerBg: 'var(--codeblock-header-bg, #21252b)',
    lineNumBg: 'var(--codeblock-line-bg, #21252b)',
    lineNumColor: 'var(--codeblock-line-color, #5c6370)',
    border: 'var(--codeblock-border, rgba(255, 255, 255, 0.08))',
    text: 'var(--codeblock-btn-color, #abb2bf)',
    btnBg: 'var(--codeblock-btn-bg, #3e4451)',
    btnHover: 'var(--codeblock-btn-hover, #4e5666)',
  } : {
    bg: 'var(--codeblock-bg, #fafafa)',
    headerBg: 'var(--codeblock-header-bg, #f0f0f0)',
    lineNumBg: 'var(--codeblock-line-bg, #f5f5f5)',
    lineNumColor: 'var(--codeblock-line-color, #999)',
    border: 'var(--codeblock-border, rgba(0, 0, 0, 0.06))',
    text: 'var(--codeblock-btn-color, #383a42)',
    btnBg: 'var(--codeblock-btn-bg, #e1e4e8)',
    btnHover: 'var(--codeblock-btn-hover, #d1d5da)',
  }, [isDark]);

  return (
    <div className="code-block group my-6 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.bg }}>
      {/* 头部：Mac 按钮 + 语言标识 + 复制按钮 */}
      <div
        className="flex items-center justify-between px-4 py-2.5 relative"
        style={{ backgroundColor: theme.headerBg, borderBottom: `1px solid ${theme.border}` }}
      >
        <WindowControls />

        {/* 语言显示居中 */}
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium tracking-wider"
          style={{ color: 'var(--codeblock-lang-color, #888)', fontFamily: "'JetBrains Mono Variable', monospace" }}
        >
          {langDisplay}
        </span>

        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{ backgroundColor: theme.btnBg, color: theme.text }}
          aria-label="Copy code"
          title="Copy code"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnBg)}
        >
          {copied ? (
            <Icon icon="lucide:check" className="w-4 h-4 text-green-500" />
          ) : (
            <Icon icon="lucide:copy" className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 代码区域：行号 + 代码 */}
      <div className="flex relative">
        {/* 行号列 */}
        <div
          className="flex-shrink-0 py-[1rem] pr-3 pl-4 text-right select-none border-r"
          style={{
            backgroundColor: theme.lineNumBg,
            borderColor: theme.border,
            minWidth: '3.5rem',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-[0.9rem] leading-[1.6]"
              style={{ color: theme.lineNumColor, fontFamily: "'JetBrains Mono Variable', monospace" }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* 代码内容 */}
        <div className="flex-1 overflow-x-auto scrollbar-hide group-hover:scrollbar-default transition-all relative code-content-wrapper">
          {/* 这里移除 SyntaxHighlighter 默认添加的背景色，仅使用其文字颜色和布局 */}
          <SyntaxHighlighter
            language={lang}
            style={isDark ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent', // 确保无底色
              fontSize: '0.9rem',
              lineHeight: '1.6',
              fontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
            codeTagProps={{
              style: {
                fontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                background: 'transparent', // 再次确保无底色
              },
            }}
            PreTag="div"
          >
            {children}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
});