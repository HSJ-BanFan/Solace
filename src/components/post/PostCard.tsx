import { Link } from 'react-router-dom';
import { LazyImage, SafeIcon } from '@/components/common/ui';
import { PostMeta } from './PostMeta';
import { TagList } from './TagList';
import type { PostCardArticle } from '@/types';

const COVER_WIDTH_CSS = '28%';
const MOBILE_COVER_WIDTH = '120px';
const MOBILE_COVER_HEIGHT = '90px';

interface PostCardProps {
  article: PostCardArticle;
  /** 是否为两列模式（无封面卡片配对时） */
  isHalfRow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PostCard({ article, isHalfRow = false, className, style }: PostCardProps) {
  const hasCover = Boolean(article.cover_image);
  const articleUrl = `/articles/${article.slug}`;
  const summary = article.summary || '暂无摘要';

  return (
    <article
      className={`card-base w-full rounded-[var(--radius-large)] overflow-hidden relative ${className || ''}`}
      style={{ ...style, '--coverWidth': COVER_WIDTH_CSS } as React.CSSProperties}
    >
      {/* 移动端布局 */}
      <Link
        to={articleUrl}
        className="md:hidden flex gap-3 p-4 active:scale-[0.98] transition-transform duration-150"
      >
        <div className="flex-1 min-w-0 flex flex-col">
          <h2 className="font-semibold text-[1.0625rem] text-150 leading-snug line-clamp-1 mb-1.5">
            {article.title}
          </h2>
          <p className="text-sm text-50 line-clamp-2 leading-relaxed flex-1">
            {summary}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <TagList tags={article.tags} maxTags={3} />
          </div>
        </div>
        {hasCover && (
          <div className="flex-shrink-0 self-end rounded-lg overflow-hidden" style={{ width: MOBILE_COVER_WIDTH, height: MOBILE_COVER_HEIGHT }}>
            <LazyImage src={article.cover_image!} alt={article.title} className="w-full h-full object-cover" wrapperClassName="w-full h-full" effect="blur" />
          </div>
        )}
      </Link>

      {/* 桌面端布局 */}
      <div className="hidden md:flex md:flex-col w-full relative">
        <div className={`pl-9 pr-4 pt-7 pb-6 relative ${hasCover ? 'w-[calc(100%-var(--coverWidth)-12px)]' : isHalfRow ? 'w-full' : 'w-[calc(100%-52px-12px)]'}`}>
          <Link
            to={articleUrl}
            className="transition-smooth group w-full block font-bold mb-3 text-[1.625rem] text-70 hover:text-[var(--primary)]
              before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
              before:absolute before:top-[35px] before:left-[18px]"
          >
            {article.title}
            <SafeIcon icon="material-symbols:chevron-right-rounded" size="2rem" className="text-[var(--primary)] transition-bounce inline absolute translate-y-0.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0" />
          </Link>
          <PostMeta article={article} />
          <div className="transition-smooth text-75 mb-3.5 line-clamp-1">{summary}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <TagList tags={article.tags} />
          </div>
        </div>

        {/* 右侧封面或箭头 */}
        {hasCover ? (
          <Link to={articleUrl} className="group w-[var(--coverWidth)] absolute top-3 bottom-3 right-3 rounded-xl overflow-hidden">
            <div className="absolute inset-0 group-hover:bg-black/30 transition-smooth" />
            <SafeIcon icon="material-symbols:chevron-right-rounded" size="3rem" className="absolute z-20 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 text-white transition-bounce inset-0 m-auto" />
            <LazyImage src={article.cover_image!} alt={article.title} className="w-full h-full object-cover transition-smooth group-hover:scale-105" wrapperClassName="w-full h-full" effect="blur" />
          </Link>
        ) : !isHalfRow && (
          <Link to={articleUrl} className="btn-regular w-[3.25rem] absolute right-3 top-3 bottom-3 rounded-xl hover:bg-[var(--btn-regular-bg-hover)] active:scale-95 transition-smooth">
            <SafeIcon icon="material-symbols:chevron-right-rounded" size="2.5rem" className="text-[var(--primary)] mx-auto" />
          </Link>
        )}
      </div>

      <div className="hidden md:block absolute inset-0 pointer-events-none card-hover-overlay rounded-[var(--radius-large)]" />
    </article>
  );
}
