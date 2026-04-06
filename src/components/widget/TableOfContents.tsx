import { useEffect, useRef, useState, useCallback, memo } from 'react';

export interface TocHeading {
  id: string;
  text: string;
  depth: number;
}

interface TableOfContentsProps {
  headings: TocHeading[];
  className?: string;
}

export const TableOfContents = memo(function TableOfContents({ headings, className = '' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [visibleHeadings, setVisibleHeadings] = useState<Set<string>>(new Set());
  const tocRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 找到最小深度用于缩进计算
  const minDepth = headings.length > 0 ? Math.min(...headings.map(h => h.depth)) : 1;

  // 点击处理
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      // 更新 URL hash
      window.history.pushState(null, '', `#${id}`);
    }
  }, []);

  // 设置 IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = new Set<string>();
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          }
        });

        // 如果没有可见的，找到最接近顶部的
        if (visible.size === 0) {
          const scrollPosition = window.scrollY + 100;
          let closestId: string | null = null;
          let closestDistance = Infinity;

          headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) {
              const distance = Math.abs(element.offsetTop - scrollPosition);
              if (distance < closestDistance) {
                closestId = heading.id;
                closestDistance = distance;
              }
            }
          });

          if (closestId) {
            visible.add(closestId);
          }
        }

        setVisibleHeadings(visible);
        if (visible.size > 0) {
          // 取最上面的一个作为当前活动
          const firstVisible = Array.from(visible)[0];
          if (firstVisible) {
            setActiveId(firstVisible);
          }
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    // 观察所有标题
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  // 从 URL hash 初始化活动状态
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveId(decodeURIComponent(hash));
    }
  }, []);

  // 滚动 TOC 使活动项可见
  useEffect(() => {
    if (!activeId || !tocRef.current) return;

    const activeElement = tocRef.current.querySelector(`[href="#${activeId}"]`);
    if (activeElement) {
      const container = tocRef.current;
      const elementRect = activeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeId]);

  if (headings.length === 0) {
    return null;
  }

  // 计算一级标题计数
  let h1Count = 0;

  return (
    <div
      ref={tocRef}
      className={`toc-container ${className}`}
    >
      <div className="text-sm font-medium text-50 mb-3 px-2">目录</div>
      <nav className="space-y-1">
        {headings.map((heading) => {
          const isActive = visibleHeadings.has(heading.id);
          const indentLevel = heading.depth - minDepth;

          // 为一级标题计数
          const showNumber = heading.depth === minDepth;
          if (showNumber) h1Count++;

          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`toc-item group flex items-center gap-2 px-2 py-2 rounded-lg transition-smooth
                hover:bg-[var(--toc-btn-hover)] active:bg-[var(--toc-btn-active)]
                ${isActive ? 'bg-[var(--toc-btn-hover)] text-[var(--primary)]' : 'text-50'}`}
              style={{
                paddingLeft: `${0.5 + indentLevel * 1}rem`,
              }}
            >
              {/* 前缀图标/数字 */}
              <span
                className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold
                  ${heading.depth === minDepth
                    ? 'bg-[var(--toc-badge-bg)] text-[var(--btn-content)]'
                    : heading.depth === minDepth + 1
                      ? 'bg-[var(--toc-badge-bg)]/50'
                      : 'bg-black/5 dark:bg-white/10'
                  }`}
              >
                {heading.depth === minDepth && h1Count}
                {heading.depth === minDepth + 1 && (
                  <span className="w-1.5 h-1.5 rounded-sm bg-[var(--toc-badge-bg)]" />
                )}
                {heading.depth >= minDepth + 2 && (
                  <span className="w-1 h-1 rounded-sm bg-black/20 dark:bg-white/20" />
                )}
              </span>

              {/* 标题文本 */}
              <span
                className={`text-sm truncate transition-smooth
                  ${heading.depth >= minDepth + 2 ? 'text-30' : 'text-50'}
                  ${isActive ? 'text-[var(--primary)] font-medium' : ''}
                  group-hover:text-[var(--primary)]`}
              >
                {heading.text}
              </span>
            </a>
          );
        })}
      </nav>
    </div>
  );
});