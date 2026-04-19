import { useParams } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { usePageBySlug } from "@/hooks";
import { parseFrontmatter } from "@/utils/frontmatter";
import {
	ArticleDetailSkeleton,
	ErrorDisplay,
	NotFoundDisplay,
	PageSEO,
} from "@/components";
import type {
	AboutFrontmatter,
	ProjectsFrontmatter,
	FootprintsFrontmatter,
} from "@/types";
import { ApiError } from "@/api/generated/core/ApiError";

function isNotFoundError(error: unknown): boolean {
	return error instanceof ApiError && error.status === 404;
}

const DefaultTemplate = lazy(() =>
	import("@/components/page/templates/DefaultTemplate").then((m) => ({
		default: m.DefaultTemplate,
	})),
);
const AboutTemplate = lazy(() =>
	import("@/components/page/templates/AboutTemplate").then((m) => ({
		default: m.AboutTemplate,
	})),
);
const ProjectsTemplate = lazy(() =>
	import("@/components/page/templates/ProjectsTemplate").then((m) => ({
		default: m.ProjectsTemplate,
	})),
);
const FootprintsTemplate = lazy(() =>
	import("@/components/page/templates/FootprintsTemplate").then((m) => ({
		default: m.FootprintsTemplate,
	})),
);

function TemplateLoadingFallback() {
	return <ArticleDetailSkeleton />;
}

export function PageDetailPage() {
	const { slug } = useParams<{ slug: string }>();
	const { data: page, isLoading, error } = usePageBySlug(slug ?? "");

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [slug]);

	if (error) {
		if (isNotFoundError(error)) {
			return <NotFoundDisplay message="未找到页面" />;
		}
		return <ErrorDisplay message="加载页面失败" />;
	}
	if (isLoading) return <ArticleDetailSkeleton />;
	if (!page) return <NotFoundDisplay message="未找到页面" />;

	const { frontmatter, markdown } = parseFrontmatter(page.content);

	const renderTemplate = () => {
		switch (page.template) {
			case "about":
				return (
					<Suspense fallback={<TemplateLoadingFallback />}>
						<AboutTemplate
							frontmatter={frontmatter as AboutFrontmatter}
							markdown={markdown}
						/>
					</Suspense>
				);
			case "projects":
				return (
					<Suspense fallback={<TemplateLoadingFallback />}>
						<ProjectsTemplate
							frontmatter={frontmatter as ProjectsFrontmatter}
							markdown={markdown}
						/>
					</Suspense>
				);
			case "footprints":
				return (
					<Suspense fallback={<TemplateLoadingFallback />}>
						<FootprintsTemplate
							frontmatter={frontmatter as FootprintsFrontmatter}
							markdown={markdown}
						/>
					</Suspense>
				);
			default:
				return (
					<Suspense fallback={<TemplateLoadingFallback />}>
						<DefaultTemplate markdown={markdown} page={page} />
					</Suspense>
				);
		}
	};

	return (
		<article className="flex-1 min-w-0 fade-in-up">
			<PageSEO
				title={page.title}
				description={page.summary || `${page.title} - 更多精彩内容`}
				path={`/pages/${slug}`}
			/>
			{renderTemplate()}
		</article>
	);
}