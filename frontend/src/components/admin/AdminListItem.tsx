/**
 * 管理页面列表项组件
 *
 * 提供统一的列表项展示，减少管理页面的重复代码
 */

import { Link } from "react-router-dom";
import { ActionButton } from "@/components/admin";

interface AdminListItemProps {
	title: string;
	subtitle?: string;
	badges?: Array<{ label: string; variant?: "success" | "warning" | "info" | "default" }>;
	editHref?: string;
	editOnClick?: () => void;
	onDelete?: () => void;
	deleteDisabled?: boolean;
	viewHref?: string;
}

const badgeVariants = {
	success: "bg-green-500/10 text-green-600 dark:text-green-400",
	warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	info: "bg-[var(--primary)]/10 text-[var(--primary)]",
	default: "bg-[var(--btn-regular-bg)]",
};

/** 管理列表项组件 */
export function AdminListItem({
	title,
	subtitle,
	badges,
	editHref,
	editOnClick,
	onDelete,
	deleteDisabled,
	viewHref,
}: AdminListItemProps) {
	return (
		<div className="p-4 flex items-center gap-4 hover:bg-[var(--btn-plain-bg-hover)] transition-colors">
			<div className="flex-1 min-w-0">
				{editHref ? (
					<Link
						to={editHref}
						className="text-90 font-bold hover:text-[var(--primary)] transition-colors block mb-1"
					>
						{title}
					</Link>
				) : (
					<div className="text-90 font-bold mb-1">{title}</div>
				)}
				{subtitle && (
					<div className="text-50 text-sm mt-1">{subtitle}</div>
				)}
				{badges && badges.length > 0 && (
					<div className="flex items-center gap-2 text-50 text-xs flex-wrap mt-1">
						{badges.map((badge, index) => (
							<span
								key={index}
								className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
									badgeVariants[badge.variant || "default"]
								}`}
							>
								{badge.label}
							</span>
						))}
					</div>
				)}
			</div>
			<div className="flex items-center gap-1 shrink-0">
				{viewHref && (
					<ActionButton
						icon="material-symbols:visibility-outline-rounded"
						title="查看"
						href={viewHref}
					/>
				)}
				{editHref && !editOnClick && (
					<ActionButton
						icon="material-symbols:edit-outline-rounded"
						title="编辑"
						href={editHref}
					/>
				)}
				{editOnClick && (
					<ActionButton
						icon="material-symbols:edit-outline-rounded"
						title="编辑"
						onClick={editOnClick}
					/>
				)}
				{onDelete && (
					<ActionButton
						icon="material-symbols:delete-outline-rounded"
						title="删除"
						onClick={onDelete}
						disabled={deleteDisabled}
						danger
					/>
				)}
			</div>
		</div>
	);
}

/** 管理列表容器组件 */
export function AdminListContainer({
	children,
	className = "",
	animationDelay = "0.15s",
}: {
	children: React.ReactNode;
	className?: string;
	animationDelay?: string;
}) {
	return (
		<div
			className={`card-base fade-in-up ${className}`}
			style={{ animationDelay }}
		>
			<div className="divide-y divide-[var(--border-light)]">{children}</div>
		</div>
	);
}