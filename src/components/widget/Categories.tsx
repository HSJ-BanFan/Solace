interface CategoryItem {
  name: string;
  count: number;
  url: string;
}

interface CategoriesProps {
  categories?: CategoryItem[];
  className?: string;
  style?: React.CSSProperties;
}

// 默认分类数据
const defaultCategories: CategoryItem[] = [
  { name: 'Technology', count: 5, url: '/categories/technology' },
  { name: 'Life', count: 3, url: '/categories/life' },
];

export function Categories({ categories = defaultCategories, className, style }: CategoriesProps) {
  return (
    <div className={`card-base pb-4 onload-animation ${className || ''}`} style={style}>
      <div className="font-bold text-lg text-90 relative ml-8 mt-4 mb-2
        before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
        before:absolute before:-left-4 before:top-[5.5px]">
        Categories
      </div>
      <div className="px-4 space-y-1">
        {categories.map((category, index) => (
          <a
            key={index}
            href={category.url}
            className="w-full h-10 rounded-lg bg-none hover:bg-[var(--btn-plain-bg-hover)]
              active:bg-[var(--btn-plain-bg-active)] transition-all pl-2 hover:pl-3
              text-75 hover:text-[var(--primary)] flex items-center justify-between group"
          >
            <span className="overflow-hidden text-left whitespace-nowrap overflow-ellipsis">
              {category.name}
            </span>
            <span className="px-2 h-7 ml-4 min-w-[2rem] rounded-lg text-sm font-bold
              text-[var(--btn-content)] bg-[var(--btn-regular-bg)]
              flex items-center justify-center transition
              group-hover:bg-[var(--primary)] group-hover:text-white">
              {category.count}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}