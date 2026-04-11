import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api";
import { extractData } from "./utils";
import { useOwner } from "./owner";
import type { service_ContributionsResponse, service_ContributionsGroup } from "@/api/generated";

/**
 * 从 GitHub URL 中提取用户名
 */
function extractGitHubUsername(url: string | undefined | null): string | null {
	if (!url) return null;
	const match = url.match(/github\.com\/([^/]+)/);
	return match?.[1] ?? null;
}

/**
 * 获取 GitHub 贡献数据
 */
export function useGitHubContributions() {
	const { data: owner } = useOwner();
	const githubUsername = extractGitHubUsername(owner?.github_url);

	return useQuery({
		queryKey: ["github-contributions", githubUsername],
		queryFn: async (): Promise<service_ContributionsResponse> => {
			const response = await apiClient.github.getGithubContributions();
			// 实际响应被包装在 { success, data } 中，需要提取 data
			return extractData<service_ContributionsResponse>(response as unknown as {
				success?: boolean;
				data?: service_ContributionsResponse;
				error?: { message?: string };
			});
		},
		enabled: !!githubUsername,
		staleTime: 60 * 60 * 1000,
		gcTime: 24 * 60 * 60 * 1000,
		retry: 1,
	});
}

export { extractGitHubUsername };
export type { service_ContributionsResponse as ContributionsResponse, service_ContributionsGroup as ContributionsGroup };