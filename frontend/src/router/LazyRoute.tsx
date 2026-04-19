/**
 * 懒加载路由包装组件
 * 统一处理 Suspense 和 fallback
 */
import { Suspense, ComponentType } from "react";

interface LazyRouteProps {
	/** 懒加载的组件 */
	Component: React.LazyExoticComponent<ComponentType>;
	/** 加载中显示的 fallback */
	fallback?: React.ReactNode;
}

/** 默认骨架屏 fallback */
const DefaultFallback = (
	<div className="flex items-center justify-center min-h-screen">加载中...</div>
);

export function LazyRoute({ Component, fallback = DefaultFallback }: LazyRouteProps) {
	return (
		<Suspense fallback={fallback}>
			<Component />
		</Suspense>
	);
}