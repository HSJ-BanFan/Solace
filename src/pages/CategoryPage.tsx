import { useParams, useSearchParams } from "react-router-dom";
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
import { useMemo } from "react";

export function CategoryPage() {
	return <ArticleListPage type="category" />;
}

export function TagPage() {
	return <ArticleListPage type="tag" />;
}

function ArticleListPage({ type }: { type: "category" | "tag" }) {
	const { slug } = useParams<{ slug: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get("page") || "1", 10);
	const pageSize = 8;

	const { data: categories } = useCategories();
	const { data: tags } = useTags();

	const { data, isLoading, isFetching } = useArticles({
		page,
		pageSize,
		[type]: slug,
	});

	const entityName = useMemo(() => {
		if (!slug) return "";
		if (type === "category") {
			return categories?.find((c) => c.slug === slug)?.name || slug;
		}
		return tags?.find((t) => t.slug === slug)?.name || slug;
	}, [type, slug, categories, tags]);

	const path = type === "category" ? `/categories/${slug}` : `/tags/${slug}`;

	const handlePageChange = (newPage: number) => {
		setSearchParams({ page: String(newPage) });
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (!slug) {
		return (
			<NotFoundDisplay
				message={
					`${type === "category" ? "分类" : "标签"}不存在` as
						| "分类不存在"
						| "标签不存在"
				}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-3 md:gap-4">
			<PageSEO
				title={entityName}
				description={`${type === "category" ? "分类" : "标签"} "${entityName}" 下的所有文章`}
				path={path}
			/>
			<CategoryBar />
			{isLoading ? (
				<PostCardSkeletonList count={pageSize} />
			) : data?.data?.length ? (
				<>
					{isFetching && !isLoading && <InlineLoader />}
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
			) : (
				<EmptyState
					message={`该${type === "category" ? "分类" : "标签"}下暂无文章`}
				/>
			)}
		</div>
	);
}
