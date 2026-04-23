/**
 * Markdown 编辑器组件
 *
 * 使用 react-markdown-editor-lite 提供分屏编辑体验：
 * - 左侧：Markdown 编辑区
 * - 右侧：实时预览区
 */
import { useMemo, useState, useEffect } from "react";
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import "react-markdown-editor-lite/lib/index.css";

const mdParser = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	height?: number | string;
}

export function MarkdownEditor({
	value,
	onChange,
	placeholder = "在这里撰写 Markdown 内容...",
	height = 500,
}: MarkdownEditorProps) {
	const editorStyle = useMemo(() => ({ height }), [height]);
	// 使用 key 强制重新挂载编辑器，确保初始值正确设置到 undo 历史中
	const [editorKey, setEditorKey] = useState(0);
	const [isInitialized, setIsInitialized] = useState(false);

	// 当 value 从空变为有值时，重新挂载编辑器
	useEffect(() => {
		if (value && !isInitialized) {
			setIsInitialized(true);
			setEditorKey((k) => k + 1);
		}
	}, [value, isInitialized]);

	const handleEditorChange = ({ text }: { html: string; text: string }) => {
		onChange(text);
	};

	return (
		<div className="markdown-editor-wrapper h-full">
			<MdEditor
				key={editorKey}
				value={value}
				style={editorStyle}
				renderHTML={(text) => mdParser.render(text)}
				onChange={handleEditorChange}
				placeholder={placeholder}
				view={{ menu: true, md: true, html: false }}
				canView={{ fullScreen: true, md: true, html: true, both: true, menu: true, hideMenu: true }}
			/>
		</div>
	);
}