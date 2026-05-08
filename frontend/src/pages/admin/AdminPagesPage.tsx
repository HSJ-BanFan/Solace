/**
 * 管理页面列表
 * 使用通用管理页面组件
 */

import { useState } from "react";
import { usePages, useDeletePage } from "@/hooks";
import { Pagination } from "@/components";
import {
	AdminPageLayout,
	AdminPageState,
	AdminListContainer,
	AdminListItem,
	FilterButtons,
} from "@/components/admin";
import { useAuthStore } from "@/stores";
import { formatDate } from "@/utils";
import { useDeleteHandler } from "@/hooks/useAdminForm";

// 模板类型标签
const templateLabels: Record<string, string> = {
	all: "全部",
	default: "默认",
	about: "关于我",
	projects: "项目",
	footprints: "足迹",
};

const statusOptions = ["all", "published", "draft"] as const;
const statusLabels: Record<string, string> = {
	all: "全部",
	published: "已发布",
	draft: "草稿",
};

const templateOptions = ["all", "default", "about", "projects", "footprints"] as const;

export function AdminPagesPage() {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
	const [templateFilter, setTemplateFilter] = useState<"all" | "default" | "about" | "projects" | "footprints">("all");
	const pageSize = 10;

	const { accessToken, isAuthenticated } = useAuthStore();
	const { data, isLoading, error } = usePages({
		page,
		pageSize,
		status: statusFilter === "all" ? undefined : statusFilter,
		template: templateFilter === "all" ? undefined : templateFilter,
	});

	const deleteMutation = useDeletePage();
	const handleDelete = useDeleteHandler(deleteMutation, "页面");

	if (!isAuthenticated || !accessToken) return null;

	const pages = data?.data ?? [];
	const total = data?.total ?? 0;

	const stateComponent = AdminPageState({
		isLoading,
		error,
		isEmpty: pages.length === 0,
		emptyIcon: "material-symbols:article-outline-rounded",
		emptyMessage: "未找到页面",
		errorMessage: "加载页面列表失败",
	});

	return (
		<AdminPageLayout
			title="页面管理"
			newButtonHref="/admin/pages/new"
			newButtonLabel="新建页面"
		>
			{/* 状态筛选和模板筛选 */}
			<div className="card-base p-4 fade-in-up flex items-center justify-between flex-wrap gap-4">
				<div className="flex gap-4 flex-wrap">
					<FilterButtons
						options={statusOptions}
						labels={statusLabels}
						current={statusFilter}
						onChange={setStatusFilter}
					/>
					<FilterButtons
						options={templateOptions}
						labels={templateLabels}
						current={templateFilter}
						onChange={setTemplateFilter}
					/>
				</div>
			</div>

			{stateComponent ?? (
				<>
					<AdminListContainer animationDelay="0.1s">
						{pages.map((pg) => (
							<AdminListItem
								key={pg.id}
								title={pg.title}
								editHref={`/admin/pages/${pg.id}/edit`}
								viewHref={`/pages/${pg.slug}`}
								onDelete={() => handleDelete(pg.id)}
								deleteDisabled={deleteMutation.isPending}
								badges={[
									{ label: `/${pg.slug}`, variant: "default" },
									{ label: formatDate(pg.created_at), variant: "default" },
									{
										label: pg.status === "published" ? "已发布" : "草稿",
										variant: pg.status === "published" ? "success" : "warning",
									},
									{
										label: templateLabels[pg.template] || pg.template,
										variant: "info",
									},
									...(pg.show_in_nav ? [{ label: "导航显示", variant: "info" as const }] : []),
								]}
							/>
						))}
					</AdminListContainer>

					<Pagination
						page={page}
						pageSize={pageSize}
						total={total}
						onPageChange={setPage}
					/>
				</>
			)}
		</AdminPageLayout>
	);
}
