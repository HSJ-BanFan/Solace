import { useParams } from 'react-router-dom';
import { useArticleBySlug } from '@/hooks';
import { PostMeta, MarkdownRenderer } from '@/components';
import { type TocHeading } from '@/components/widget/TableOfContents';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils';
import { useEffect, useCallback } from 'react';
import { useTocStore } from '@/stores';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useArticleBySlug(slug ?? '');
  const { setHeadings, clearHeadings } = useTocStore();

  useEffect(() => {
    return () => {
      clearHeadings();
    };
  }, [clearHeadings]);

  const handleHeadingsExtracted = useCallback((extractedHeadings: TocHeading[]) => {
    setHeadings(extractedHeadings);
  }, [setHeadings]);

  if (error) {
    return (
      <div className="card-base p-8 text-center fade-in-up">
        <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto mb-4 flex items-center justify-center">
          <Icon icon="material-symbols:error-outline-rounded" className="text-3xl text-red-500" />
        </div>
        <p className="text-75">加载文章失败</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <article className="space-y-4">
        {/* Cover Image Skeleton */}
        <div className="card-base overflow-hidden">
          <div className="skeleton w-full h-[280px] md:h-[360px]" />
        </div>

        {/* Content Skeleton */}
        <div className="card-base p-6 md:p-8 content-appear" style={{ animationDelay: '50ms' }}>
          <div className="skeleton h-9 rounded w-3/4 mb-4" />

          {/* Meta Info Skeleton */}
          <div className="flex gap-4 mb-4">
            <div className="skeleton h-5 rounded w-24" />
            <div className="skeleton h-5 rounded w-24" />
            <div className="skeleton h-5 rounded w-24" />
          </div>

          {/* Summary Skeleton */}
          <div className="border-l-2 border-[var(--primary)] pl-4 mb-6">
            <div className="space-y-2">
              <div className="skeleton h-4 rounded w-full" />
              <div className="skeleton h-4 rounded w-5/6" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="mt-6 space-y-3">
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-11/12" />
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-4/5" />
          </div>

          {/* Footer Skeleton */}
          <div className="border-t border-[var(--border-light)] mt-8 pt-4 flex justify-between">
            <div className="skeleton h-4 rounded w-24" />
            <div className="skeleton h-4 rounded w-24" />
          </div>
        </div>
      </article>
    );
  }

  if (!article) {
    return (
      <div className="card-base p-8 text-center fade-in-up">
        <div className="w-16 h-16 rounded-full bg-[var(--btn-regular-bg)] mx-auto mb-4 flex items-center justify-center">
          <Icon icon="material-symbols:search-rounded" className="text-3xl text-[var(--primary)]" />
        </div>
        <p className="text-75">未找到文章</p>
      </div>
    );
  }

  return (
    <article className="flex-1 min-w-0 space-y-4">
      {/* 封面图片 */}
      {article.cover_image && (
        <div className="card-base overflow-hidden fade-in-up">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-[280px] md:h-[360px] object-cover"
          />
        </div>
      )}

      {/* 文章内容 */}
      <div className="card-base p-6 md:p-8 fade-in-up" style={{ animationDelay: '50ms' }}>
        {/* 标题 */}
        <h1 className="text-90 text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>

        {/* 元信息 */}
        <PostMeta article={article} />

        {/* 摘要 */}
        {article.summary && (
          <div className="text-50 border-l-2 border-[var(--primary)] pl-4 mb-6 bg-[var(--btn-regular-bg)] rounded-r-[var(--radius-medium)] py-2 italic">
            {article.summary}
          </div>
        )}

        {/* 正文内容 - Markdown 渲染 */}
        <MarkdownRenderer
          content={article.content}
          className="mt-6"
          onHeadingsExtracted={handleHeadingsExtracted}
        />

        {/* 底部信息 */}
        <div className="border-t border-[var(--border-light)] mt-8 pt-4">
          <div className="flex items-center justify-between text-50 text-sm">
            <div className="flex items-center gap-2">
              <Icon icon="material-symbols:calendar-today-outline-rounded" className="text-base" />
              {formatDate(article.published_at || article.created_at)}
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="material-symbols:visibility-outline-rounded" className="text-base" />
              {article.view_count} 次浏览
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}