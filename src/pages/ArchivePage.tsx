import { Link } from 'react-router-dom';
import { useArchive } from '@/hooks/useApi';

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
}

function formatTag(tags: { id: number; name: string }[] | undefined) {
  if (!tags || tags.length === 0) return '';
  return tags.map((t) => `#${t.name}`).join(' ');
}

export function ArchivePage() {
  const { data: groups, isLoading, error } = useArchive();

  if (error) {
    return (
      <div className="card-base p-8 text-center fade-in-up">
        <p className="text-75">加载归档失败</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card-base p-8 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)] border-t-transparent mx-auto mb-4 animate-spin" />
        <p className="text-50">正在加载...</p>
      </div>
    );
  }

  const totalArticles = groups?.reduce((sum, g) => sum + g.count, 0) ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-base p-6 fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--klein-blue)] to-[var(--sky-blue)] flex items-center justify-center">
            <span className="text-xl text-white font-bold">归档</span>
          </div>
          <div>
            <h1 className="text-90 text-xl font-bold">归档</h1>
            <p className="text-50 text-sm">{totalArticles} 篇文章</p>
          </div>
        </div>
      </div>

      {/* Timeline - 完全匹配 Fuwari ArchivePanel.svelte */}
      <div className="card-base px-8 py-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
        {groups && groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.year}>
              {/* Year Header */}
              <div className="flex flex-row w-full items-center h-[3.75rem]">
                <div className="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
                  {group.year}
                </div>
                <div className="w-[15%] md:w-[10%]">
                  <div
                    className="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                      -outline-offset-[2px] z-50 outline-3"
                  />
                </div>
                <div className="w-[70%] md:w-[80%] transition text-left text-50">
                  {group.count} {group.count === 1 ? '篇文章' : '篇文章'}
                </div>
              </div>

              {/* Posts */}
              {group.posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/articles/${post.slug}`}
                  aria-label={post.title}
                  className="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
                >
                  <div className="flex flex-row justify-start items-center h-full">
                    {/* date */}
                    <div className="w-[15%] md:w-[10%] transition text-sm text-right text-50">
                      {formatDate(post.published_at || post.created_at)}
                    </div>

                    {/* dot and line */}
                    <div className="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
                      <div
                        className="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                          bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                          outline outline-4 z-50
                          outline-[var(--card-bg)]
                          group-hover:outline-[var(--btn-plain-bg-hover)]
                          group-active:outline-[var(--btn-plain-bg-active)]"
                      />
                    </div>

                    {/* post title */}
                    <div
                      className="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                        group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                        text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
                    >
                      {post.title}
                    </div>

                    {/* tag list */}
                    <div
                      className="hidden md:block md:w-[15%] text-left text-sm transition
                        whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
                    >
                      {formatTag(post.tags)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-50">
            <p>暂无文章</p>
          </div>
        )}
      </div>
    </div>
  );
}