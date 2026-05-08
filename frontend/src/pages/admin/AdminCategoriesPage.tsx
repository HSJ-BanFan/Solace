/**
 * 分类管理页面
 * 使用通用管理页面组件
 */

import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks";
import {
	AdminPageLayout,
	AdminPageState,
	AdminForm,
	AdminListContainer,
	AdminListItem,
} from "@/components/admin";
import { InputField, TextAreaField } from "@/components";
import { useDeleteHandler } from "@/hooks/useAdminForm";
import type { Category } from "@/types";

const INITIAL_VALUES = {
	name: "",
	slug: "",
	description: "",
	sortOrder: "0",
};

export function AdminCategoriesPage() {
	const { data: categories, isLoading, error } = useCategories();
	const createMutation = useCreateCategory();
	const updateMutation = useUpdateCategory();
	const deleteMutation = useDeleteCategory();

	const [showForm, setShowForm] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [formValues, setFormValues] = useState(INITIAL_VALUES);
	const [errorForm, setErrorForm] = useState("");

	const handleDelete = useDeleteHandler(deleteMutation, "分类");

	const handleEdit = (category: Category) => {
		setEditingCategory(category);
		setFormValues({
			name: category.name,
			slug: category.slug,
			description: category.description || "",
			sortOrder: String(category.sort_order),
		});
		setShowForm(true);
	};

	const resetForm = () => {
		setFormValues(INITIAL_VALUES);
		setErrorForm("");
		setEditingCategory(null);
		setShowForm(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorForm("");

		if (!formValues.name.trim()) {
			setErrorForm("名称不能为空");
			return;
		}

		try {
			if (editingCategory) {
				await updateMutation.mutateAsync({
					id: editingCategory.id,
					data: {
						name: formValues.name,
						slug: formValues.slug || undefined,
						description: formValues.description,
						sort_order: parseInt(formValues.sortOrder) || 0,
					},
				});
			} else {
				await createMutation.mutateAsync({
					name: formValues.name,
					slug: formValues.slug || undefined,
					description: formValues.description,
					sort_order: parseInt(formValues.sortOrder) || 0,
				});
			}
			resetForm();
		} catch (err) {
			setErrorForm(err instanceof Error ? err.message : "保存失败");
		}
	};

	const stateComponent = AdminPageState({
		isLoading,
		error,
		isEmpty: !categories || categories.length === 0,
		emptyIcon: "material-symbols:category-outline-rounded",
		emptyMessage: "暂无分类",
		errorMessage: "加载分类列表失败",
	});

	if (stateComponent) {
		return (
			<AdminPageLayout title="分类管理" newButtonLabel="新建分类" onNewClick={() => setShowForm(true)}>
				{stateComponent}
			</AdminPageLayout>
		);
	}

	return (
		<AdminPageLayout title="分类管理" newButtonLabel="新建分类" onNewClick={() => setShowForm(true)}>
			{/* 表单 */}
			{showForm && (
				<AdminForm
					onSubmit={handleSubmit}
					error={errorForm}
					onCancel={resetForm}
					submitLabel={editingCategory ? "更新" : "创建"}
					isSubmitting={createMutation.isPending || updateMutation.isPending}
				>
					<InputField
						label="名称"
						value={formValues.name}
						onChange={(v) => setFormValues((prev) => ({ ...prev, name: v }))}
						placeholder="分类名称"
						required
					/>
					<InputField
						label="Slug"
						value={formValues.slug}
						onChange={(v) => setFormValues((prev) => ({ ...prev, slug: v }))}
						placeholder="留空自动生成（基于名称）"
					/>
					<TextAreaField
						label="描述"
						value={formValues.description}
						onChange={(v) => setFormValues((prev) => ({ ...prev, description: v }))}
						placeholder="分类简要描述"
						rows={2}
					/>
					<InputField
						label="排序"
						type="number"
						value={formValues.sortOrder}
						onChange={(v) => setFormValues((prev) => ({ ...prev, sortOrder: v }))}
						placeholder="排序顺序（数字越小越靠前）"
					/>
				</AdminForm>
			)}

			{/* 分类列表 */}
			<AdminListContainer>
				{categories!.map((category) => (
					<AdminListItem
						key={category.id}
						title={category.name}
						subtitle={category.description}
						badges={[
							{ label: `Slug: ${category.slug}`, variant: "default" },
							{ label: `${category.article_count || 0} 篇文章`, variant: "default" },
							{ label: `排序: ${category.sort_order}`, variant: "default" },
						]}
						editOnClick={() => handleEdit(category)}
						onDelete={() => handleDelete(category.id)}
						deleteDisabled={deleteMutation.isPending}
					/>
				))}
			</AdminListContainer>
		</AdminPageLayout>
	);
}
