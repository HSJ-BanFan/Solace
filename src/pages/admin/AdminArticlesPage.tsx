import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles, useDeleteArticle } from '@/hooks';
import { Pagination } from '@/components';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/stores';
import { formatDate } from '@/utils';

export function AdminArticlesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const pageSize = 10;

  const { accessToken, isAuthenticated } = useAuthStore();
  const { data, isLoading, error } = useArticles({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const deleteMutation = useDeleteArticle();

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (!isAuthenticated || !accessToken) {
    return null;
  }

  if (error) {
    return (
      <div className="card-base p-8 text-center fade-in-up">
        <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto mb-4 flex items-center justify-center">
          <Icon icon="material-symbols:error-outline-rounded" className="text-3xl text-red-500" />
        </div>
        <p className="text-75">Failed to load articles</p>
      </div>
    );
  }

  const articles = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-base p-6 fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--klein-blue)] to-[var(--sky-blue)] flex items-center justify-center">
              <Icon icon="material-symbols:article-outline-rounded" className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-90 text-xl font-bold">Articles</h1>
              <p className="text-50 text-sm">{total} articles total</p>
            </div>
          </div>
          <Link
            to="/admin/articles/new"
            className="btn-regular rounded-[var(--radius-medium)] py-2 px-4 font-medium scale-animation ripple"
          >
            <Icon icon="material-symbols:add-rounded" className="mr-1" />
            New
          </Link>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mt-4">
          {(['all', 'published', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-[var(--radius-medium)] py-2 px-3 text-sm font-medium transition-all scale-animation ripple ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-[var(--klein-blue)] to-[var(--klein-blue-light)] text-white'
                  : 'btn-regular'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Article List */}
      {isLoading ? (
        <div className="card-base p-8 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)] border-t-transparent mx-auto mb-4 animate-spin" />
        </div>
      ) : (
        <div className="card-base fade-in-up" style={{ animationDelay: '0.1s' }}>
          {articles.length === 0 ? (
            <div className="p-8 text-center text-50">
              <Icon icon="material-symbols:article-outline-rounded" className="text-4xl mb-4" />
              <p>No articles found</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-light)]">
              {articles.map((article) => (
                <div key={article.id} className="p-4 flex items-center gap-4 hover:bg-[var(--btn-plain-bg-hover)] transition-colors">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/admin/articles/${article.id}/edit`}
                      className="text-90 font-bold hover:text-[var(--primary)] transition-colors block mb-1"
                    >
                      {article.title}
                    </Link>
                    <div className="flex items-center gap-2 text-50 text-xs">
                      <span>{formatDate(article.created_at)}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        article.status === 'published'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {article.status}
                      </span>
                      <span>•</span>
                      <span>{article.view_count} views</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/articles/${article.slug}`}
                      className="btn-plain rounded-[var(--radius-medium)] h-9 w-9 scale-animation ripple"
                      title="View"
                    >
                      <Icon icon="material-symbols:visibility-outline-rounded" className="text-lg" />
                    </Link>
                    <Link
                      to={`/admin/articles/${article.id}/edit`}
                      className="btn-plain rounded-[var(--radius-medium)] h-9 w-9 scale-animation ripple"
                      title="Edit"
                    >
                      <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deleteMutation.isPending}
                      className="btn-plain rounded-[var(--radius-medium)] h-9 w-9 text-red-500 hover:bg-red-500/10 scale-animation ripple"
                      title="Delete"
                    >
                      <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
}