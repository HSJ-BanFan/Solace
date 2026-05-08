/**
 * 认证布局组件
 *
 * 用于登录、注册等页面
 * 居中显示内容
 */

import { Outlet } from "react-router-dom";
import { Navbar, Footer } from "@/components/common";
import { useMediaQuery } from "@/hooks";

export function AuthLayout() {
	// 计算 min-height 以补偿 zoom: 0.95
	const isZoomed = useMediaQuery("(min-width: 1024px) and (max-width: 2560px)");
	const minHeight = isZoomed ? "105.26vh" : "100vh";

	return (
		<div className="flex flex-col" style={{ minHeight }}>
			<Navbar />

			<div className="flex-1 flex items-center justify-center px-4 py-8">
				<Outlet />
			</div>

			<Footer />
		</div>
	);
}
