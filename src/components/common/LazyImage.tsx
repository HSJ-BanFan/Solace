import { memo } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import type { Effect } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  placeholderSrc?: string;
  effect?: Effect;
  threshold?: number;
  onLoad?: () => void;
  onClick?: () => void;
}

/**
 * 懒加载图片组件
 *
 * 特性：
 * - 滚动到可视区域时才加载图片
 * - 支持模糊占位图效果（blur）
 * - 加载完成后自动淡入
 *
 * 使用示例：
 * <LazyImage src="..." alt="封面" effect="blur" />
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  placeholderSrc,
  effect = 'blur',
  threshold = 100,
  onLoad,
  onClick,
}: LazyImageProps) {
  // 如果没有提供占位图，使用 CSS 渐变作为占位
  const defaultPlaceholder = placeholderSrc || undefined;

  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      className={className}
      wrapperClassName={wrapperClassName}
      placeholderSrc={defaultPlaceholder}
      effect={effect}
      threshold={threshold}
      onLoad={onLoad}
      onClick={onClick}
    />
  );
});