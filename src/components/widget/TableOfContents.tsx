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

  const minDepth = headings.length > 0 ? Math.min(...headings.map(h => h.depth)) : 1;

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setActiveId(id);
      window.history.pushState(null, '', `#${id}`);
    }
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = new Set<string>(visibleHeadings);
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        setVisibleHeadings(new Set(visible));
        if (visible.size > 0) {
          const visibleIds = Array.from(visible);
          const firstVisible = headings.find(h => visibleIds.includes(h.id))?.id || visibleIds[0];
          if (firstVisible) {
            setActiveId(firstVisible);
          }
        }
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: [0, 1] }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings, visibleHeadings]);

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        if (headings.length === 0) return;
        
        const scrollPosition = window.scrollY + 100;
        
        let currentId = headings[0]?.id;
        let minDistance = Infinity;

        headings.forEach(h => {
          const el = document.getElementById(h.id);
          if (el) {
            const distance = scrollPosition - el.offsetTop;
            if (distance >= 0 && distance < minDistance) {
              minDistance = distance;
              currentId = h.id;
            }
          }
        });

        if (visibleHeadings.size === 0 && currentId && currentId !== activeId) {
             setActiveId(currentId);
        }
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [headings, activeId, visibleHeadings.size]);

  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
  
  useEffect(() => {
    if (!activeId || !tocRef.current) return;
    
    requestAnimationFrame(() => {
        if (!tocRef.current) return;
        
        const activeElement = tocRef.current.querySelector(`[data-id="${activeId}"]`) as HTMLElement;
        const navElement = tocRef.current.querySelector('nav') as HTMLElement;
        
        if (activeElement && navElement) {
          const navRect = navElement.getBoundingClientRect();
          const activeRect = activeElement.getBoundingClientRect();
          
          setIndicatorStyle({
            top: activeRect.top - navRect.top,
            height: activeRect.height,
            opacity: 1
          });
          
          const container = tocRef.current.parentElement;
          if (container) {
            const { offsetTop, offsetHeight } = activeElement;
            const { scrollTop, clientHeight } = container;
            
            if (offsetTop < scrollTop || offsetTop + offsetHeight > scrollTop + clientHeight) {
              container.scrollTo({
                top: offsetTop - clientHeight / 2 + offsetHeight / 2,
                behavior: 'smooth'
              });
            }
          }
        } else {
           setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
        }
    });
  }, [activeId, headings]);

  if (headings.length === 0) return null;

  return (
    <div ref={tocRef} className={`toc-container select-none relative ${className}`}>
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-90 mb-5 px-4 opacity-80">
        <div className="w-1.5 h-4 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" style={{ '--tw-shadow-color': 'var(--primary)', '--tw-shadow': '0 0 8px var(--tw-shadow-color)' } as any}></div>
        TABLE OF CONTENTS
      </div>

      <nav className="relative flex flex-col pl-1 py-2">
        <div className="absolute left-[1.125rem] top-2 bottom-2 w-[2px] bg-[var(--border-light)] z-0 rounded-full"></div>

        <div 
          className="absolute left-[1.125rem] w-[2px] bg-[var(--primary)] z-10 transition-all duration-300 ease-out rounded-full shadow-[0_0_8px_var(--primary)]"
          style={{ 
            top: `${indicatorStyle.top}px`, 
            height: `${indicatorStyle.height}px`,
            opacity: indicatorStyle.opacity,
            transform: 'translateX(-50%)',
            '--tw-shadow-color': 'var(--primary)',
            '--tw-shadow': '0 0 8px var(--tw-shadow-color)'
          } as any}
        ></div>

        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const indentLevel = heading.depth - minDepth;

          return (
            <a
              key={heading.id}
              data-id={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
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
        })}
      </nav>
    </div>
  );
});
