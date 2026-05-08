/**
 * 管理后台布局组件
 *
 * 结构：
 * ┌─────────────────────────────────┐
 * │           Navbar                │
 * ├─────────┬───────────────────────┤
 * │ 侧边栏  │      主内容区         │
 * │ (导航)  │     (Outlet)          │
 * └─────────┴───────────────────────┘
 */

import { Outlet, useLocation, Link } from "react-router-dom";
import { Navbar, Footer } from "@/components/common";
import { SafeIcon } from "@/components/common/ui";
import { useAuthStore } from "@/stores";
import { useMediaQuery } from "@/hooks";

/** 侧边栏导航项 */
const navItems = [
	{
		name: "文章管理",
		path: "/admin",
		icon: "material-symbols:article-outline-rounded",
	},
	{
		name: "页面管理",
		path: "/admin/pages",
		icon: "material-symbols:dashboard-outline-rounded",
	},
	{
		name: "瞬间管理",
		path: "/admin/moments",
		icon: "material-symbols:chat-bubble-outline-rounded",
	},
	{
		name: "分类管理",
		path: "/admin/categories",
		icon: "material-symbols:category-outline-rounded",
	},
	{
		name: "标签管理",
		path: "/admin/tags",
		icon: "material-symbols:label-outline-rounded",
	},
];

export function AdminLayout() {
	const { user } = useAuthStore();
	const location = useLocation();

	// 计算 min-height 以补偿 zoom: 0.95
	const isZoomed = useMediaQuery("(min-width: 1024px) and (max-width: 2560px)");
	const minHeight = isZoomed ? "105.26vh" : "100vh";

	/** 判断导航项是否激活 */
	const isActive = (path: string) => {
		if (path === "/admin") {
			return (
				location.pathname === "/admin" ||
				location.pathname.startsWith("/admin/articles")
			);
		}
		if (path === "/admin/pages") {
			return location.pathname.startsWith("/admin/pages");
		}
		if (path === "/admin/moments") {
			return location.pathname.startsWith("/admin/moments");
		}
		if (path === "/admin/categories") {
			return location.pathname.startsWith("/admin/categories");
		}
		if (path === "/admin/tags") {
			return location.pathname.startsWith("/admin/tags");
		}
		return location.pathname === path;
	};

	return (
		<div className="flex flex-col" style={{ minHeight }}>
			{/* 顶部导航栏 */}
			<Navbar />

			<div className="flex-1 max-w-[var(--page-width)] mx-auto w-full px-4 py-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* 侧边栏 */}
					<aside className="w-full md:w-48 shrink-0">
						{/* 用户信息 */}
						<div className="card-base p-4 mb-4">
							<div className="text-90 text-sm font-medium mb-2">管理后台</div>
							{user && (
								<div className="text-50 text-xs">
									{user.nickname || user.username}
								</div>
							)}
						</div>

						{/* 导航菜单 */}
						<div className="card-base p-2">
							<nav className="flex flex-col gap-1">
								{navItems.map((item) => (
									<Link
										key={item.path}
										to={item.path}
										className={`rounded-lg py-2 px-3 text-sm transition flex items-center gap-2 ${
											isActive(item.path)
												? "bg-[var(--btn-regular-bg)] text-[var(--primary)] font-medium"
												: "text-75 hover:bg-[var(--btn-plain-bg-hover)]"
										}`}
									>
										<SafeIcon
											icon={item.icon}
											size="1.125rem"
											className="flex-shrink-0"
										/>
										<span className="whitespace-nowrap">{item.name}</span>
									</Link>
								))}
							</nav>
						</div>
					</aside>

					{/* 主内容区 */}
					<main className="flex-1 min-w-0">
						<Outlet />
					</main>
				</div>
			</div>

			{/* 底部页脚 */}
			<Footer />
		</div>
	);
}
