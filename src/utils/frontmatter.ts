/**
 * YAML Frontmatter 解析工具
 *
 * 解析 Markdown 文件中的 YAML frontmatter 部分
 * 格式：
 * ---
 * key: value
 * list:
 *   - item1
 *   - item2
 * ---
 * 
 * Markdown 正文内容
 */

import type { ParsedContent } from "@/types";

/**
 * 解析 Markdown 中的 YAML frontmatter
 * 
 * 注意：这是一个简化版的解析器，仅支持基本的数据类型
 * 对于复杂结构，建议安装 js-yaml: npm install js-yaml
 */
export function parseFrontmatter<T extends Record<string, unknown>>(
	content: string,
): ParsedContent<T> {
	// frontmatter 正则：--- 开头和结尾的 YAML 块
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		// 没有 frontmatter，返回空对象和原始内容
		return { frontmatter: {} as T, markdown: content };
	}

	const yamlContent = match[1] || "";
	const markdown = content.slice(match[0]?.length || 0);

	// 解析 YAML（简化版）
	const frontmatter = parseSimpleYaml(yamlContent) as T;

	return { frontmatter, markdown };
}

/**
 * 简化的 YAML 解析器
 * 支持基本类型：字符串、数字、布尔、数组（简单项）
 */
function parseSimpleYaml(yaml: string): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	const lines = yaml.split("\n");

	let currentKey: string | null = null;
	let currentArray: unknown[] | null = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] || "";
		const trimmedLine = line.trim();

		// 空行跳过
		if (trimmedLine === "") {
			continue;
		}

		// 数组项（以 - 开头）
		if (trimmedLine.startsWith("- ")) {
			const value = parseValue(trimmedLine.slice(2).trim());
			if (currentArray !== null) {
				currentArray.push(value);
			}
			continue;
		}

		// 键值对（key: value）
		const colonIndex = trimmedLine.indexOf(":");
		if (colonIndex !== -1) {
			const key = trimmedLine.slice(0, colonIndex).trim();
			const valuePart = trimmedLine.slice(colonIndex + 1).trim();

			// 如果当前正在解析数组，保存它
			if (currentArray !== null && currentKey !== null) {
				result[currentKey] = currentArray;
				currentArray = null;
			}

			currentKey = key;

			// 检查下一行是否是数组开始
			if (i + 1 < lines.length) {
				const nextLine = (lines[i + 1] || "").trim();
				if (nextLine.startsWith("- ")) {
					// 值是数组，开始收集
					currentArray = [];
					result[key] = currentArray;
					continue;
				}
			}

			// 单值
			if (valuePart === "") {
				// 空值，可能是数组或多行字符串的开始
				result[key] = null;
			} else {
				result[key] = parseValue(valuePart);
			}
		}
	}

	// 保存最后一个数组
	if (currentArray !== null && currentKey !== null) {
		result[currentKey] = currentArray;
	}

	return result;
}

/**
 * 解析单个值
 */
function parseValue(value: string): unknown {
	// 布尔值
	if (value === "true") return true;
	if (value === "false") return false;

	// 数字
	if (/^-?\d+$/.test(value)) {
		return parseInt(value, 10);
	}
	if (/^-?\d+\.\d+$/.test(value)) {
		return parseFloat(value);
	}

	// 字符串（移除引号）
	if (value.startsWith('"') && value.endsWith('"')) {
		return value.slice(1, -1);
	}
	if (value.startsWith("'") && value.endsWith("'")) {
		return value.slice(1, -1);
	}

	// JSON 对象（如果看起来像对象）
	if (value.startsWith("{") && value.endsWith("}")) {
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}

	return value;
}

/**
 * 将 frontmatter 对象转换为 YAML 字符串
 */
export function stringifyFrontmatter(frontmatter: Record<string, unknown>): string {
	if (Object.keys(frontmatter).length === 0) {
		return "";
	}

	const lines: string[] = ["---"];

	for (const [key, value] of Object.entries(frontmatter)) {
		if (Array.isArray(value)) {
			lines.push(`${key}:`);
			for (const item of value) {
				if (typeof item === "object" && item !== null) {
					// 对象数组项，使用 JSON 格式
					lines.push(`  - ${JSON.stringify(item)}`);
				} else {
					lines.push(`  - ${stringifyValue(item)}`);
				}
			}
		} else if (typeof value === "object" && value !== null) {
			lines.push(`${key}: ${JSON.stringify(value)}`);
		} else {
			lines.push(`${key}: ${stringifyValue(value)}`);
		}
	}

	lines.push("---");
	return lines.join("\n") + "\n";
}

/**
 * 将单个值转换为 YAML 格式字符串
 */
function stringifyValue(value: unknown): string {
	if (value === null) return "";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "number") return String(value);
	return String(value);
}