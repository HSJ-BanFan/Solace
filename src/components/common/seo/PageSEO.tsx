/**
 * 页面 SEO 组件
 *
 * 统一管理页面的 meta 标签、Open Graph、Canonical URL
 */
import { Helmet } from "react-helmet-async";
import { getSiteBaseUrl, getSiteName, getSiteDescription } from "@/config/runtime";

interface PageSEOProps {
	title: string;
	description?: string;
	path?: string;
	image?: string;
	type?: "website" | "article";
	noIndex?: boolean;
}

export function PageSEO({
	title,
	description,
	path = "",
	image,
	type = "website",
	noIndex = false,
}: PageSEOProps) {
	const siteName = getSiteName();
	const siteBaseUrl = getSiteBaseUrl();
	const defaultDescription = getSiteDescription();

	const fullTitle = title ? `${title} | ${siteName}` : siteName;
	const metaDescription = description || defaultDescription;
	const canonicalUrl = siteBaseUrl ? `${siteBaseUrl}${path}` : undefined;
	const ogImage = image || (siteBaseUrl ? `${siteBaseUrl}/og-image.png` : undefined);

	return (
		<Helmet>
			<title>{fullTitle}</title>
			{metaDescription && <meta name="description" content={metaDescription} />}
			{noIndex && <meta name="robots" content="noindex, nofollow" />}
			{canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

			{/* Open Graph */}
			<meta property="og:title" content={fullTitle} />
			{metaDescription && <meta property="og:description" content={metaDescription} />}
			<meta property="og:type" content={type} />
			{canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
			{ogImage && <meta property="og:image" content={ogImage} />}
			<meta property="og:site_name" content={siteName} />

			{/* Twitter Card */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			{metaDescription && <meta name="twitter:description" content={metaDescription} />}
			{ogImage && <meta name="twitter:image" content={ogImage} />}
		</Helmet>
	);
}