import { Link } from "react-router-dom";
import { SafeIcon, PageSEO } from "@/components";

export function NotFoundPage() {
	return (
		<div className="flex-1 min-w-0">
			<PageSEO title="页面未找到" path="/404" noIndex />
			<div className="card-base p-8 text-center fade-in-up">
				<div className="w-24 h-24 rounded-full bg-[var(--btn-regular-bg)] mx-auto mb-6 flex items-center justify-center">
					<SafeIcon
						icon="material-symbols:search-rounded"
						size="2.5rem"
						className="text-[var(--primary)]"
					/>
				</div>
				<h1 className="text-90 text-3xl font-bold mb-2">404</h1>
				<p className="text-50 mb-6">页面未找到，可能已被删除或地址错误</p>
				<Link
					to="/"
					className="btn-regular inline-flex items-center gap-2 px-6 py-3"
				>
					<SafeIcon icon="material-symbols:home-outline-rounded" size="1.25rem" />
					返回首页
				</Link>
			</div>
		</div>
	);
}