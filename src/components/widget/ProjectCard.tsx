/**
 * 项目卡片组件
 *
 * 用于展示单个项目信息
 */

import { SafeIcon, LazyImage } from "@/components/common/ui";
import type { Project } from "@/types";

interface ProjectCardProps {
	project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
	return (
		<div className="card-base p-4 hover:shadow-md transition-shadow group">
			{/* 封面图 */}
			{project.cover && (
				<LazyImage
					src={project.cover}
					alt={project.name}
					className="w-full aspect-video object-cover rounded-lg mb-3"
					wrapperClassName="w-full aspect-video rounded-lg overflow-hidden mb-3"
					effect="blur"
				/>
			)}

			{/* 名称 */}
			<h3
				className="text-90 font-bold mb-2 group-hover:text-[var(--primary)] transition-colors"
			>
				{project.name}
			</h3>

			{/* 简介 */}
			<p className="text-50 text-sm mb-3 line-clamp-2">
				{project.description}
			</p>

			{/* 技术栈 */}
			<div className="flex flex-wrap gap-1.5 mb-3">
{project.tech.map((t) => (
						<span
							key={t}
							className="btn-regular h-6 text-xs px-2 rounded-md"
						>
							{t}
						</span>
					))}
			</div>

			{/* 链接 */}
			<div className="flex gap-2">
				{project.github && (
					<a
						href={project.github}
						target="_blank"
						rel="noopener noreferrer"
						className="btn-regular h-8 px-3 text-sm flex items-center gap-1.5 active:scale-95"
					>
						<SafeIcon icon="fa6-brands:github" size="1rem" />
						源码
					</a>
				)}
				{project.demo && (
					<a
						href={project.demo}
						target="_blank"
						rel="noopener noreferrer"
						className="btn-regular h-8 px-3 text-sm flex items-center gap-1.5 active:scale-95"
					>
						<SafeIcon icon="material-symbols:open-in-new-outline-rounded" size="1rem" />
						演示
					</a>
				)}
			</div>

			{/* 状态标签 */}
			{project.status === "archived" && (
				<div className="mt-2 text-50 text-xs">
					已归档
				</div>
			)}
		</div>
	);
}