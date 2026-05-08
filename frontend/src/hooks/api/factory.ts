/**
 * API Hooks 工厂函数
 *
 * 提供通用的 CRUD hooks 生成器，减少重复代码
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { extractData, extractPagedData } from "./utils";

/** 列表查询 Hook 配置 */
interface ListQueryConfig<T> {
	queryKey: () => readonly unknown[];
	fetcher: () => Promise<{ success?: boolean; data?: T[]; error?: { message?: string } }>;
	staleTime?: number;
}

/** 分页列表查询 Hook 配置 */
interface PagedListQueryConfig<T> {
	queryKey: (params: { page?: number; pageSize?: number }) => readonly unknown[];
	fetcher: (page: number, pageSize: number) => Promise<{
		success?: boolean;
		data?: T[];
		page?: number;
		pageSize?: number;
		total?: number;
		totalPages?: number;
		error?: { message?: string };
	}>;
	staleTime?: number;
}

/** 详情查询 Hook 配置 */
interface DetailQueryConfig<T, K extends string | number> {
	queryKey: (key: K) => readonly unknown[];
	fetcher: (key: K) => Promise<{ success?: boolean; data?: T; error?: { message?: string } }>;
	enabled?: (key: K) => boolean;
	staleTime?: number;
}

/** 创建变更 Hook 配置 */
interface CreateMutationConfig<T, D> {
	queryKey: () => readonly unknown[];
	fetcher: (data: D) => Promise<{ success?: boolean; data?: T; error?: { message?: string } }>;
	invalidateKeys?: (() => readonly unknown[])[];
}

/** 更新变更 Hook 配置 */
interface UpdateMutationConfig<T, K, D> {
	queryKey: (invalidateKey: K) => readonly unknown[];
	fetcher: (key: K, data: D) => Promise<{ success?: boolean; data?: T; error?: { message?: string } }>;
	invalidateKeys?: ((key: K) => readonly unknown[])[];
}

/** 删除变更 Hook 配置 */
interface DeleteMutationConfig<K> {
	queryKey: () => readonly unknown[];
	fetcher: (key: K) => Promise<void>;
	invalidateKeys?: (() => readonly unknown[])[];
}

/** 创建列表查询 Hook */
export function createListQuery<T>(config: ListQueryConfig<T>) {
	return () =>
		useQuery({
			queryKey: config.queryKey(),
			queryFn: async () => {
				const response = await config.fetcher();
				return extractData<T[]>(response);
			},
			staleTime: config.staleTime ?? 10 * 60 * 1000,
		});
}

/** 创建分页列表查询 Hook */
export function createPagedListQuery<T>(config: PagedListQueryConfig<T>) {
	return (params: { page?: number; pageSize?: number } = {}) =>
		useQuery({
			queryKey: config.queryKey(params),
			queryFn: async () => {
				const response = await config.fetcher(params.page ?? 1, params.pageSize ?? 10);
				return extractPagedData<T>(response);
			},
			staleTime: config.staleTime ?? 2 * 60 * 1000,
		});
}

/** 创建详情查询 Hook */
export function createDetailQuery<T, K extends string | number>(
	config: DetailQueryConfig<T, K>,
) {
	return (key: K) =>
		useQuery({
			queryKey: config.queryKey(key),
			queryFn: async () => {
				const response = await config.fetcher(key);
				return extractData<T>(response);
			},
			enabled: config.enabled ? config.enabled(key) : true,
			staleTime: config.staleTime ?? 5 * 60 * 1000,
		});
}

/** 创建创建变更 Hook */
export function createCreateMutation<T, D>(config: CreateMutationConfig<T, D>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: D) => {
			const response = await config.fetcher(data);
			return extractData<T>(response);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: config.queryKey() });
			for (const keyFn of config.invalidateKeys ?? []) {
				queryClient.invalidateQueries({ queryKey: keyFn() });
			}
		},
	});
}

/** 创建更新变更 Hook */
export function createUpdateMutation<T, K, D>(config: UpdateMutationConfig<T, K, D>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ key, data }: { key: K; data: D }) => {
			const response = await config.fetcher(key, data);
			return extractData<T>(response);
		},
		onSuccess: (_, { key }) => {
			queryClient.invalidateQueries({ queryKey: config.queryKey(key) });
			for (const keyFn of config.invalidateKeys ?? []) {
				queryClient.invalidateQueries({ queryKey: keyFn(key) });
			}
		},
	});
}

/** 创建删除变更 Hook */
export function createDeleteMutation<K>(config: DeleteMutationConfig<K>) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (key: K) => {
			await config.fetcher(key);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: config.queryKey() });
			for (const keyFn of config.invalidateKeys ?? []) {
				queryClient.invalidateQueries({ queryKey: keyFn() });
			}
		},
	});
}