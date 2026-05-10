/**
 * 管理页面表单状态 Hook
 *
 * 提供统一的表单状态管理，减少管理页面的重复代码
 */

import { useState, useCallback } from "react";

interface EntityWithId {
	id: number;
}

interface UseAdminFormStateOptions {
	initialValues: Record<string, string>;
}

interface UseAdminFormStateReturn<T extends EntityWithId> {
	showForm: boolean;
	editEntity: T | null;
	formValues: Record<string, string>;
	error: string;
	setShowForm: (show: boolean) => void;
	setEditEntity: (entity: T | null) => void;
	setFormValues: (values: Record<string, string>) => void;
	setFormValue: (key: string, value: string) => void;
	setError: (error: string) => void;
	resetForm: () => void;
	handleEdit: (entity: T, getFormValues: (entity: T) => Record<string, string>) => void;
}

/** 管理页面表单状态 Hook */
export function useAdminFormState<T extends EntityWithId>(
	options: UseAdminFormStateOptions,
): UseAdminFormStateReturn<T> {
	const { initialValues } = options;

	const [showForm, setShowForm] = useState(false);
	const [editEntity, setEditEntity] = useState<T | null>(null);
	const [formValues, setFormValues] = useState<Record<string, string>>(initialValues);
	const [error, setError] = useState("");

	const setFormValue = useCallback((key: string, value: string) => {
		setFormValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	const resetForm = useCallback(() => {
		setFormValues(initialValues);
		setError("");
		setEditEntity(null);
		setShowForm(false);
	}, [initialValues]);

	const handleEdit = useCallback(
		(entity: T, getFormValues: (entity: T) => Record<string, string>) => {
			setEditEntity(entity);
			setFormValues(getFormValues(entity));
			setShowForm(true);
		},
		[],
	);

	return {
		showForm,
		editEntity,
		formValues,
		error,
		setShowForm,
		setEditEntity,
		setFormValues,
		setFormValue,
		setError,
		resetForm,
		handleEdit,
	};
}

/** 通用删除处理 */
export function useDeleteHandler(
	mutation: { mutateAsync: (id: number) => Promise<void>; isPending: boolean },
	entityName: string = "项目",
) {
	return async (id: number) => {
		if (!confirm(`确定要删除这个${entityName}吗？`)) return;
		try {
			await mutation.mutateAsync(id);
		} catch (err) {
			alert(err instanceof Error ? err.message : "删除失败");
		}
	};
}

/** 验证必填字段 */
export function validateRequired(values: Record<string, string>, requiredFields: string[]): string | null {
	for (const field of requiredFields) {
		if (!values[field]?.trim()) {
			return `${field}不能为空`;
		}
	}
	return null;
}