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
	setFormValue: (key: string, value: string) => void;
	setError: (error: string) => void;
	resetForm: () => void;
	handleEdit: (entity: T) => void;
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
		(entity: T) => {
			setEditEntity(entity);
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

/** 通用表单提交处理 */
export function useFormSubmit<T extends EntityWithId, D>(
	editEntity: T | null,
	formValues: Record<string, string>,
	createMutation: { mutateAsync: (data: D) => Promise<void>; isPending: boolean },
	updateMutation: {
		mutateAsync: (data: { id: number; data: D }) => Promise<void>;
		isPending: boolean;
	},
	buildCreateData: (values: Record<string, string>) => D,
	buildUpdateData: (values: Record<string, string>) => D,
	resetForm: () => void,
	setError: (error: string) => void,
) {
	return async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			if (editEntity) {
				await updateMutation.mutateAsync({
					id: editEntity.id,
					data: buildUpdateData(formValues),
				});
			} else {
				await createMutation.mutateAsync(buildCreateData(formValues));
			}
			resetForm();
		} catch (err) {
			setError(err instanceof Error ? err.message : "保存失败");
		}
	};
}