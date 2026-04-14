/**
 * remark 插件：解析 :::gallery 容器语法
 *
 * 将 Markdown 中的：
 * :::gallery{rowHeight=250}
 * ![alt](src)
 * :::
 *
 * 转换为自定义 HTML 节点，供 ReactMarkdown 渲染
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Paragraph, Image } from 'mdast';

/** 图片数据 */
interface PhotoData {
  src: string;
  alt?: string;
}

/**
 * 解析 gallery 容器指令
 */
export const remarkGallery: Plugin<[], Root> = function () {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'gallery') return;

      // 提取参数
      const attributes = node.attributes || {};
      const rowHeight = attributes.rowHeight
        ? parseInt(attributes.rowHeight, 10)
        : undefined;

      // 提取图片
      const photos: PhotoData[] = [];

      // 遍历容器内的段落，查找图片
      if (node.children) {
        for (const child of node.children) {
          // 段落中的图片
          if (child.type === 'paragraph') {
            const paragraph = child as Paragraph;
            for (const pChild of paragraph.children) {
              if (pChild.type === 'image') {
                const img = pChild as Image;
                photos.push({
                  src: img.url || '',
                  alt: img.alt || undefined,
                });
              }
            }
          }
        }
      }

      // 将 gallery 数据序列化为 JSON 字符串，通过 data 属性传递
      node.data = {
        hName: 'gallery',
        hProperties: {
          'data-photos': JSON.stringify(photos),
          ...(rowHeight ? { 'data-row-height': String(rowHeight) } : {}),
        },
      };

      // 清空子节点（图片已经提取到 data 中）
      node.children = [];
    });
  };
};
