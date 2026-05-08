/**
 * 管理页面通用组件
 *
 * 提供统一的管理页面布局和状态展示
 */

import { Link } from "react-router-dom";
import { ErrorDisplay, EmptyState, AdminListSkeleton } from "@/components";
import { LoadingButton } from "@/components/common/form";
import type { ReactNode } from "react";

/** 管理页面布局组件 */
interface AdminPageLayoutProps {
	title: string;
	children: ReactNode;
	newButtonHref?: string;
	newButtonLabel?: string;
	onNewClick?: () => void;
}

export function AdminPageLayout({
	title,
	children,
	newButtonHref,
	newButtonLabel = "新建",
	onNewClick,
}: AdminPageLayoutProps) {
	return (
		<div className="space-y-4">
			{/* 标题和新建按钮 */}
			<div className="flex justify-between items-center">
				<h1 className="text-90 text-lg font-bold">{title}</h1>
				<div className="flex justify-end">
					{newButtonHref ? (
						<Link to={newButtonHref} className="btn-regular btn-sm py-1.5 px-3">
							{newButtonLabel}
						</Link>
					) : onNewClick ? (
						<button onClick={onNewClick} className="btn-regular btn-sm py-1.5 px-3">
							{newButtonLabel}
						</button>
					) : null}
				</div>
			</div>
			{children}
		</div>
	);
}

/** 管理页面状态组件 - 返回 null 当不需要显示状态时 */
interface AdminPageStateProps {
	isLoading: boolean;
	error: Error | null;
	isEmpty: boolean;
	loadingSkeletonCount?: number;
	emptyIcon?: string;
	emptyMessage?: string;
	errorMessage?: string;
}

export function AdminPageState({
	isLoading,
	error,
	isEmpty,
	loadingSkeletonCount = 3,
	emptyIcon = "material-symbols:article-outline-rounded",
	emptyMessage = "暂无内容",
	errorMessage = "加载失败",
}: AdminPageStateProps): React.ReactNode {
	if (error) {
		return <ErrorDisplay message={errorMessage} />;
	}
	if (isLoading) {
		return <AdminListSkeleton count={loadingSkeletonCount} />;
	}
	if (isEmpty) {
		return <EmptyState icon={emptyIcon} message={emptyMessage} />;
	}
	return null;
}

/** 管理页面表单组件 */
interface AdminFormProps {
	children: ReactNode;
	onSubmit: (e: React.FormEvent) => void;
	error?: string;
	animationDelay?: string;
	onCancel?: () => void;
	submitLabel?: string;
	isSubmitting?: boolean;
}

export function AdminForm({
	children,
	onSubmit,
	error,
	animationDelay = "0.1s",
	onCancel,
	submitLabel = "保存",
	isSubmitting = false,
}: AdminFormProps) {
	return (
		<form
			onSubmit={onSubmit}
			className="card-base p-6 fade-in-up"
			style={{ animationDelay }}
		>
			{error && (
				<div className="bg-red-500/10 text-red-500 rounded-[var(--radius-medium)] p-3 mb-4 text-sm">
					{error}
				</div>
			)}
			{children}
			<div className="flex gap-2 mt-4">
				<LoadingButton
					type="submit"
					loading={isSubmitting}
					className="btn-regular btn-sm py-1.5 px-4"
				>
					{submitLabel}
				</LoadingButton>
				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						className="btn-plain btn-sm py-1.5 px-4"
					>
						取消
					</button>
				)}
			</div>
		</form>
	);
}