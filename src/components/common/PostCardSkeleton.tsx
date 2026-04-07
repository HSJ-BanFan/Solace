/**
 * 文章卡片骨架屏
 *
 * 文章列表加载时的占位组件
 */

import { memo } from 'react';

interface PostCardSkeletonProps {
  hasCover?: boolean;
}

/** 单个卡片骨架 */
export const PostCardSkeleton = memo(function PostCardSkeleton({ hasCover = false }: PostCardSkeletonProps) {
  const coverWidth = '28%';

  return (
    <>
      <div
        className="card-base flex flex-col-reverse md:flex-col w-full rounded-[var(--radius-large)] overflow-hidden relative"
      >
        {/* 内容区域 */}
        <div className={`pl-6 md:pl-9 pr-6 md:pr-2 pt-6 md:pt-7 pb-6 relative ${
          hasCover
            ? 'w-full md:w-[calc(100%-var(--coverWidth)-12px)]'
            : 'w-full md:w-[calc(100%-52px-12px)]'
        }`}>
          {/* 标题 */}
          <div className="w-full mb-3">
            <div className="skeleton h-8 rounded-lg w-3/4"></div>
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center">
              <div className="skeleton w-8 h-8 rounded-[var(--radius-small)] mr-2"></div>
              <div className="skeleton h-4 rounded w-20"></div>
            </div>
            <div className="flex items-center">
              <div className="skeleton w-8 h-8 rounded-[var(--radius-small)] mr-2"></div>
              <div className="skeleton h-4 rounded w-20"></div>
            </div>
          </div>

          {/* 摘要 */}
          <div className="mb-3.5 pr-4">
            <div className="skeleton h-4 rounded w-full mb-2"></div>
            <div className="skeleton h-4 rounded w-5/6 hidden md:block"></div>
          </div>

          {/* 浏览量 */}
          <div className="flex gap-4">
            <div className="skeleton h-4 rounded w-16"></div>
          </div>
        </div>

        {/* 封面图片骨架 */}
        {hasCover && (
          <div
            className="skeleton max-h-[20vh] md:max-h-none mx-4 mt-4 -mb-2 md:mb-0 md:mx-0 md:mt-0
              md:w-[var(--coverWidth)] relative md:absolute md:top-3 md:bottom-3 md:right-3
              rounded-xl overflow-hidden"
          >
            <div className="w-full h-full min-h-[120px] md:min-h-0"></div>
          </div>
        )}

        {/* 进入按钮骨架（无封面时） */}
        {!hasCover && (
          <div
            className="skeleton !hidden md:!flex w-[3.25rem] absolute right-3 top-3 bottom-3 rounded-xl"
          >
          </div>
        )}
      </div>

      {/* 分隔线（移动端） */}
      <div className="border-t-[1px] border-dashed mx-6 border-[var(--border-medium)] md:hidden" />

      <style>{`:root { --coverWidth: ${coverWidth}; }`}</style>
    </>
  );
});

/** 骨架屏列表 */
export function PostCardSkeletonList({ count = 5, hasCover = false }: { count?: number; hasCover?: boolean }) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={`skeleton-wrapper-${index}`}
          className="content-appear"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <PostCardSkeleton hasCover={hasCover} />
        </div>
      ))}
    </>
  );
}