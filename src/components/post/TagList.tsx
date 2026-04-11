import { Link } from 'react-router-dom';
import type { Tag } from '@/types';

interface TagListProps {
  tags?: Tag[];
  /** 最多显示的标签数量 */
  maxTags?: number;
}

export function TagList({ tags, maxTags }: TagListProps) {
  const displayTags = maxTags ? tags?.slice(0, maxTags) : tags;

  if (!displayTags || displayTags.length === 0) {
    return <span className="text-xs text-30">暂无标签</span>;
  }

  return (
    <>
      {displayTags.map((tag) => (
        <Link
          key={tag.id}
          to={`/tags/${tag.slug}`}
          className="btn-regular h-6 text-xs px-2 rounded-lg hover:text-[var(--primary)] whitespace-nowrap"
        >
          # {tag.name}
        </Link>
      ))}
    </>
  );
}
