import { useState } from 'react';
import { useArticles } from '@/hooks';
import { PostCard, Pagination } from '@/components';
import { Icon } from '@iconify/react';

export function HomePage() {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading, error } = useArticles({
    page,
    pageSize,
    status: 'published',
  });

  if (error) {
    return (
      <div className="card-base p-8 text-center">
        <Icon icon="material-symbols:error-outline-rounded" className="text-4xl text-red-500 mb-4" />
        <p className="text-75">Failed to load articles</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card-base p-8 text-center">
        <Icon icon="material-symbols:refresh-rounded" className="animate-spin text-4xl text-50 mb-4" />
        <p className="text-50">Loading articles...</p>
      </div>
    );
  }

  const articles = data?.items ?? [];
  const total = data?.total ?? 0;

  if (articles.length === 0) {
    return (
      <div className="card-base p-8 text-center onload-animation">
        <Icon icon="material-symbols:article-outline-rounded" className="text-4xl text-50 mb-4" />
        <p className="text-75">No articles yet</p>
      </div>
    );
  }

  return (
    <>
      {articles.map((article, index) => (
        <PostCard
          key={article.id}
          article={article}
          class="onload-animation"
          style={{ animationDelay: `calc(var(--content-delay) + ${index * 50}ms)` }}
        />
      ))}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </>
  );
}