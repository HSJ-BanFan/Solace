import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	useArticle,
	useCreateArticle,
	useUpdateArticle,
	useCategories,
	useTags,
} from "@/hooks";
import {
	LoadingButton,
	InputField,
	TextAreaField,
} from "@/components";
import { LazyMarkdownEditor } from "@/components/admin";
import { request_CreateArticleRequest } from "@/api";

export function ArticleEditorPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const isEdit = Boolean(id);

	const { data: existingArticle } = useArticle(Number(id) || 0);
	const { data: categories } = useCategories();
	const { data: tags } = useTags();
	const createMutation = useCreateArticle();
	const updateMutation = useUpdateArticle();

	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [content, setContent] = useState("");
	const [summary, setSummary] = useState("");
	const [coverImage, setCoverImage] = useState("");
	const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
	const [status, setStatus] = useState<request_CreateArticleRequest.status>(
		request_CreateArticleRequest.status.DRAFT,
	);
	const [error, setError] = useState("");

	useEffect(() => {
		if (existingArticle) {
			setTitle(existingArticle.title);
			setSlug(existingArticle.slug || "");
			setContent(existingArticle.content);
			setSummary(existingArticle.summary || "");
			setCoverImage(existingArticle.cover_image || "");
			setCategoryId(existingArticle.category?.id);
			setSelectedTagIds(existingArticle.tags?.map((t) => t.id) || []);
			setStatus(existingArticle.status as request_CreateArticleRequest.status);
		}
	}, [existingArticle]);

	const toggleTag = (tagId: number) => {
		setSelectedTagIds((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId],
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!title.trim()) {
			setError("标题不能为空");
			return;
		}

		if (!content.trim()) {
			setError("内容不能为空");
			return;
		}

		try {
			const articleData = {
				title,
				slug: slug.trim() || undefined,
				content,
				summary,
				cover_image: coverImage || undefined,
				category_id: categoryId,
				tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
				status,
			};

			if (isEdit && id) {
				await updateMutation.mutateAsync({
					id: Number(id),
					data: {
						...articleData,
						version: existingArticle?.version || 1,
					},
				});
				navigate("/admin");
			} else {
				await createMutation.mutateAsync(articleData);
				navigate("/admin");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "保存失败");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="bg-red-500/10 text-red-500 rounded-[var(--radius-medium)] p-3 mb-4 text-sm">
					{error}
				</div>
			)}

			<div className="card-base p-6 h-[calc(100vh-12rem)] flex flex-col">
				<InputField
					label="标题"
					value={title}
					onChange={setTitle}
					placeholder="文章标题"
					required
				/>
				<div className="flex-1 min-h-0 mt-4">
					<LazyMarkdownEditor
						value={content}
						onChange={setContent}
						placeholder="在这里撰写 Markdown 内容..."
						height="100%"
					/>
				</div>
			</div>

			<div className="card-base p-6 space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="article-slug" className="block text-75 text-sm font-medium mb-2">
							Slug <span className="text-50 text-xs ml-1">(留空自动生成)</span>
						</label>
						<input
							id="article-slug"
							type="text"
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
							placeholder="例如: my-first-post"
							className="input-base"
						/>
					</div>
					<InputField
						label="封面图片"
						value={coverImage}
						onChange={setCoverImage}
						placeholder="https://example.com/cover.jpg"
						type="url"
					/>
</div>

				<TextAreaField
					label="摘要"
					value={summary}
					onChange={setSummary}
					placeholder="文章简要摘要"
					rows={2}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="article-category" className="block text-75 text-sm font-medium mb-2">分类</label>
						<select
							id="article-category"
							value={categoryId || ""}
							onChange={(e) =>
								setCategoryId(e.target.value ? Number(e.target.value) : undefined)
							}
							className="input-base"
						>
							<option value="">无分类</option>
							{categories?.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-75 text-sm font-medium mb-2">标签</label>
						<div className="flex flex-wrap gap-2">
							{tags?.map((tag) => (
								<button
									key={tag.id}
									type="button"
									onClick={() => toggleTag(tag.id)}
									className={`btn-regular btn-sm py-1 px-2.5 ${
										selectedTagIds.includes(tag.id)
											? "border-[var(--primary)] bg-[var(--btn-regular-bg-active)]"
											: ""
									}`}
								>
									{tag.name}
								</button>
							))}
							{(!tags || tags.length === 0) && (
								<span className="text-50 text-sm">暂无标签</span>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
					<div className="flex items-center gap-2">
						<label className="text-75 text-sm font-medium">状态</label>
						{Object.values(request_CreateArticleRequest.status).map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => setStatus(s)}
								className={`btn-regular btn-sm py-1.5 px-3 ${
									status === s
										? "border-[var(--primary)] bg-[var(--btn-regular-bg-active)]"
										: ""
								}`}
							>
								{s === "published" ? "发布" : "草稿"}
							</button>
						))}
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => navigate("/admin")}
							className="btn-plain btn-sm py-1.5 px-4"
						>
							取消
						</button>
						<LoadingButton
							type="submit"
							loading={createMutation.isPending || updateMutation.isPending}
							className="btn-regular btn-sm py-1.5 px-4"
						>
							{isEdit ? "更新" : "创建"}
						</LoadingButton>
					</div>
				</div>
			</div>
		</form>
	);
}