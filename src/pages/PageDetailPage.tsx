/**
 * 页面详情页 - 根据 template 类型选择渲染模板
 */

import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { usePageBySlug } from "@/hooks";
import { parseFrontmatter } from "@/utils/frontmatter";
import {
	DefaultTemplate,
	AboutTemplate,
	ProjectsTemplate,
	FootprintsTemplate,
} from "@/components/page/templates";
import {
	ArticleDetailSkeleton,
	ErrorDisplay,
	NotFoundDisplay,
} from "@/components";
import type {
	AboutFrontmatter,
	ProjectsFrontmatter,
	FootprintsFrontmatter,
} from "@/types";

export function PageDetailPage() {
	const { slug } = useParams<{ slug: string }>();
	const { data: page, isLoading, error } = usePageBySlug(slug ?? "");

	// 切换页面时平滑滚动到顶部
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [slug]);

	if (error) return <ErrorDisplay message="加载页面失败" />;
	if (isLoading) return <ArticleDetailSkeleton />;
	if (!page) return <NotFoundDisplay message="未找到页面" />;

	// 解析 frontmatter
	const { frontmatter, markdown } = parseFrontmatter(page.content);

	// 根据模板类型选择渲染组件
	const renderTemplate = () => {
		switch (page.template) {
			case "about":
				return (
					<AboutTemplate
						frontmatter={frontmatter as AboutFrontmatter}
						markdown={markdown}
						page={page}
					/>
				);
			case "projects":
				return (
					<ProjectsTemplate
						frontmatter={frontmatter as ProjectsFrontmatter}
						markdown={markdown}
					/>
				);
			case "footprints":
				return (
					<FootprintsTemplate
						frontmatter={frontmatter as FootprintsFrontmatter}
						markdown={markdown}
					/>
				);
			default:
				return (
					<DefaultTemplate
						markdown={markdown}
						page={page}
					/>
				);
		}
	};

	return (
		<article className="flex-1 min-w-0 fade-in-up">
			{renderTemplate()}
		</article>
	);
}