/**
 * 标签管理页面
 * 使用通用管理页面组件
 */

import { useState } from "react";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks";
import {
	AdminPageLayout,
	AdminPageState,
	AdminForm,
	AdminListContainer,
	AdminListItem,
} from "@/components/admin";
import { InputField } from "@/components";
import { useDeleteHandler } from "@/hooks/useAdminForm";
import type { Tag } from "@/types";

const INITIAL_VALUES = {
	name: "",
	slug: "",
};

export function AdminTagsPage() {
	const { data: tags, isLoading, error } = useTags();
	const createMutation = useCreateTag();
	const updateMutation = useUpdateTag();
	const deleteMutation = useDeleteTag();

	const [showForm, setShowForm] = useState(false);
	const [editingTag, setEditingTag] = useState<Tag | null>(null);
	const [formValues, setFormValues] = useState(INITIAL_VALUES);
	const [errorForm, setErrorForm] = useState("");

	const handleDelete = useDeleteHandler(deleteMutation, "标签");

	const handleEdit = (tag: Tag) => {
		setEditingTag(tag);
		setFormValues({
			name: tag.name,
			slug: tag.slug,
		});
		setShowForm(true);
	};

	const resetForm = () => {
		setFormValues(INITIAL_VALUES);
		setErrorForm("");
		setEditingTag(null);
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
			if (editingTag) {
				await updateMutation.mutateAsync({
					id: editingTag.id,
					data: {
						name: formValues.name,
						slug: formValues.slug || undefined,
					},
				});
			} else {
				await createMutation.mutateAsync({
					name: formValues.name,
					slug: formValues.slug || undefined,
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
		isEmpty: !tags || tags.length === 0,
		emptyIcon: "material-symbols:label-outline-rounded",
		emptyMessage: "暂无标签",
		errorMessage: "加载标签列表失败",
	});

	if (stateComponent) {
		return (
			<AdminPageLayout title="标签管理" newButtonLabel="新建标签" onNewClick={() => setShowForm(true)}>
				{stateComponent}
			</AdminPageLayout>
		);
	}

	return (
		<AdminPageLayout title="标签管理" newButtonLabel="新建标签" onNewClick={() => setShowForm(true)}>
			{/* 表单 */}
			{showForm && (
				<AdminForm
					onSubmit={handleSubmit}
					error={errorForm}
					onCancel={resetForm}
					submitLabel={editingTag ? "更新" : "创建"}
					isSubmitting={createMutation.isPending || updateMutation.isPending}
				>
					<InputField
						label="名称"
						value={formValues.name}
						onChange={(v) => setFormValues((prev) => ({ ...prev, name: v }))}
						placeholder="标签名称"
						required
					/>
					<InputField
						label="Slug"
						value={formValues.slug}
						onChange={(v) => setFormValues((prev) => ({ ...prev, slug: v }))}
						placeholder="留空自动生成（基于名称）"
					/>
				</AdminForm>
			)}

			{/* 标签列表 */}
			<AdminListContainer>
				{tags!.map((tag) => (
					<AdminListItem
						key={tag.id}
						title={tag.name}
						badges={[
							{ label: `Slug: ${tag.slug}`, variant: "default" },
							{ label: `${tag.article_count || 0} 篇文章`, variant: "default" },
						]}
						editOnClick={() => handleEdit(tag)}
						onDelete={() => handleDelete(tag.id)}
						deleteDisabled={deleteMutation.isPending}
					/>
				))}
			</AdminListContainer>
		</AdminPageLayout>
	);
}
