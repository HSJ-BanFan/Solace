import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { memo, useEffect, useMemo } from 'react';
import type { TocHeading } from '@/components/widget/TableOfContents';
import { CodeBlock } from './CodeBlock';
import { LazyImage } from './LazyImage';

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

  // 自定义组件
  const components = useMemo(() => ({
    // 标题添加锚点支持
    h1: ({ children }: { children?: React.ReactNode }) => {
      const text = String(children || '');
      const id = generateHeadingId(text);
      return (
        <h1 id={id} className="text-3xl font-bold mt-8 mb-4 text-90 scroll-mt-24 transition-colors">
          <a href={`#${id}`} className="!text-90 hover:!text-[var(--primary)] !border-none !bg-transparent before:content-['#'] before:absolute before:-left-6 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:text-[var(--primary)] relative">
            {children}
          </a>
        </h1>
      );
    },
    h2: ({ children }: { children?: React.ReactNode }) => {
      const text = String(children || '');
      const id = generateHeadingId(text);
      return (
        <h2 id={id} className="text-2xl font-bold mt-6 mb-3 text-90 scroll-mt-24 transition-colors">
          <a href={`#${id}`} className="!text-90 hover:!text-[var(--primary)] !border-none !bg-transparent before:content-['#'] before:absolute before:-left-6 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:text-[var(--primary)] relative">
            {children}
          </a>
        </h2>
      );
    },
    h3: ({ children }: { children?: React.ReactNode }) => {
      const text = String(children || '');
      const id = generateHeadingId(text);
      return (
        <h3 id={id} className="text-xl font-bold mt-4 mb-2 text-90 scroll-mt-24 transition-colors">
          <a href={`#${id}`} className="!text-90 hover:!text-[var(--primary)] !border-none !bg-transparent before:content-['#'] before:absolute before:-left-6 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:text-[var(--primary)] relative">
            {children}
          </a>
        </h3>
      );
    },
    h4: ({ children }: { children?: React.ReactNode }) => {
      const text = String(children || '');
      const id = generateHeadingId(text);
      return (
        <h4 id={id} className="text-lg font-bold mt-3 mb-2 text-90 scroll-mt-24 transition-colors">
          <a href={`#${id}`} className="!text-90 hover:!text-[var(--primary)] !border-none !bg-transparent before:content-['#'] before:absolute before:-left-6 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:text-[var(--primary)] relative">
            {children}
          </a>
        </h4>
      );
    },

    // 段落
    p: ({ children }: { children?: React.ReactNode }) => <p className="mb-4 leading-relaxed text-75">{children}</p>,

    // 链接
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-[var(--primary)] underline decoration-[var(--link-underline)] decoration-dashed underline-offset-4 hover:decoration-transparent hover:bg-[var(--btn-plain-bg-hover)] transition-smooth"
      >
        {children}
      </a>
    ),

    // pre 元素 - 简化处理
    pre: ({ children }: { children?: React.ReactNode }) => {
      // 直接渲染 children（code 组件会处理代码块逻辑）
      return <>{children}</>;
    },

    // code 元素 - 处理代码块和行内代码
    code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const isBlock = className?.includes('hljs') || className?.includes('language-');

      if (isBlock) {
        // 这是代码块，将 children 转为字符串
        const langMatch = className?.match(/language-(\w+)/);
        const lang = langMatch ? langMatch[1] : '';

        // 提取纯文本内容
        const codeText = typeof children === 'string'
          ? children
          : React.Children.toArray(children)
              .map((c) => {
                if (typeof c === 'string') return c;
                if (React.isValidElement(c) && c.props.children) {
                  return c.props.children;
                }
                return '';
              })
              .join('');

        return (
          <CodeBlock className={className || ''} language={lang}>
            {codeText}
          </CodeBlock>
        );
      }

      // 行内代码
      return (
        <code className="bg-[var(--inline-code-bg)] text-[var(--inline-code-color)] px-1.5 py-0.5 rounded-[var(--radius-small)] font-mono text-sm">
          {children}
        </code>
      );
    },

    // 列表
    ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside mb-4 space-y-2 text-75">{children}</ul>,
    ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-75">{children}</ol>,
    li: ({ children }: { children?: React.ReactNode }) => <li className="marker:text-[var(--primary)]">{children}</li>,

    // 引用块
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="not-italic border-l-4 border-[var(--primary)] pl-4 py-2 my-4 bg-[var(--btn-regular-bg)] rounded-r-[var(--radius-medium)] text-75">
        {children}
      </blockquote>
    ),

    // 分隔线
    hr: () => <hr className="my-6 border-t border-[var(--border-medium)]" />,

    // 图片
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <LazyImage
        src={src || ''}
        alt={alt}
        className="max-w-full h-auto rounded-[var(--radius-large)] my-4 mx-auto"
        effect="blur"
      />
    ),

    // 表格
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-4 rounded-[var(--radius-large)] border border-[var(--border-light)]">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => <thead className="bg-[var(--btn-regular-bg)]">{children}</thead>,
    tbody: ({ children }: { children?: React.ReactNode }) => <tbody>{children}</tbody>,
    tr: ({ children }: { children?: React.ReactNode }) => <tr className="border-t border-[var(--border-light)]">{children}</tr>,
    th: ({ children }: { children?: React.ReactNode }) => <th className="px-4 py-2 text-left font-bold text-90">{children}</th>,
    td: ({ children }: { children?: React.ReactNode }) => <td className="px-4 py-2 text-75">{children}</td>,
  }), []);

  return (
    <div className={`custom-md ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
