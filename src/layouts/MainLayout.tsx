/**
 * 主布局组件
 *
 * 结构：
 * ┌─────────────────────────────────────┐
 * │            Navbar                   │
 * ├─────────┬───────────────┬───────────┤
 * │ SideBar │   MainContent │   TOC     │
 * │ or TOC  │   (Outlet)    │ (optional)│
 * └─────────┴───────────────┴───────────┤
 * │              Footer                 │
 * └─────────────────────────────────────┘
 *
 * 文章详情页：左侧显示 TOC（若有），无 TOC 则显示 SideBar
 * 其他页面：左侧显示 SideBar
 */

import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Footer } from '@/components/common';
import { SideBar, TableOfContents } from '@/components/widget';
import { useTocStore } from '@/stores';
import { useMemo } from 'react';

export function MainLayout() {
  const { headings } = useTocStore();
  const location = useLocation();

  // 判断是否为文章详情页
  const isArticlePage = useMemo(() => {
    return /^\/articles\//.test(location.pathname);
  }, [location.pathname]);

  // 文章详情页优先显示 TOC，无 TOC 时显示 SideBar
  const showTocInSidebar = isArticlePage && headings.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <Navbar />

      {/* 主内容区域 */}
      <div className="flex-1 max-w-[var(--page-width)] mx-auto w-full px-3 md:px-4 py-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[17.5rem_1fr] gap-4">
          {/* 左侧边栏 - 仅桌面端显示 */}
          <aside className="hidden lg:block">
            {showTocInSidebar ? (
              <div className="sticky top-4">
                <TableOfContents headings={headings} />
              </div>
            ) : (
              <SideBar />
            )}
          </aside>

          {/* 主内容区 */}
          <main className="min-w-0 flex flex-col gap-4">
            <Outlet />
          </main>
        </div>

        {/* 右侧目录 - 仅超宽屏且非文章页显示（文章页已在左侧显示） */}
        {!isArticlePage && headings.length > 0 && (
          <div className="hidden 2xl:block absolute top-0 -right-[var(--toc-width)] w-[var(--toc-width)] h-full">
            <div className="sticky top-20">
              <TableOfContents headings={headings} />
            </div>
          </div>
        )}
      </div>

      {/* 底部页脚 */}
      <Footer />
    </div>
  );
}