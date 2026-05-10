/**
 * 分页处理 Hook
 *
 * 提供统一的分页逻辑，减少重复代码
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

interface UsePaginationOptions {
	defaultPageSize?: number;
	scrollToTop?: boolean;
}

interface UsePaginationReturn {
	page: number;
	pageSize: number;
	handlePageChange: (newPage: number) => void;
	searchParams: URLSearchParams;
	setSearchParams: (params: Record<string, string>) => void;
}

/** 分页 Hook - 从 URL 参数管理分页状态 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
	const { defaultPageSize = 10, scrollToTop = true } = options;
	const [searchParams, setSearchParams] = useSearchParams();

	const page = parseInt(searchParams.get("page") || "1", 10);
	const pageSize = defaultPageSize;

	const handlePageChange = (newPage: number) => {
		setSearchParams({ page: String(newPage) });
		if (scrollToTop) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const setParams = (params: Record<string, string>) => {
		setSearchParams(params);
		if (scrollToTop) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return {
		page,
		pageSize,
		handlePageChange,
		searchParams,
		setSearchParams: setParams,
	};
}

/** 简单分页 Hook - 用于管理页面（不使用 URL 参数） */
export function useSimplePagination(options: UsePaginationOptions = {}) {
	const { defaultPageSize = 10, scrollToTop = false } = options;
	const [page, setPage] = useState(1);
	const pageSize = defaultPageSize;

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		if (scrollToTop) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return { page, pageSize, handlePageChange, setPage };
}
