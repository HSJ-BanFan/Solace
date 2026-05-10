/**
 * 文章列表页面组件
 *
 * 提供统一的文章列表展示，减少首页、分类页、标签页的重复代码
 */

import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useArticles, useCategories, useTags } from "@/hooks";
import {
	PostCardList,
	PostCardSkeletonList,
	Pagination,
	EmptyState,
	InlineLoader,
	NotFoundDisplay,
	PageSEO,
} from "@/components";
import { CategoryBar } from "@/components/widget";
import { toPostCardArticle } from "@/utils/article";
import { usePagination } from "@/hooks/usePagination";

/** 文章列表类型 */
type ArticleListType = "home" | "category" | "tag";

interface ArticleListPageProps {
	type: ArticleListType;
	pageSize?: number;
}

/** 通用文章列表页面组件 */
export function ArticleListPage({ type, pageSize = 8 }: ArticleListPageProps) {
	const { slug } = useParams<{ slug: string }>();
	const { page, handlePageChange } = usePagination({ defaultPageSize: pageSize });

	const { data: categories } = useCategories();
	const { data: tags } = useTags();

	// 构建 API 参数
	const articlesParams = useMemo(() => {
		const params: { page: number; pageSize: number; status: string; category?: string; tag?: string } = {
			page,
			pageSize,
			status: "published",
		};
		if (type === "category" && slug) params.category = slug;
		if (type === "tag" && slug) params.tag = slug;
		return params;
	}, [page, pageSize, type, slug]);

	const { data, isLoading, isFetching, error } = useArticles(articlesParams);

	// 获取实体名称（分类或标签）
	const entityName = useMemo(() => {
		if (!slug || type === "home") return "";
		if (type === "category") {
			return categories?.find((c) => c.slug === slug)?.name || slug;
		}
		return tags?.find((t) => t.slug === slug)?.name || slug;
	}, [type, slug, categories, tags]);

	// SEO 配置
	const seoConfig = useMemo(() => {
		if (type === "home") {
			return { title: "", description: "探索最新的技术文章和编程心得", path: "/" };
		}
		const path = type === "category" ? `/categories/${slug}` : `/tags/${slug}`;
		const typeName = type === "category" ? "分类" : "标签";
		return {
			title: entityName,
			description: `${typeName} "${entityName}" 下的所有文章`,
			path,
		};
	}, [type, slug, entityName]);

	// 错误处理
	if (error) {
		return (
			<EmptyState
				icon="material-symbols:error-outline-rounded"
				message="加载文章失败"
			/>
		);
	}

	// 分类/标签不存在
	if ((type === "category" || type === "tag") && !slug) {
		return <NotFoundDisplay message={`${type === "category" ? "分类" : "标签"}不存在`} />;
	}

	// 首次加载
	if (isLoading) return <PostCardSkeletonList count={pageSize} />;

	// 空数据
	if (!data?.data?.length) {
		const emptyMessage =
			type === "home"
				? "暂无文章"
				: `该${type === "category" ? "分类" : "标签"}下暂无文章`;
		return <EmptyState message={emptyMessage} />;
	}

	return (
		<>
			<PageSEO title={seoConfig.title} description={seoConfig.description} path={seoConfig.path} />
			{isFetching && !isLoading && <InlineLoader />}
			<CategoryBar />
			<PostCardList articles={data.data.map(toPostCardArticle)} />
			{data.total > pageSize && (
				<Pagination
					page={page}
					pageSize={pageSize}
					total={data.total}
					onPageChange={handlePageChange}
				/>
			)}
		</>
	);
}

/** 首页组件 */
export function HomePage() {
	return <ArticleListPage type="home" />;
}

/** 分类页组件 */
export function CategoryPage() {
	return <ArticleListPage type="category" />;
}

/** 标签页组件 */
export function TagPage() {
	return <ArticleListPage type="tag" />;
}