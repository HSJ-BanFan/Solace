/**
 * 时间线组件
 *
 * 用于展示个人经历、里程碑等时间序列事件
 */

import { SafeIcon } from "@/components/common/ui";
import type { TimelineEvent } from "@/types";

interface TimelineProps {
	events: TimelineEvent[];
}

// 事件类型对应的图标
const typeIcons: Record<string, string> = {
	work: "material-symbols:work-outline-rounded",
	education: "material-symbols:school-outline-rounded",
	milestone: "material-symbols:flag-outline-rounded",
	award: "material-symbols:military-tech-outline-rounded",
};

export function Timeline({ events }: TimelineProps) {
	if (!events || events.length === 0) {
		return null;
	}

	return (
		<div className="relative">
			{/* 时间线轴线 */}
			<div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[var(--border-light)]" />

			<div className="space-y-4">
				{events.map((event) => (
					<div key={`${event.date}-${event.title}`} className="relative pl-8 group">
						{/* 时间点 */}
						<div
							className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center"
						>
							<SafeIcon
								icon={
									event.icon ||
									typeIcons[event.type] ||
									"material-symbols:calendar-outline-rounded"
								}
								size="0.875rem"
								className="text-white"
							/>
						</div>

						{/* 内容 */}
						<div className="card-base p-4 hover:shadow-md transition-shadow">
							{/* 日期 */}
							<div className="flex items-center gap-2 mb-1">
								<span className="text-50 text-sm font-medium">
									{event.date}
								</span>
							</div>

							{/* 标题 */}
							<h3 className="text-90 font-bold mb-1">{event.title}</h3>

							{/* 描述 */}
							{event.description && (
								<p className="text-50 text-sm">{event.description}</p>
							)}

							{/* 链接 */}
							{event.link && (
								<a
									href={event.link.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[var(--primary)] text-sm mt-2 inline-flex items-center gap-1 hover:underline"
								>
									<SafeIcon
										icon="material-symbols:link-outline-rounded"
										size="0.875rem"
									/>
									{event.link.label}
								</a>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}