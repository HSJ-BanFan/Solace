/**
 * 说说卡片组件 (Jasmine风格)
 *
 * 特点：
 * - 带偏移阴影的卡片设计
 * - 显示头像和用户名（从Owner配置获取）
 * - 显示相对时间
 * - 内容区域（summary显示content）
 * - 标签区域（可选）
 */

import { useOwner } from "@/hooks";
import type { PostCardArticle } from "@/types";
import { decodeHtmlEntities, formatRelativeTime } from "@/utils";

interface MomentCardProps {
	article: PostCardArticle;
	className?: string;
	style?: React.CSSProperties;
}

export function MomentCard({ article, className, style }: MomentCardProps) {
	const { data: owner } = useOwner();

	// 获取显示名
	const displayName = owner?.nickname || article.author?.nickname || "博主";

	// 获取头像字母
	const avatarLetter = displayName.charAt(0).toUpperCase();

	// 获取相对时间
	const relativeTime = formatRelativeTime(article.published_at || article.created_at);

	// 内容：对于说说，summary字段包含实际内容
	const content = decodeHtmlEntities(article.summary || "暂无内容");

	return (
		<article
			className={`moment-card w-full ${className || ""}`}
			style={style}
		>
			{/* 头部：头像 + 用户名 + 时间 */}
			<div className="moment-header">
				{owner?.avatar_url ? (
					<img
						src={owner.avatar_url}
						alt={displayName}
						className="moment-avatar"
					/>
				) : (
					<div className="moment-avatar">
						{avatarLetter}
					</div>
				)}
				<div className="moment-user-info">
					<div className="moment-username">{displayName}</div>
					<div className="moment-time">{relativeTime}</div>
				</div>
			</div>

			{/* 内容区域 */}
			<div className="moment-content">
				<p className="moment-text">{content}</p>
			</div>

			{/* 标签区域（可选） */}
			{article.tags && article.tags.length > 0 && (
				<div className="moment-tags">
					{article.tags.map((tag) => (
						<span key={tag.id} className="moment-tag">
							#{tag.name}
						</span>
					))}
				</div>
			)}
		</article>
	);
}