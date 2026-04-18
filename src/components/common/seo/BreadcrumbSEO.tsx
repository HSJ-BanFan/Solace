/**
 * 面包屑结构化数据组件
 *
 * 生成 BreadcrumbList Schema
 */
import { Helmet } from "react-helmet-async";
import { getSiteBaseUrl, getSiteName } from "@/config/runtime";

interface BreadcrumbItem {
	name: string;
	path: string;
}

interface BreadcrumbSEOProps {
	items: BreadcrumbItem[];
}

export function BreadcrumbSEO({ items }: BreadcrumbSEOProps) {
	const siteBaseUrl = getSiteBaseUrl();
	const siteName = getSiteName();

	const breadcrumbItems = [
		{
			name: siteName,
			path: "/",
		},
		...items,
	];

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbItems.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: siteBaseUrl ? `${siteBaseUrl}${item.path}` : undefined,
		})),
	};

	return (
		<Helmet>
			<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
		</Helmet>
	);
}