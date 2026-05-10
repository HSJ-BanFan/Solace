/**
 * 分类管理页面
 * 使用通用管理页面组件和 hooks
 */

import {
	useCategories,
	useCreateCategory,
	useUpdateCategory,
	useDeleteCategory,
} from "@/hooks";
import {
	AdminPageLayout,
	AdminPageState,
	AdminForm,
	AdminListContainer,
	AdminListItem,
} from "@/components/admin";
import { InputField, TextAreaField } from "@/components";
import {
	useAdminFormState,
	useDeleteHandler,
	validateRequired,
} from "@/hooks/useAdminForm";
import type { Category } from "@/types";

const INITIAL_VALUES = {
	name: "",
	slug: "",
	description: "",
	sortOrder: "0",
};

const REQUIRED_FIELDS = ["name"];

/** 从分类实体获取表单值 */
const getCategoryFormValues = (category: Category): Record<string, string> => ({
	name: category.name,
	slug: category.slug,
	description: category.description || "",
	sortOrder: String(category.sort_order),
});

export function AdminCategoriesPage() {
	const { data: categories, isLoading, error } = useCategories();
	const createMutation = useCreateCategory();
	const updateMutation = useUpdateCategory();
	const deleteMutation = useDeleteCategory();

	const formState = useAdminFormState<Category>({ initialValues: INITIAL_VALUES });
	const handleDelete = useDeleteHandler(deleteMutation, "分类");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const validationError = validateRequired(formState.formValues, REQUIRED_FIELDS);
		if (validationError) {
			formState.setError(validationError);
			return;
		}

		const data = {
			name: formState.formValues.name ?? "",
			slug: formState.formValues.slug || undefined,
			description: formState.formValues.description ?? "",
			sort_order: parseInt(formState.formValues.sortOrder ?? "0") || 0,
		};

		try {
			if (formState.editEntity) {
				await updateMutation.mutateAsync({ id: formState.editEntity.id, data });
			} else {
				await createMutation.mutateAsync(data);
			}
			formState.resetForm();
		} catch (err) {
			formState.setError(err instanceof Error ? err.message : "保存失败");
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

	return (
		<AdminPageLayout
			title="分类管理"
			newButtonLabel="新建分类"
			onNewClick={() => formState.setShowForm(true)}
		>
			{formState.showForm && (
				<AdminForm
					onSubmit={handleSubmit}
					error={formState.error}
					onCancel={formState.resetForm}
					submitLabel={formState.editEntity ? "更新" : "创建"}
					isSubmitting={createMutation.isPending || updateMutation.isPending}
				>
					<InputField
						label="名称"
						value={formState.formValues.name ?? ""}
						onChange={(v) => formState.setFormValue("name", v)}
						placeholder="分类名称"
						required
					/>
					<InputField
						label="Slug"
						value={formState.formValues.slug ?? ""}
						onChange={(v) => formState.setFormValue("slug", v)}
						placeholder="留空自动生成（基于名称）"
					/>
					<TextAreaField
						label="描述"
						value={formState.formValues.description ?? ""}
						onChange={(v) => formState.setFormValue("description", v)}
						placeholder="分类简要描述"
						rows={2}
					/>
					<InputField
						label="排序"
						type="number"
						value={formState.formValues.sortOrder ?? "0"}
						onChange={(v) => formState.setFormValue("sortOrder", v)}
						placeholder="排序顺序（数字越小越靠前）"
					/>
				</AdminForm>
			)}

			{stateComponent ?? (
				<AdminListContainer>
					{categories!.map((category) => (
						<AdminListItem
							key={category.id}
							title={category.name}
							subtitle={category.description ?? undefined}
							badges={[
								{ label: `Slug: ${category.slug}` },
								{ label: `${category.article_count ?? 0} 篇文章` },
								{ label: `排序: ${category.sort_order}` },
							]}
							editOnClick={() => formState.handleEdit(category, getCategoryFormValues)}
							onDelete={() => handleDelete(category.id)}
							deleteDisabled={deleteMutation.isPending}
						/>
					))}
				</AdminListContainer>
			)}
		</AdminPageLayout>
	);
}
