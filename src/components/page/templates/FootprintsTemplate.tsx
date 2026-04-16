/**
 * 我的足迹模板
 *
 * 用于 template 类型为 "footprints" 的页面
 */

import { MarkdownRenderer, SafeIcon } from "@/components";
import { FootprintCard } from "@/components/widget/FootprintCard";
import type { FootprintsFrontmatter, FootprintCity } from "@/types";

interface FootprintsTemplateProps {
	frontmatter: FootprintsFrontmatter;
	markdown: string;
}

export function FootprintsTemplate({
	frontmatter,
	markdown,
}: FootprintsTemplateProps) {
	const cities = frontmatter.cities || [];

	// 过滤无效数据
	const validCities = cities.filter((c) => c && c.country && c.name);

	// 统计国家和城市数量
	const countries = [...new Set(validCities.map((c) => c.country))];

	// 按国家分组
	const citiesByCountry: Record<string, FootprintCity[]> = {};
	for (const city of validCities) {
		const country = city.country;
		if (!citiesByCountry[country]) {
			citiesByCountry[country] = [];
		}
		citiesByCountry[country].push(city);
	}

	return (
		<div className="space-y-6 fade-in-up">
			{/* 统计卡片 */}
			<div className="card-base p-6 text-center">
				<h1 className="text-90 text-2xl font-bold mb-2">我的足迹</h1>
				<p className="text-50">
					已探索{" "}
					<span className="text-[var(--primary)] font-bold">
						{validCities.length}
					</span>{" "}
					个城市，踏足{" "}
					<span className="text-[var(--primary)] font-bold">
						{countries.length}
					</span>{" "}
					个国家/地区
				</p>
			</div>

			{/* Markdown 简介 */}
			{markdown && (
				<div className="card-base p-6 md:p-8">
					<MarkdownRenderer content={markdown} />
				</div>
			)}

			{/* 按国家分组显示 */}
			{countries.map((country) => {
				const countryCities = citiesByCountry[country] || [];
				return (
					<div key={country} className="card-base p-6 md:p-8">
						<h2 className="text-90 text-xl font-bold mb-4 flex items-center gap-2">
							<SafeIcon icon="material-symbols:flag-outline-rounded" />
							{country}
							<span className="text-50 text-sm">
								({countryCities.length})
							</span>
						</h2>
						<div className="space-y-3">
							{countryCities.map((city, idx) => (
								<FootprintCard key={`${country}-${city.name}-${idx}`} city={city} />
							))}
						</div>
					</div>
				);
			})}

			{/* 无足迹时显示 */}
			{validCities.length === 0 && !markdown && (
				<div className="card-base p-6 md:p-8 text-center text-50">
					暂无足迹记录
				</div>
			)}
		</div>
	);
}