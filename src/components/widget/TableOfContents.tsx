/**
 * 目录组件
 *
 * - 只展示一级、二级、三级标题
 * - 支持独立滚动，防止页面短但 TOC 长的情况
 */

import { useRef, useMemo, memo } from 'react';
import { useTocScroll, useActiveIndicator } from '@/hooks';

export interface TocHeading {
  id: string;
  text: string;
  depth: number;
}

interface TableOfContentsProps {
  headings: TocHeading[];
  className?: string;
  maxDepth?: number;
}

export const TableOfContents = memo(function TableOfContents({
  headings,
  className = '',
  maxDepth = 3
}: TableOfContentsProps) {
  const tocRef = useRef<HTMLDivElement>(null);

  // 过滤只显示 depth <= maxDepth 的标题
  const filteredHeadings = useMemo(() =>
    headings.filter(h => h.depth <= maxDepth),
    [headings, maxDepth]
  );

  // 最小层级（用于计算缩进）
  const minDepth = filteredHeadings.length > 0
    ? Math.min(...filteredHeadings.map(h => h.depth))
    : 1;

  // 滚动逻辑
  const { activeId, handleClick } = useTocScroll({ headings: filteredHeadings });

  // 活动指示器位置
  const indicatorStyle = useActiveIndicator({ activeId, containerRef: tocRef });

  if (filteredHeadings.length === 0) return null;

  return (
    <div ref={tocRef} className={`toc-container select-none relative ${className}`}>
      {/* 标题 */}
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-90 mb-4 px-4 opacity-80">
        <div className="w-1.5 h-4 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" />
        TABLE OF CONTENTS
      </div>

      {/* 可滚动的导航区域 */}
      <nav className="relative flex flex-col pl-1 py-2">
        {/* 背景线条 */}
        <div className="absolute left-[1.125rem] top-2 bottom-2 w-[2px] bg-[var(--border-light)] z-0 rounded-full" />

        {/* 活动指示器 */}
        <div
          className="absolute left-[1.125rem] w-[2px] bg-[var(--primary)] z-10 transition-all duration-300 ease-out rounded-full shadow-[0_0_8px_var(--primary)]"
          style={{
            top: `${indicatorStyle.top}px`,
            height: `${indicatorStyle.height}px`,
            opacity: indicatorStyle.opacity,
            transform: 'translateX(-50%)',
          }}
        />

        {/* 可滚动的标题列表 */}
        <div
          className="toc-scroll-container overflow-y-auto overflow-x-hidden max-h-[calc(100vh-180px)]
            scrollbar-thin scrollbar-thumb-[var(--border-light)] scrollbar-track-transparent
            hover:scrollbar-thumb-[var(--primary)]"
          style={{ scrollbarGutter: 'stable' }}
        >
          {filteredHeadings.map((heading) => {
            const isActive = activeId === heading.id;
            const indentLevel = heading.depth - minDepth;

            return (
              <TocItem
                key={heading.id}
                heading={heading}
                isActive={isActive}
                indentLevel={indentLevel}
                minDepth={minDepth}
                onClick={(e) => handleClick(e, heading.id)}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
});

/** 目录项组件 */
function TocItem({
  heading,
  isActive,
  indentLevel,
  minDepth,
  onClick
}: {
  heading: TocHeading;
  isActive: boolean;
  indentLevel: number;
  minDepth: number;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      data-id={heading.id}
      href={`#${heading.id}`}
      onClick={onClick}
      className={`
        group relative flex items-center py-2 px-4 transition-all duration-300 ease-out rounded-lg mx-2
        ${isActive
          ? 'text-[var(--primary)]'
          : 'text-50 hover:text-75 hover:bg-[var(--btn-plain-bg-hover)]'}
      `}
      style={{
        paddingLeft: `${0.75 + indentLevel * 0.8}rem`,
        marginLeft: '0.5rem',
        backgroundColor: isActive ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : undefined
      }}
    >
      <span className={`
        text-sm leading-snug transition-all duration-300 w-full line-clamp-2
        ${isActive ? 'font-bold' : 'font-medium'}
        ${heading.depth > minDepth ? 'text-[0.825rem] opacity-90' : 'text-[0.9rem]'}
      `}>
        {heading.text}
      </span>
    </a>
  );
}