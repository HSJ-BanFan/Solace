import { useState } from "react";
import { useMoments, useDeleteMoment } from "@/hooks";
import {
	Pagination,
	AdminListSkeleton,
	ErrorDisplay,
	EmptyState,
	ActionButton,
	PageSEO,
} from "@/components";
import { useAuthStore } from "@/stores";
import { formatDateTime } from "@/utils";

export function AdminMomentsPage() {
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const { accessToken, isAuthenticated } = useAuthStore();
	const { data, isLoading, error } = useMoments({ page, pageSize });
	const deleteMutation = useDeleteMoment();

	const handleDelete = async (id: number) => {
		if (!confirm("确定要删除这条说说吗？")) return;
		try {
			await deleteMutation.mutateAsync(id);
		} catch (err) {
			alert(err instanceof Error ? err.message : "删除失败");
		}
	};

	if (!isAuthenticated || !accessToken) return null;

	if (error) {
		return <ErrorDisplay message="加载说说列表失败" />;
	}

	const moments = data?.data ?? [];
	const total = data?.total ?? 0;

	return (
		<div className="space-y-4">
			<PageSEO title="说说管理" path="/admin/moments" noIndex />
			
			<div className="card-base p-4 fade-in-up flex items-center justify-between">
				<h2 className="text-90 font-bold">说说列表</h2>
				<span className="text-50 text-sm">共 {total} 条</span>
			</div>

			{isLoading ? (
				<AdminListSkeleton count={pageSize} />
			) : moments.length === 0 ? (
				<EmptyState
					icon="material-symbols:chat-bubble-outline-rounded"
					message="暂无说说"
				/>
			) : (
				<div
					className="card-base fade-in-up"
					style={{ animationDelay: "0.1s" }}
				>
					<div className="divide-y divide-[var(--border-light)]">
						{moments.map((moment) => (
							<div
								key={moment.id}
								className="p-4 hover:bg-[var(--btn-plain-bg-hover)] transition-colors"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0">
										<p className="text-75 text-sm leading-relaxed line-clamp-3 mb-2">
											{moment.content}
										</p>
										<div className="flex items-center gap-2 text-50 text-xs">
											<span>{formatDateTime(moment.created_at)}</span>
											{moment.author && (
												<>
													<span>•</span>
													<span>{moment.author.nickname || moment.author.username}</span>
												</>
											)}
										</div>
									</div>
									<div className="flex items-center gap-1 shrink-0">
										<ActionButton
											icon="material-symbols:delete-outline-rounded"
											title="删除"
											onClick={() => handleDelete(moment.id)}
											disabled={deleteMutation.isPending}
											danger
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<Pagination
				page={page}
				pageSize={pageSize}
				total={total}
				onPageChange={setPage}
			/>
		</div>
	);
}
