/**
 * 瞬间(说说)相关 API Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api";
import { queryKeys } from "@/lib/queryKeys";
import { extractData, extractPagedData } from "./utils";
import type { request_CreateMomentRequest } from "@/api";

export interface Moment {
	id: number;
	content: string;
	author_id: number;
	author?: {
		id: number;
		username: string;
		nickname?: string;
	};
	created_at: string;
	updated_at: string;
}

export function useMoments(params: { page?: number; pageSize?: number }) {
	return useQuery({
		queryKey: queryKeys.moments.list(params),
		queryFn: async () => {
			const response = await apiClient.moment.getMoments(
				params.page ?? 1,
				params.pageSize ?? 10,
			);
			return extractPagedData<Moment>(response);
		},
		staleTime: 2 * 60 * 1000,
	});
}

export function useMoment(id: number) {
	return useQuery({
		queryKey: queryKeys.moments.detail(id),
		queryFn: async () => {
			const response = await apiClient.moment.getMoments1(id);
			return extractData<Moment>(response);
		},
		enabled: id > 0,
		staleTime: 5 * 60 * 1000,
	});
}

export function useRecentMoments(limit = 5) {
	return useQuery({
		queryKey: queryKeys.moments.recent(limit),
		queryFn: async () => {
			const response = await apiClient.moment.getMoments(1, limit);
			return extractPagedData<Moment>(response);
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateMoment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: request_CreateMomentRequest) => {
			const response = await apiClient.moment.postMoments(data);
			return extractData(response);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.moments.list() });
			queryClient.invalidateQueries({ queryKey: queryKeys.moments.recent() });
		},
	});
}

export function useDeleteMoment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			await apiClient.moment.deleteMoments(id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.moments.list() });
			queryClient.invalidateQueries({ queryKey: queryKeys.moments.recent() });
		},
	});
}
