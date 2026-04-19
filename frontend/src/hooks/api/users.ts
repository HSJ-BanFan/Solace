import { useAuthStore } from "@/stores";
import type { User } from "@/types";

/**
 * 获取当前用户信息
 * 注意：用户信息在登录时已存储在 auth store 中，无需额外 API 调用
 */
export function useCurrentUser() {
	const { user, isAuthenticated, accessToken } = useAuthStore();

	return {
		data: user as User | null,
		isLoading: false,
		isError: false,
		isEnabled: isAuthenticated && !!accessToken,
	};
}
