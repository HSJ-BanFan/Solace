import { useState } from 'react';
import { useArticles } from '@/hooks';
import { PostCard, PostCardSkeletonList, Pagination } from '@/components';
import { Icon } from '@iconify/react';
import { toPostCardArticle } from '@/utils/article';

export function HomePage() {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading, isFetching, error } = useArticles({
    page,
    pageSize,
    status: 'published',
  });

  if (error) {
    return (
      <div className="card-base p-8 text-center">
        <Icon icon="material-symbols:error-outline-rounded" className="text-4xl text-red-500 mb-4" />
        <p className="text-75">加载文章失败</p>
      </div>
    );
  }

  const articles = data?.data ?? [];
  const total = data?.total ?? 0;

  // 加载中状态 - 使用与 PostCard 结构匹配的骨架屏
  if (isLoading) {
    return (
      <>
        <PostCardSkeletonList count={pageSize} />
      </>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="card-base p-8 text-center onload-animation">
        <Icon icon="material-symbols:article-outline-rounded" className="text-4xl text-50 mb-4" />
        <p className="text-75">暂无文章</p>
      </div>
    );
  }

  return (
    <>
      {/* 后台刷新时显示加载指示器，但不隐藏内容 */}
      {isFetching && !isLoading && (
        <div className="flex justify-center py-2 mb-2">
          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      {articles.map((article, index) => (
        <PostCard
          key={article.id}
          article={toPostCardArticle(article)}
          class="content-appear"
          style={{ animationDelay: `${index * 40}ms` }}
        />
      ))}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </>
  );
}
