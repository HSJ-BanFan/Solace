export function decodeHtmlEntities(value?: string): string {
	if (!value) return "";
	if (typeof document === "undefined") return value;

	const textarea = document.createElement("textarea");
	textarea.innerHTML = value;
	return textarea.value;
}
