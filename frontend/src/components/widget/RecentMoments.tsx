/**
 * 最近瞬间组件 - 侧边栏显示最近5条瞬间
 */

import { memo } from "react";
import { Link } from "react-router-dom";
import { useRecentMoments } from "@/hooks";
import { sidebarTitleStyle } from "@/utils";
import { formatRelativeTime } from "@/utils";
import type { Moment } from "@/hooks/api/moments";

interface RecentMomentsProps {
	className?: string;
	style?: React.CSSProperties;
}

export const RecentMoments = memo(function RecentMoments({
	className,
	style,
}: RecentMomentsProps) {
	const { data: momentsData, isLoading, error } = useRecentMoments(5);

	if (isLoading) {
		return (
			<div className={`card-base pb-3 ${className || ""}`} style={style}>
				<Link to="/moments" className="group">
					<div className={`${sidebarTitleStyle} group-hover:text-[var(--primary)] transition`}>
						瞬间
					</div>
				</Link>
				<div className="px-2.5 lg:px-3 space-y-2.5">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="animate-pulse space-y-1.5">
							<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
							<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error || !momentsData?.data?.length) return null;

	const moments = momentsData.data;

	return (
		<div
			className={`card-base pb-3 onload-animation ${className || ""}`}
			style={style}
		>
			<Link to="/moments" className="group">
				<div className={`${sidebarTitleStyle} group-hover:text-[var(--primary)] transition`}>
					瞬间
				</div>
			</Link>
			<nav className="px-2.5 lg:px-3" aria-label="最近瞬间">
				{moments.map((moment: Moment, index: number) => (
					<div key={moment.id}>
						<Link
							to="/moments"
							onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
							className="block group py-2 px-2 -mx-2 rounded-md border-2 border-transparent hover:border-[var(--showa-border-color)] hover:shadow-[2px_2px_0_var(--showa-shadow-color)] hover:bg-[var(--card-bg)] transition-all duration-200"
						>
							<p className="text-xs lg:text-sm text-75 line-clamp-2 leading-relaxed group-hover:text-[var(--primary)] transition mb-1">
								{moment.content}
							</p>
							<p className="text-[10px] lg:text-xs text-30 text-right">
								{formatRelativeTime(moment.created_at)}
							</p>
						</Link>
						{index < moments.length - 1 && (
							<div className="border-b border-dashed border-[var(--showa-border-color)] opacity-50 my-1" />
						)}
					</div>
				))}
			</nav>
		</div>
	);
});
