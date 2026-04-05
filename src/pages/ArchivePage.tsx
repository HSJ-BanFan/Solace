import { useState } from 'react';
import { useArticles } from '@/hooks';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils';

export function ArchivePage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error } = useArticles({
    page,
    pageSize,
    status: 'published',
  });

  if (error) {
    return (
      <div className="card-base p-8 text-center fade-in-up">
        <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto mb-4 flex items-center justify-center">
          <Icon icon="material-symbols:error-outline-rounded" className="text-3xl text-red-500" />
        </div>
        <p className="text-75">Failed to load archive</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card-base p-8 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)] border-t-transparent mx-auto mb-4 animate-spin" />
        <p className="text-50">Loading archive...</p>
      </div>
    );
  }

  const articles = data?.items ?? [];
  const total = data?.total ?? 0;

  // Group by year-month
  const groupedArticles = (articles ?? []).reduce<Record<string, NonNullable<typeof articles>>>((acc, article) => {
    const date = new Date(article.published_at ?? article.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    const arr = acc[key];
    if (arr) arr.push(article);
    return acc;
  }, {} as Record<string, NonNullable<typeof articles>>);

  const sortedKeys = Object.keys(groupedArticles).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-base p-6 fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--klein-blue)] to-[var(--sky-blue)] flex items-center justify-center">
            <Icon icon="material-symbols:archive-outline-rounded" className="text-xl text-white" />
          </div>
          <div>
            <h1 className="text-90 text-xl font-bold">Archive</h1>
            <p className="text-50 text-sm">{total} articles total</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card-base p-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
        {sortedKeys.map((key) => (
          <div key={key} className="mb-8 last:mb-0">
            {/* Month Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--klein-blue)] to-[var(--sky-blue)]" />
              <h2 className="text-90 font-bold text-lg">
                {key.replace('-', ' / ')}
              </h2>
              <span className="text-50 text-sm ml-auto">
                {groupedArticles[key]?.length ?? 0} articles
              </span>
            </div>

            {/* Articles */}
            <div className="space-y-1 pl-5 border-l-2 border-[var(--border-light)]">
              {(groupedArticles[key] ?? []).map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.slug}`}
                  className="flex items-center gap-4 py-2 px-3 rounded-[var(--radius-medium)] hover:bg-[var(--btn-plain-bg-hover)] transition-colors duration-[var(--duration-normal)] group"
                >
                  <span className="text-50 text-sm w-20 shrink-0">
                    {formatDate(article.published_at || article.created_at)}
                  </span>
                  <span className="text-75 text-sm flex-1 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                    {article.title}
                  </span>
                  <Icon
                    icon="material-symbols:chevron-right-rounded"
                    className="text-lg text-30 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all"
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="text-center py-8 text-50">
            <Icon icon="material-symbols:archive-outline-rounded" className="text-4xl mb-4" />
            <p>No articles archived yet</p>
          </div>
        )}

        {/* Load More */}
        {articles.length < total && (
          <button
            onClick={() => setPage(page + 1)}
            className="btn-regular rounded-[var(--radius-medium)] w-full py-3 mt-4 scale-animation ripple"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}