/**
 * 文章 SEO 组件
 *
 * 包含 meta 标签、Open Graph、Canonical URL、结构化数据
 */
import { Helmet } from "react-helmet-async";
import { getSiteBaseUrl, getSiteName } from "@/config/runtime";
import type { Article } from "@/types";

interface ArticleSEOProps {
	article: Article;
	path: string;
}

export function ArticleSEO({ article, path }: ArticleSEOProps) {
	const siteName = getSiteName();
	const siteBaseUrl = getSiteBaseUrl();
	const fullTitle = `${article.title} | ${siteName}`;
	const canonicalUrl = siteBaseUrl ? `${siteBaseUrl}${path}` : undefined;
	const ogImage = article.cover_image || (siteBaseUrl ? `${siteBaseUrl}/og-image.png` : undefined);

	const publishedDate = article.published_at || article.created_at;
	const modifiedDate = article.updated_at || publishedDate;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: article.title,
		description: article.summary || article.title,
		image: ogImage,
		datePublished: publishedDate,
		dateModified: modifiedDate,
		author: {
			"@type": "Person",
			name: siteName,
		},
		publisher: {
			"@type": "Organization",
			name: siteName,
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": canonicalUrl,
		},
	};

	return (
		<Helmet>
			<title>{fullTitle}</title>
			{article.summary && <meta name="description" content={article.summary} />}
			{canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

			{/* Open Graph */}
			<meta property="og:title" content={fullTitle} />
			{article.summary && <meta property="og:description" content={article.summary} />}
			<meta property="og:type" content="article" />
			{canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
			{ogImage && <meta property="og:image" content={ogImage} />}
			<meta property="og:site_name" content={siteName} />
			<meta property="article:published_time" content={publishedDate} />
			<meta property="article:modified_time" content={modifiedDate} />

			{/* 文章分类和标签 */}
			{article.category && (
				<meta property="article:section" content={article.category.name} />
			)}
			{article.tags?.map((tag) => (
				<meta key={tag.id} property="article:tag" content={tag.name} />
			))}

			{/* Twitter Card */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			{article.summary && <meta name="twitter:description" content={article.summary} />}
			{ogImage && <meta name="twitter:image" content={ogImage} />}

			{/* 结构化数据 */}
			<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
		</Helmet>
	);
}