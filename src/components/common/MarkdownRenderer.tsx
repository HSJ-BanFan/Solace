import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { memo, useEffect } from 'react';
import type { TocHeading } from '@/components/widget/TableOfContents';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onHeadingsExtracted?: (headings: TocHeading[]) => void;
}

// 生成标题 ID 的辅助函数
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留中文、英文、数字、空格、连字符
    .replace(/\s+/g, '-') // 空格转连字符
    .replace(/-+/g, '-') // 多个连字符合并
    .replace(/^-|-$/g, ''); // 移除首尾连字符
}

// 从 markdown 内容提取标题
export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    // 匹配 ATX 风格标题 (# 标题)
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match && match[1] && match[2]) {
      const depth = match[1].length;
      const text = match[2].trim();
      const id = generateHeadingId(text);
      headings.push({ id, text, depth });
    }
  });

  return headings;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, className = '', onHeadingsExtracted }: MarkdownRendererProps) {
  // 提取标题并通知父组件
  useEffect(() => {
    if (onHeadingsExtracted) {
      const headings = extractHeadings(content);
      onHeadingsExtracted(headings);
    }
  }, [content, onHeadingsExtracted]);

  return (
    <div className={`custom-md ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 标题添加锚点支持
          h1: ({ children }) => {
            const text = String(children);
            const id = generateHeadingId(text);
            return (
              <h1 id={id} className="text-3xl font-bold mt-8 mb-4 text-90 scroll-mt-20">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = String(children);
            const id = generateHeadingId(text);
            return (
              <h2 id={id} className="text-2xl font-bold mt-6 mb-3 text-90 scroll-mt-20">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = generateHeadingId(text);
            return (
              <h3 id={id} className="text-xl font-bold mt-4 mb-2 text-90 scroll-mt-20">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => {
            const text = String(children);
            const id = generateHeadingId(text);
            return (
              <h4 id={id} className="text-lg font-bold mt-3 mb-2 text-90 scroll-mt-20">
                {children}
              </h4>
            );
          },

          // 段落
          p: ({ children }) => <p className="mb-4 leading-relaxed text-75">{children}</p>,

          // 链接
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-[var(--primary)] underline decoration-[var(--link-underline)] decoration-dashed underline-offset-4 hover:decoration-transparent hover:bg-[var(--btn-plain-bg-hover)] transition-smooth"
            >
              {children}
            </a>
          ),

          // 代码块
          pre: ({ children }) => (
            <pre className="expressive-code my-4 overflow-x-auto rounded-[var(--radius-large)] bg-[var(--codeblock-bg)]">
              {children}
            </pre>
          ),

          // 行内代码
          code: ({ className, children }) => {
            // 如果有语言类名，说明是代码块内的
            const isBlock = className?.includes('hljs');
            if (isBlock) {
              return <code className={className}>{children}</code>;
            }
            return (
              <code className="bg-[var(--inline-code-bg)] text-[var(--inline-code-color)] px-1.5 py-0.5 rounded-[var(--radius-small)] font-mono text-sm">
                {children}
              </code>
            );
          },

          // 列表
          ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-75">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-75">{children}</ol>,
          li: ({ children }) => <li className="marker:text-[var(--primary)]">{children}</li>,

          // 引用块
          blockquote: ({ children }) => (
            <blockquote className="not-italic border-l-2 border-[var(--primary)] pl-4 py-2 my-4 bg-[var(--btn-regular-bg)] rounded-r-[var(--radius-medium)] text-75">
              {children}
            </blockquote>
          ),

          // 分隔线
          hr: () => <hr className="my-6 border-t border-[var(--border-medium)]" />,

          // 图片
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-[var(--radius-large)] my-4 mx-auto"
              loading="lazy"
            />
          ),

          // 表格
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-[var(--radius-large)] border border-[var(--border-light)]">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[var(--btn-regular-bg)]">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-t border-[var(--border-light)]">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-2 text-left font-bold text-90">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2 text-75">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});