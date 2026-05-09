import { useCallback, useEffect, useRef, useState } from "react";
import type { TocHeading } from "@/components/widget/TableOfContents";

interface UseTocScrollOptions {
	headings: TocHeading[];
	offset?: number;
}

type HeadingAnchor = Pick<HTMLElement, "getBoundingClientRect">;

const ACTIVE_OFFSET_PADDING = 20;
const SCROLL_DEBOUNCE_MS = 50;
const HASH_SCROLL_BEHAVIOR: ScrollBehavior = "auto";

export function getCurrentHeadingId(
	headings: TocHeading[],
	scrollPosition: number,
	getElementTop: (id: string) => number | null,
): string {
	let currentId = headings[0]?.id ?? "";

	for (const heading of headings) {
		const top = getElementTop(heading.id);
		if (top !== null && scrollPosition >= top) {
			currentId = heading.id;
		}
	}

	return currentId;
}

export function getHashHeadingId(hash: string, headings: TocHeading[]): string {
	const rawHash = hash.replace(/^#/, "");
	if (!rawHash) {
		return "";
	}

	let normalizedHash = rawHash;
	try {
		normalizedHash = decodeURIComponent(rawHash);
	} catch {
		normalizedHash = rawHash;
	}

	return headings.some((heading) => heading.id === normalizedHash)
		? normalizedHash
		: "";
}

export function getScrollTargetTop(elementTop: number, offset: number): number {
	return elementTop - offset;
}

export function reconcileHashHeading(
	hash: string,
	headings: TocHeading[],
	offset: number,
	getElementTop: (id: string) => number | null,
	scrollTo: (options: ScrollToOptions) => void,
): string {
	const hashId = getHashHeadingId(hash, headings);
	if (!hashId) {
		return "";
	}

	const elementTop = getElementTop(hashId);
	if (elementTop === null) {
		return "";
	}

	scrollTo({
		top: getScrollTargetTop(elementTop, offset),
		behavior: HASH_SCROLL_BEHAVIOR,
	});

	return hashId;
}

function getHeadingElement(id: string): HeadingAnchor | null {
	return document.getElementById(id);
}

function getHeadingTop(id: string): number | null {
	const element = getHeadingElement(id);
	return element ? element.getBoundingClientRect().top + window.scrollY : null;
}

export function useTocScroll({ headings, offset = 80 }: UseTocScrollOptions) {
	const [activeId, setActiveId] = useState<string>("");
	const activeIdRef = useRef(activeId);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		activeIdRef.current = activeId;
	}, [activeId]);

	const syncActiveHeading = useCallback(() => {
		if (headings.length === 0) {
			return;
		}

		const nextId = getCurrentHeadingId(
			headings,
			window.scrollY + offset + ACTIVE_OFFSET_PADDING,
			getHeadingTop,
		);

		if (nextId && nextId !== activeIdRef.current) {
			setActiveId(nextId);
		}
	}, [headings, offset]);

	useEffect(() => {
		if (headings.length === 0) {
			return;
		}

		observerRef.current?.disconnect();
		observerRef.current = new IntersectionObserver(
			() => {
				syncActiveHeading();
			},
			{ rootMargin: "-15% 0px -60% 0px", threshold: [0, 1] },
		);

		headings.forEach((heading) => {
			const element = document.getElementById(heading.id);
			if (element) {
				observerRef.current?.observe(element);
			}
		});

		const frameId = window.requestAnimationFrame(() => {
			const hashId = reconcileHashHeading(
				window.location.hash,
				headings,
				offset,
				getHeadingTop,
				(options) => window.scrollTo(options),
			);

			if (hashId) {
				setActiveId(hashId);
				return;
			}

			syncActiveHeading();
		});

		return () => {
			observerRef.current?.disconnect();
			window.cancelAnimationFrame(frameId);
		};
	}, [headings, offset, syncActiveHeading]);

	useEffect(() => {
		let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

		const handleScroll = () => {
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}

			scrollTimeout = setTimeout(() => {
				syncActiveHeading();
			}, SCROLL_DEBOUNCE_MS);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
		};
	}, [syncActiveHeading]);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
			e.preventDefault();
			const elementTop = getHeadingTop(id);
			if (elementTop === null) {
				return;
			}

			window.scrollTo({
				top: getScrollTargetTop(elementTop, offset),
				behavior: "smooth",
			});

			setActiveId(id);
			window.history.pushState(null, "", `#${encodeURIComponent(id)}`);
		},
		[offset],
	);

	return { activeId, handleClick };
}
