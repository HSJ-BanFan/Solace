/**
 * 瞬间页面 - 展示所有说说
 */

import { useSearchParams } from "react-router-dom";
import { useMoments } from "@/hooks";
import { MomentCard } from "@/components/post/MomentCard";
import {
	Pagination,
	EmptyState,
	InlineLoader,
	PageSEO,
} from "@/components";
import type { Moment } from "@/hooks/api/moments";

function MomentSkeleton() {
	return (
		<div className="card-base p-4 animate-pulse">
			<div className="flex items-center gap-3 mb-3">
				<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
				<div className="flex-1">
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
					<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
				</div>
			</div>
			<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
			<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
		</div>
	);
}

export function MomentsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get("page") || "1", 10);
	const pageSize = 10;

	const { data, isLoading, isFetching, error } = useMoments({
		page,
		pageSize,
	});

	const handlePageChange = (newPage: number) => {
		setSearchParams({ page: String(newPage) });
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (error)
		return (
			<EmptyState
				icon="material-symbols:error-outline-rounded"
				message="加载瞬间失败"
			/>
		);

	if (isLoading)
		return (
			<div className="flex flex-col gap-4">
				{[...Array(5)].map((_, i) => (
					<MomentSkeleton key={i} />
				))}
			</div>
		);

	if (!data?.data?.length)
		return (
			<EmptyState
				icon="material-symbols:chat-bubble-outline-rounded"
				message="暂无瞬间"
			/>
		);

	return (
		<>
			<PageSEO
				title="瞬间"
				description="记录生活中的点滴瞬间"
				path="/moments"
			/>
			{isFetching && !isLoading && <InlineLoader />}
			
			<div className="flex flex-col gap-4">
				{data.data.map((moment: Moment) => (
					<MomentCard
						key={moment.id}
						article={{
							id: moment.id,
							title: "",
							slug: `moment-${moment.id}`,
							summary: moment.content,
							author: moment.author,
							status: "published",
							created_at: moment.created_at,
							updated_at: moment.updated_at,
						}}
					/>
				))}
			</div>

			<Pagination
				page={page}
				pageSize={pageSize}
				total={data.total}
				onPageChange={handlePageChange}
			/>
		</>
	);
}
