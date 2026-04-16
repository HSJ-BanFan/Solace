/**
 * 页面相关 API Hooks
 *
 * 提供页面的查询、创建、更新、删除等操作
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { extractData, extractPagedData } from "./utils";
import { getApiBase } from "@/config/runtime";
import type { Page, PageListItem, NavPage } from "@/types";

// API 基础 URL
const API_BASE = getApiBase();

/** 从 zustand persist storage 中获取 token */
function getAuthToken(): string | null {
	const stored = localStorage.getItem("auth-storage");
	if (!stored) return null;
	try {
		const parsed = JSON.parse(stored);
		return parsed?.state?.accessToken || null;
	} catch {
		return null;
	}
}

/** 获取页面列表（管理用） */
export function usePages(params?: {
	page?: number;
	pageSize?: number;
	status?: string;
	template?: string;
}) {
	return useQuery({
		queryKey: ["pages", params],
		queryFn: async () => {
			const token = getAuthToken();
			const query = new URLSearchParams();
			query.set("page", String(params?.page ?? 1));
			query.set("pageSize", String(params?.pageSize ?? 10));
			if (params?.status) query.set("status", params.status);
			if (params?.template) query.set("template", params.template);

			const response = await fetch(
				`${API_BASE}/pages?${query.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			return extractPagedData<PageListItem>(data);
		},
	});
}

/** 获取单个页面（按 ID） - 管理用 */
export function usePage(id: number) {
	return useQuery({
		queryKey: ["page", id],
		queryFn: async () => {
			const token = getAuthToken();
			const response = await fetch(`${API_BASE}/pages/${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();
			return extractData<Page>(data);
		},
		enabled: id > 0,
	});
}

/** 获取单个页面（按 slug） - 公开访问 */
export function usePageBySlug(slug: string) {
	return useQuery({
		queryKey: ["page", slug],
		queryFn: async () => {
			const response = await fetch(`${API_BASE}/pages/slug/${slug}`);
			const data = await response.json();
			return extractData<Page>(data);
		},
		enabled: slug.length > 0,
	});
}

/** 获取导航页面列表 */
export function useNavPages() {
	return useQuery({
		queryKey: ["nav-pages"],
		queryFn: async () => {
			const response = await fetch(`${API_BASE}/pages/nav`);
			const data = await response.json();
			return extractData<NavPage[]>(data);
		},
		staleTime: 10 * 60 * 1000, // 10 分钟内不重新请求
	});
}

/** 创建页面 */
export function useCreatePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			title: string;
			slug?: string;
			template?: string;
			content?: string;
			summary?: string;
			cover_image?: string;
			status?: string;
			order?: number;
			show_in_nav?: boolean;
		}) => {
			const token = getAuthToken();
			const response = await fetch(`${API_BASE}/pages`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});
			const json = await response.json();
			return extractData<Page>(json);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pages"] });
			queryClient.invalidateQueries({ queryKey: ["nav-pages"] });
		},
	});
}

/** 更新页面 */
export function useUpdatePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: {
				title?: string;
				slug?: string;
				template?: string;
				content?: string;
				summary?: string;
				cover_image?: string;
				status?: string;
				order?: number;
				show_in_nav?: boolean;
				version: number;
			};
		}) => {
			const token = getAuthToken();
			const response = await fetch(`${API_BASE}/pages/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});
			const json = await response.json();
			return extractData<Page>(json);
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["pages"] });
			queryClient.invalidateQueries({ queryKey: ["page", id] });
			queryClient.invalidateQueries({ queryKey: ["nav-pages"] });
		},
	});
}

/** 删除页面 */
export function useDeletePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const token = getAuthToken();
			await fetch(`${API_BASE}/pages/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pages"] });
			queryClient.invalidateQueries({ queryKey: ["nav-pages"] });
		},
	});
}