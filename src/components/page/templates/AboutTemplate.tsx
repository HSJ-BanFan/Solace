/**
 * 关于我模板 - 头像 + 时间线 + Markdown
 *
 * 用于 template 类型为 "about" 的页面
 */

import { MarkdownRenderer, LazyImage, SafeIcon } from "@/components";
import { Timeline } from "@/components/widget/Timeline";
import { useOwner } from "@/hooks";
import type { Page, AboutFrontmatter } from "@/types";

interface AboutTemplateProps {
	frontmatter: AboutFrontmatter;
	markdown: string;
	page: Page;
}

export function AboutTemplate({
	frontmatter,
	markdown,
	page,
}: AboutTemplateProps) {
	const { data: owner } = useOwner();

	return (
		<div className="space-y-6 fade-in-up">
			{/* 个人信息头部 */}
			<div className="card-base p-6 md:p-8 text-center">
				{/* 头像 */}
				{owner?.avatar_url && (
					<LazyImage
						src={owner.avatar_url}
						alt="头像"
						className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
						wrapperClassName="w-24 h-24 mx-auto mb-4"
						effect="blur"
					/>
				)}

				{/* 名称 */}
				<h1 className="text-90 text-2xl font-bold mb-2">
					{owner?.nickname || page.title}
				</h1>

				{/* 简介 */}
				<p className="text-50 mb-4">{owner?.bio}</p>

				{/* 社交链接 */}
				<div className="flex gap-3 justify-center">
					{owner?.github_url && (
						<a
							href={owner.github_url}
							target="_blank"
							rel="noopener noreferrer"
							className="btn-regular h-9 px-4 flex items-center gap-1.5 active:scale-95"
						>
							<SafeIcon icon="fa6-brands:github" size="1.125rem" />
							GitHub
						</a>
					)}
				</div>
			</div>

			{/* 时间线 */}
			{frontmatter.timeline && frontmatter.timeline.length > 0 && (
				<div className="card-base p-6 md:p-8">
					<h2 className="text-90 text-xl font-bold mb-6 flex items-center gap-2">
						<SafeIcon icon="material-symbols:timeline-outline-rounded" />
						我的历程
					</h2>
					<Timeline events={frontmatter.timeline} />
				</div>
			)}

			{/* Markdown 正文 */}
			{markdown && (
				<div className="card-base p-6 md:p-8">
					<MarkdownRenderer content={markdown} />
				</div>
			)}
		</div>
	);
}