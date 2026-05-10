/**
 * 标签管理页面
 * 使用通用管理页面组件和 hooks
 */

import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks";
import {
	AdminPageLayout,
	AdminPageState,
	AdminForm,
	AdminListContainer,
	AdminListItem,
} from "@/components/admin";
import { InputField } from "@/components";
import {
	useAdminFormState,
	useDeleteHandler,
	validateRequired,
} from "@/hooks/useAdminForm";
import type { Tag } from "@/types";

const INITIAL_VALUES = {
	name: "",
	slug: "",
};

const REQUIRED_FIELDS = ["name"];

/** 从标签实体获取表单值 */
const getTagFormValues = (tag: Tag): Record<string, string> => ({
	name: tag.name,
	slug: tag.slug,
});

export function AdminTagsPage() {
	const { data: tags, isLoading, error } = useTags();
	const createMutation = useCreateTag();
	const updateMutation = useUpdateTag();
	const deleteMutation = useDeleteTag();

	const formState = useAdminFormState<Tag>({ initialValues: INITIAL_VALUES });
	const handleDelete = useDeleteHandler(deleteMutation, "标签");

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
		isEmpty: !tags || tags.length === 0,
		emptyIcon: "material-symbols:label-outline-rounded",
		emptyMessage: "暂无标签",
		errorMessage: "加载标签列表失败",
	});

	if (stateComponent) {
		return (
			<AdminPageLayout
				title="标签管理"
				newButtonLabel="新建标签"
				onNewClick={() => formState.setShowForm(true)}
			>
				{stateComponent}
			</AdminPageLayout>
		);
	}

	return (
		<AdminPageLayout
			title="标签管理"
			newButtonLabel="新建标签"
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
						placeholder="标签名称"
						required
					/>
					<InputField
						label="Slug"
						value={formState.formValues.slug ?? ""}
						onChange={(v) => formState.setFormValue("slug", v)}
						placeholder="留空自动生成（基于名称）"
					/>
				</AdminForm>
			)}

			<AdminListContainer>
				{tags!.map((tag) => (
					<AdminListItem
						key={tag.id}
						title={tag.name}
						badges={[
							{ label: `Slug: ${tag.slug}` },
							{ label: `${tag.article_count ?? 0} 篇文章` },
						]}
						editOnClick={() => formState.handleEdit(tag, getTagFormValues)}
						onDelete={() => handleDelete(tag.id)}
						deleteDisabled={deleteMutation.isPending}
					/>
				))}
			</AdminListContainer>
		</AdminPageLayout>
	);
}
