import type { TocHeading } from "@/components/widget/TableOfContents";
import {
	getCurrentHeadingId,
	getHashHeadingId,
	getScrollTargetTop,
	reconcileHashHeading,
} from "./useTocScroll";

function fail(message: string): never {
	throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
	if (actual !== expected) {
		fail(`${label}: expected ${String(expected)}, got ${String(actual)}`);
	}
}

async function run(): Promise<void> {
	const headings: TocHeading[] = [
		{ id: "6-overlap", text: "Section 6", depth: 1 },
		{ id: "7-current", text: "Section 7", depth: 1 },
		{ id: "8-next", text: "Section 8", depth: 1 },
	];

	const activeId = getCurrentHeadingId(headings, 620, (id) => {
		const topById: Record<string, number> = {
			"6-overlap": 120,
			"7-current": 540,
			"8-next": 980,
		};

		return topById[id] ?? null;
	});

	assertEqual(
		activeId,
		"7-current",
		"active heading should advance to latest heading above scroll threshold",
	);

	assertEqual(
		getHashHeadingId("#7-%E7%9C%9F%E5%AE%9E%E7%BF%BB%E8%BD%A6", [
			{ id: "7-真实翻车", text: "Section 7", depth: 1 },
		]),
		"7-真实翻车",
		"hash parser should decode encoded heading ids",
	);
	assertEqual(getHashHeadingId("#", headings), "", "empty hash should return empty id");
	assertEqual(
		getHashHeadingId("#missing", headings),
		"",
		"unknown hash should not activate a heading",
	);
	assertEqual(
		getHashHeadingId("#%E0%A4%A", [{ id: "broken", text: "Broken", depth: 1 }]),
		"",
		"malformed encoded hash should not activate unrelated headings",
	);
	assertEqual(
		getScrollTargetTop(720, 80),
		640,
		"scroll target should subtract fixed TOC offset",
	);

	const scrollCalls: ScrollToOptions[] = [];
	const hashActiveId = reconcileHashHeading(
		"#7-%E7%9C%9F%E5%AE%9E%E7%BF%BB%E8%BD%A6",
		[
			{ id: "6-前一节", text: "Section 6", depth: 1 },
			{ id: "7-真实翻车", text: "Section 7", depth: 1 },
		],
		80,
		(id) => (id === "7-真实翻车" ? 720 : null),
		(options) => {
			scrollCalls.push(options);
		},
	);

	assertEqual(
		hashActiveId,
		"7-真实翻车",
		"hash reconciliation should decode heading id and return active heading",
	);
	assertEqual(scrollCalls.length, 1, "hash reconciliation should trigger one scroll");
	assertEqual(scrollCalls[0]?.top, 640, "hash reconciliation should honor TOC offset");
	assertEqual(scrollCalls[0]?.behavior, "auto", "hash reconciliation should avoid smooth reset race");
}

await run();
