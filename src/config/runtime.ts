/**
 * 运行时配置模块
 *
 * 支持两种配置来源：
 * 1. 运行时配置：window.__RUNTIME_CONFIG__（Docker 部署时注入）
 * 2. 构建时配置：import.meta.env（开发/构建时注入）
 *
 * 运行时配置优先级更高，便于 Docker 部署时动态配置
 */

// 运行时配置类型
interface RuntimeConfig {
	API_BASE: string;
	SITE_BASE_URL?: string; // 站点完整 URL，用于 SEO
	SITE_NAME?: string; // 站点名称
	SITE_DESCRIPTION?: string; // 站点描述
}

// 扩展 Window 类型
declare global {
	interface Window {
		__RUNTIME_CONFIG__?: RuntimeConfig;
	}
}

/**
 * 获取 API Base URL
 * 优先使用运行时配置，否则使用构建时配置
 */
export function getApiBase(): string {
	// 运行时配置（Docker 注入）
	if (window.__RUNTIME_CONFIG__?.API_BASE) {
		return window.__RUNTIME_CONFIG__?.API_BASE;
	}

	// 构建时配置（Vite 注入）
	return import.meta.env.VITE_API_BASE || "/api/v1";
}

/**
 * 获取站点完整 URL（用于 SEO canonical、OG 等）
 */
export function getSiteBaseUrl(): string {
	if (window.__RUNTIME_CONFIG__?.SITE_BASE_URL) {
		return window.__RUNTIME_CONFIG__?.SITE_BASE_URL;
	}
	return import.meta.env.VITE_SITE_BASE_URL || "";
}

/**
 * 获取站点名称
 */
export function getSiteName(): string {
	if (window.__RUNTIME_CONFIG__?.SITE_NAME) {
		return window.__RUNTIME_CONFIG__?.SITE_NAME;
	}
	return import.meta.env.VITE_SITE_NAME || "Blog";
}

/**
 * 获取站点描述
 */
export function getSiteDescription(): string {
	if (window.__RUNTIME_CONFIG__?.SITE_DESCRIPTION) {
		return window.__RUNTIME_CONFIG__?.SITE_DESCRIPTION;
	}
	return import.meta.env.VITE_SITE_DESCRIPTION || "";
}
