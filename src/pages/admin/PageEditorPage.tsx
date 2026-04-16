/**
 * 页面编辑器
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePage, useCreatePage, useUpdatePage } from "@/hooks";
import { PageHeader, LoadingButton, InputField, TextAreaField } from "@/components";
import type { PageTemplate } from "@/types";

// 模板类型选项
const templateOptions: { value: PageTemplate; label: string; description: string }[] = [
	{ value: "default", label: "默认", description: "普通 Markdown 页面" },
	{ value: "about", label: "关于我", description: "时间线 + 个人介绍（支持 YYYY-MM-DD）" },
	{ value: "projects", label: "项目展示", description: "项目卡片列表" },
	{ value: "footprints", label: "我的足迹", description: "地图 + 城市足迹列表" },
];

// 模板示例 frontmatter
const templateExamples: Record<PageTemplate, string> = {
	default: "",
	about: `---
timeline:
  - date: "2024-03-15"
    title: "开始写博客"
    description: "搭建个人博客系统"
    type: "milestone"
  - date: "2023-09-01"
    title: "入职某公司"
    type: "work"
---

## 关于我

欢迎来到我的博客！`,
	projects: `---
projects:
  - name: "个人博客"
    description: "基于 React + Go 的博客系统"
    tech: ["React", "Go", "PostgreSQL"]
    github: "https://github.com/..."
    status: "active"
  - name: "CLI工具"
    description: "命令行效率工具"
    tech: ["Rust"]
    status: "archived"
---

## 项目介绍

这里是我的开源项目。`,
	footprints: `---
cities:
  - name: "北京"
    country: "中国"
    province: "北京市"
    visited_at: "2024-03-15"
    coords: { lat: 39.9042, lng: 116.4074 }
    highlights: ["故宫", "长城"]
    notes: "第一次去北京"
  - name: "上海"
    country: "中国"
    province: "上海市"
    visited_at: "2023-12-20"
    coords: { lat: 31.2304, lng: 121.4737 }
    highlights: ["外滩", "东方明珠"]
  - name: "东京"
    country: "日本"
    visited_at: "2024-01-10"
    coords: { lat: 35.6762, lng: 139.6503 }
    highlights: ["浅草寺", "秋叶原"]
---

## 旅行记录

记录我去过的城市。`,
};

export function PageEditorPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const isEdit = Boolean(id);

	const { data: existingPage } = usePage(Number(id) || 0);
	const createMutation = useCreatePage();
	const updateMutation = useUpdatePage();

	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [template, setTemplate] = useState<PageTemplate>("default");
	const [content, setContent] = useState("");
	const [summary, setSummary] = useState("");
	const [coverImage, setCoverImage] = useState("");
	const [status, setStatus] = useState<"draft" | "published">("draft");
	const [order, setOrder] = useState(0);
	const [showInNav, setShowInNav] = useState(true);
	const [error, setError] = useState("");

	// 加载现有页面数据
	useEffect(() => {
		if (existingPage) {
			setTitle(existingPage.title);
			setSlug(existingPage.slug || "");
			setTemplate(existingPage.template);
			setContent(existingPage.content);
			setSummary(existingPage.summary || "");
			setCoverImage(existingPage.cover_image || "");
			setStatus(existingPage.status);
			setOrder(existingPage.order);
			setShowInNav(existingPage.show_in_nav);
		}
	}, [existingPage]);

	// 模板切换时插入示例内容（仅新建时）
	const handleTemplateChange = (newTemplate: PageTemplate) => {
		setTemplate(newTemplate);
		if (!isEdit && !content) {
			setContent(templateExamples[newTemplate]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!title.trim()) {
			setError("标题不能为空");
			return;
		}

		try {
			const pageData = {
				title,
				slug: slug.trim() || undefined,
				template,
				content,
				summary,
				cover_image: coverImage || undefined,
				status,
				order,
				show_in_nav: showInNav,
			};

			if (isEdit && id) {
				await updateMutation.mutateAsync({
					id: Number(id),
					data: {
						...pageData,
						version: existingPage?.version || 1,
					},
				});
				navigate("/admin/pages");
			} else {
				await createMutation.mutateAsync(pageData);
				navigate("/admin/pages");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "保存失败");
		}
	};

	return (
		<div className="space-y-4">
			<PageHeader
				title={isEdit ? "编辑页面" : "新建页面"}
				icon={isEdit ? "material-symbols:edit-outline-rounded" : "material-symbols:add-rounded"}
			/>

			{/* 表单 */}
			<form
				onSubmit={handleSubmit}
				className="card-base p-6 fade-in-up"
				style={{ animationDelay: "0.1s" }}
			>
				{error && (
					<div className="bg-red-500/10 text-red-500 rounded-[var(--radius-medium)] p-3 mb-4 text-sm">
						{error}
					</div>
				)}

				<InputField
					label="标题"
					value={title}
					onChange={setTitle}
					placeholder="页面标题"
					required
				/>

				{/* Slug 输入 */}
				<div className="mb-4">
					<label className="block text-75 text-sm font-medium mb-2">
						Slug <span className="text-50 text-xs ml-1">(留空自动从标题生成)</span>
					</label>
					<input
						type="text"
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						placeholder="例如: about"
						className="input-base"
					/>
					<p className="text-50 text-xs mt-1">
						用于页面 URL，访问地址为 /pages/{slug || "..."}
					</p>
				</div>

				{/* 模板选择 */}
				<div className="mb-4">
					<label className="block text-75 text-sm font-medium mb-2">页面模板</label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						{templateOptions.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() => handleTemplateChange(opt.value)}
								className={`rounded-[var(--radius-medium)] p-3 text-left transition-all ${
									template === opt.value
										? "bg-gradient-to-r from-[var(--klein-blue)] to-[var(--klein-blue-light)] text-white"
										: "btn-regular hover:bg-[var(--btn-regular-bg-hover)]"
								}`}
							>
								<div className="font-medium">{opt.label}</div>
								<div className={`text-xs ${template === opt.value ? "text-white/80" : "text-50"}`}>
									{opt.description}
								</div>
							</button>
						))}
					</div>
				</div>

				<InputField
					label="封面图片"
					value={coverImage}
					onChange={setCoverImage}
					placeholder="https://example.com/cover.jpg"
					type="url"
				/>

				<TextAreaField
					label="摘要"
					value={summary}
					onChange={setSummary}
					placeholder="页面简要摘要"
					rows={2}
				/>

				{/* 内容编辑器 */}
				<div className="mb-4">
					<label className="block text-75 text-sm font-medium mb-2">
						内容 <span className="text-50 text-xs ml-1">(Markdown + YAML frontmatter)</span>
					</label>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="在这里撰写页面内容..."
						rows={20}
						className="input-base font-mono text-sm"
						required
					/>
					<p className="text-50 text-xs mt-1">
						{template !== "default" && "根据模板类型，在 YAML frontmatter 中填写结构化数据（--- 包围的部分）。"}
						正文使用 Markdown 格式。
					</p>
				</div>

				{/* 排序和导航设置 */}
				<div className="mb-4 flex gap-4 flex-wrap">
					<div className="flex-1 min-w-[120px]">
						<label className="block text-75 text-sm font-medium mb-2">排序</label>
						<input
							type="number"
							value={order}
							onChange={(e) => setOrder(Number(e.target.value))}
							min={0}
							className="input-base w-full"
						/>
						<p className="text-50 text-xs mt-1">数字越小越靠前</p>
					</div>

					<div className="flex items-center gap-2 pt-6">
						<input
							type="checkbox"
							id="showInNav"
							checked={showInNav}
							onChange={(e) => setShowInNav(e.target.checked)}
							className="w-4 h-4 rounded border-[var(--border-light)]"
						/>
						<label htmlFor="showInNav" className="text-75 text-sm">
							显示在导航中
						</label>
					</div>
				</div>

				{/* 状态 */}
				<div className="mb-6">
					<label className="block text-75 text-sm font-medium mb-2">状态</label>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setStatus("draft")}
							className={`rounded-[var(--radius-medium)] py-2 px-4 text-sm font-medium transition-all scale-animation ripple ${
								status === "draft"
									? "bg-gradient-to-r from-[var(--klein-blue)] to-[var(--klein-blue-light)] text-white"
									: "btn-regular"
							}`}
						>
							草稿
						</button>
						<button
							type="button"
							onClick={() => setStatus("published")}
							className={`rounded-[var(--radius-medium)] py-2 px-4 text-sm font-medium transition-all scale-animation ripple ${
								status === "published"
									? "bg-gradient-to-r from-[var(--klein-blue)] to-[var(--klein-blue-light)] text-white"
									: "btn-regular"
							}`}
						>
							发布
						</button>
					</div>
				</div>

				{/* 操作按钮 */}
				<div className="flex gap-2">
					<LoadingButton
						type="submit"
						loading={createMutation.isPending || updateMutation.isPending}
						className="bg-gradient-to-r from-[var(--klein-blue)] to-[var(--klein-blue-light)] text-white"
					>
						{isEdit ? "更新" : "创建"}
					</LoadingButton>
					<button
						type="button"
						onClick={() => navigate("/admin/pages")}
						className="btn-plain rounded-[var(--radius-medium)] py-3 px-6 scale-animation ripple"
					>
						取消
					</button>
				</div>
			</form>
		</div>
	);
}