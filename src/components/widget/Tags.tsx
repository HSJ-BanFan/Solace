interface TagItem {
  name: string;
  url: string;
}

interface TagsProps {
  tags?: TagItem[];
  className?: string;
  style?: React.CSSProperties;
}

// 默认标签数据
const defaultTags: TagItem[] = [
  { name: 'React', url: '/tags/react' },
  { name: 'TypeScript', url: '/tags/typescript' },
  { name: 'Go', url: '/tags/go' },
  { name: 'Rust', url: '/tags/rust' },
  { name: 'Web', url: '/tags/web' },
];

export function Tags({ tags = defaultTags, className, style }: TagsProps) {
  return (
    <div className={`card-base pb-4 onload-animation ${className || ''}`} style={style}>
      <div className="font-bold text-lg text-90 relative ml-8 mt-4 mb-2
        before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
        before:absolute before:-left-4 before:top-[5.5px]">
        Tags
      </div>
      <div className="px-4 flex gap-2 flex-wrap">
        {tags.map((tag, index) => (
          <a
            key={index}
            href={tag.url}
            className="btn-regular h-8 text-sm px-3 rounded-lg hover:bg-[var(--primary)] hover:text-white transition"
          >
            {tag.name}
          </a>
        ))}
      </div>
    </div>
  );
}