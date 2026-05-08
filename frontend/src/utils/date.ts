/** 日期格式化工具 */

export function formatDate(dateStr?: string): string {
	if (!dateStr) return "";
	return new Date(dateStr).toISOString().split("T")[0] ?? "";
}

export function formatDateTime(dateStr?: string): string {
	return dateStr ? new Date(dateStr).toLocaleString() : "";
}

export function formatShortDate(dateStr?: string): string {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	return `${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export function formatTags(tags?: { id: number; name: string }[]): string {
	return tags?.length ? tags.map((t) => `#${t.name}`).join(" ") : "";
}

/** 获取文章显示日期（优先发布日期） */
export function getArticleDate(article: { published_at?: string; created_at: string }): string {
	return article.published_at ? formatDate(article.published_at) : formatDate(article.created_at);
}

/** 判断文章是否有更新（更新时间与创建时间不同） */
export function hasArticleUpdate(article: { updated_at?: string; created_at?: string; published_at?: string }): boolean {
	return Boolean(article.updated_at && article.updated_at !== article.created_at);
}

/** 获取文章的显示更新时间 */
export function getArticleUpdateTime(article: { updated_at?: string; published_at?: string; created_at: string }): string {
	if (hasArticleUpdate(article)) {
		return formatDate(article.updated_at);
	}
	return getArticleDate(article);
}

/** 格式化相对时间（例如：3分钟前、2小时前等） */
export function formatRelativeTime(dateStr?: string): string {
	if (!dateStr) return "";

	const now = new Date();
	const date = new Date(dateStr);
	const diff = now.getTime() - date.getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (years > 0) return `${years}年前`;
	if (months > 0) return `${months}个月前`;
	if (days > 0) return `${days}天前`;
	if (hours > 0) return `${hours}小时前`;
	if (minutes > 0) return `${minutes}分钟前`;
	if (seconds > 0) return `${seconds}秒前`;
	return "刚刚";
}
