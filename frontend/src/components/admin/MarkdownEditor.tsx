/**
 * Markdown 编辑器组件
 *
 * 使用 react-markdown-editor-lite 提供分屏编辑体验：
 * - 左侧：Markdown 编辑区
 * - 右侧：实时预览区
 */
import { useMemo } from "react";
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

	const handleEditorChange = ({ text }: { html: string; text: string }) => {
		onChange(text);
	};

	return (
		<div className="markdown-editor-wrapper h-full">
			<MdEditor
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