import { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '@/hooks';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { data } = useArticles({ page: 1, pageSize: 100 });

  // Client-side search filter
  const searchResults = useMemo(() => {
    if (!query.trim() || !data?.items) return [];
    const lowerQuery = query.toLowerCase();
    return data.items.filter(
      (article: Article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery) ||
        (article.summary && article.summary.toLowerCase().includes(lowerQuery))
    );
  }, [query, data?.items]);

  const handleSelect = useCallback((slug: string) => {
    navigate(`/articles/${slug}`);
    onClose();
    setQuery('');
  }, [navigate, onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 fade-in-up">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--klein-blue)]/20 dark:bg-[var(--klein-blue)]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative float-panel w-full max-w-2xl mx-4 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-2 p-4 border-b border-[var(--border-light)]">
          <Icon icon="material-symbols:search-rounded" className="text-2xl text-[var(--primary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="input-base flex-1 border-none shadow-none focus:ring-0"
            autoFocus
          />
          <button
            onClick={onClose}
            className="btn-plain rounded-[var(--radius-medium)] h-10 w-10 scale-animation ripple"
          >
            <Icon icon="material-symbols:close-rounded" className="text-xl" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() && searchResults.length === 0 && (
            <div className="p-8 text-center text-50">
              <Icon icon="material-symbols:search-off-rounded" className="text-4xl mb-2" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.slice(0, 10).map((article: Article) => (
                <button
                  key={article.id}
                  onClick={() => handleSelect(article.slug)}
                  className="w-full text-left p-3 rounded-[var(--radius-medium)] hover:bg-[var(--btn-plain-bg-hover)] transition-colors group"
                >
                  <div className="text-90 font-bold group-hover:text-[var(--primary)] transition-colors mb-1">
                    {article.title}
                  </div>
                  <div className="text-50 text-sm line-clamp-1">
                    {article.summary || article.content.slice(0, 100)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query.trim() && (
            <div className="p-8 text-center text-50">
              <Icon icon="material-symbols:search-rounded" className="text-4xl mb-2 text-[var(--primary)]" />
              <p>Type to search articles</p>
              <p className="text-xs mt-1">Search by title, content, or summary</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}