/**
 * 图片画廊组件
 *
 * 使用 react-photo-album 实现自适应 Rows 布局
 * 集成 yet-another-react-lightbox 实现点击预览
 */

import { memo, useState, useCallback } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import 'react-photo-album/rows.css';
import 'yet-another-react-lightbox/styles.css';

/** 图片数据结构 */
export interface GalleryPhoto {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryProps {
  photos: GalleryPhoto[];
  targetRowHeight?: number;
  className?: string;
}

/** 默认行高度 */
const DEFAULT_ROW_HEIGHT = 200;

/** 图片间距 */
const SPACING = 8;

export const ImageGallery = memo(function ImageGallery({
  photos,
  targetRowHeight = DEFAULT_ROW_HEIGHT,
  className = '',
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // 打开 lightbox
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  // 关闭 lightbox
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // 如果没有图片，不渲染
  if (!photos.length) return null;

  // 转换为 react-photo-album 需要的格式
  const albumPhotos = photos.map((photo) => ({
    src: photo.src,
    alt: photo.alt || '',
    // 如果没有尺寸信息，使用默认值（react-photo-album 会自动处理）
    width: photo.width || 800,
    height: photo.height || 600,
  }));

  // 转换为 lightbox 需要的格式
  const lightboxSlides = photos.map((photo) => ({
    src: photo.src,
    alt: photo.alt || '',
  }));

  return (
    <div className={`my-4 ${className}`}>
      <RowsPhotoAlbum
        photos={albumPhotos}
        targetRowHeight={targetRowHeight}
        spacing={SPACING}
        onClick={({ index }: { index: number }) => openLightbox(index)}
      />

      <Lightbox
        open={lightboxOpen}
        close={closeLightbox}
        index={lightboxIndex}
        slides={lightboxSlides}
        carousel={{ finite: false }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
        }}
        render={{
          slide: ({ slide }) => (
            <img
              src={slide.src}
              alt={slide.alt}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ),
        }}
      />
    </div>
  );
});
