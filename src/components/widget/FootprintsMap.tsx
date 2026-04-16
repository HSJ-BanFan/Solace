/**
 * 足迹地图组件 - Echarts 中国地图
 * 支持省份高亮 + 市级边界显示
 */

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import type { FootprintCity } from "@/types";
import { useThemeStore } from "@/stores/theme";

// 中国省份 GeoJSON（简化版，不含区级划分）
const chinaGeoJsonUrl =
	"https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json";

// 市级 GeoJSON URL 模板（详细版，用于显示市级边界）
const cityGeoJsonUrlTemplate =
	"https://geo.datav.aliyun.com/areas_v3/bound/{adcode}_full.json";

// 直辖市 adcode（这些没有市级层级，加载的是区级数据，应跳过）
const MUNICIPALITY_ADCODES = ["110000", "120000", "310000", "500000"];

interface FootprintsMapProps {
	cities: FootprintCity[];
}

function hueToHex(hue: number, isDark: boolean): string {
	const hueToColor: Record<number, string> = {
		0: isDark ? "#f87171" : "#ef4444",
		30: isDark ? "#fb923c" : "#f97316",
		60: isDark ? "#facc15" : "#eab308",
		120: isDark ? "#4ade80" : "#22c55e",
		180: isDark ? "#22d3ee" : "#06b6d4",
		210: isDark ? "#38bdf8" : "#0ea5e9",
		240: isDark ? "#818cf8" : "#6366f1",
		250: isDark ? "#60a5fa" : "#3b82f6",
		270: isDark ? "#a78bfa" : "#8b5cf6",
		300: isDark ? "#f472b6" : "#ec4899",
		330: isDark ? "#fb7185" : "#f43f5e",
	};
	const closest = Object.keys(hueToColor)
		.map(Number)
		.reduce((prev, curr) =>
			Math.abs(curr - hue) < Math.abs(prev - hue) ? curr : prev
		);
	return hueToColor[closest] ?? (isDark ? "#60a5fa" : "#3b82f6");
}

// 点是否在多边形内（射线法）
function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
	const [x, y] = point;
	let inside = false;

	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i]?.[0] ?? 0;
		const yi = polygon[i]?.[1] ?? 0;
		const xj = polygon[j]?.[0] ?? 0;
		const yj = polygon[j]?.[1] ?? 0;

		const intersect =
			((yi > y) !== (yj > y)) &&
			(x < (xj - xi) * (y - yi) / (yj - yi) + xi);

		if (intersect) inside = !inside;
	}

	return inside;
}

// 根据坐标查找省份信息和adcode
function findProvinceByCoords(
	geoJson: GeoJSON,
	lat: number,
	lng: number
): { name: string; adcode: string } | null {
	for (const feature of geoJson.features) {
		const geometry = feature.geometry;
		if (!geometry) continue;

		const coords = geometry.type === "Polygon"
			? geometry.coordinates as number[][][]
			: geometry.type === "MultiPolygon"
				? (geometry.coordinates as number[][][][]).flat(1)
				: [];

		for (const polygon of coords) {
			if (pointInPolygon([lng, lat], polygon)) {
				return {
					name: feature.properties?.name || "",
					adcode: String(feature.properties?.adcode || ""),
				};
			}
		}
	}

	return null;
}

interface GeoJSON {
	type: string;
	features: Array<{
		type: string;
		geometry: {
			type: string;
			coordinates: number[][][] | number[][][][];
		} | null;
		properties?: {
			name?: string;
			adcode?: string | number;
		};
		}>;
}

export function FootprintsMap({ cities }: FootprintsMapProps) {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<echarts.ECharts | null>(null);
	const geoJsonCache = useRef<{
		china: GeoJSON;
		merged: GeoJSON;
		provinceMap: Map<string, { name: string; adcode: string }>;
		cityRegionNames: Map<string, string>;
	} | null>(null);
	const [isReady, setIsReady] = useState(false);
	const { theme, hue } = useThemeStore();

	// 首次加载 GeoJSON 数据
	useEffect(() => {
		if (!chartRef.current) return;

		const loadGeoJson = async () => {
			let chinaGeoJson: GeoJSON;
			try {
				const response = await fetch(chinaGeoJsonUrl);
				chinaGeoJson = await response.json();
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			echarts.registerMap("china", chinaGeoJson as any);
			} catch (e) {
				console.error("加载中国地图数据失败", e);
				return;
			}

			const citiesWithCoords = cities.filter((c) => c.coords);
			const provinceMap = new Map<string, { name: string; adcode: string }>();
			const cityRegionNames = new Map<string, string>();

			for (const city of citiesWithCoords) {
				const province = findProvinceByCoords(
					chinaGeoJson,
					city.coords!.lat,
					city.coords!.lng
				);
				if (province && province.adcode) {
					provinceMap.set(province.adcode, province);
				}
			}

			const mergedFeatures = [...chinaGeoJson.features];
			for (const [adcode, province] of provinceMap) {
				// 直辖市跳过市级数据加载（区级数据不应显示）
				if (MUNICIPALITY_ADCODES.includes(adcode)) {
					// 直辖市的城市区域名称直接设置为直辖市本身
					for (const city of citiesWithCoords) {
						const foundProvince = findProvinceByCoords(
							chinaGeoJson,
							city.coords!.lat,
							city.coords!.lng
						);
						if (foundProvince && foundProvince.adcode === adcode) {
							cityRegionNames.set(city.name, province.name);
						}
					}
					continue;
				}

				try {
					const response = await fetch(cityGeoJsonUrlTemplate.replace("{adcode}", adcode));
					const cityGeoJson: GeoJSON = await response.json();
					mergedFeatures.push(...cityGeoJson.features);

					for (const city of citiesWithCoords) {
						const province = findProvinceByCoords(
							chinaGeoJson,
							city.coords!.lat,
							city.coords!.lng
						);
						if (province && province.adcode === adcode) {
							for (const feature of cityGeoJson.features) {
								const geometry = feature.geometry;
								if (!geometry) continue;

								const coords = geometry.type === "Polygon"
									? geometry.coordinates as number[][][]
									: geometry.type === "MultiPolygon"
										? (geometry.coordinates as number[][][][]).flat(1)
										: [];

								for (const polygon of coords) {
									if (pointInPolygon([city.coords!.lng, city.coords!.lat], polygon)) {
										cityRegionNames.set(city.name, feature.properties?.name || "");
										break;
									}
								}
							}
						}
					}
				} catch (e) {
					console.warn(`加载省份 ${adcode} 市级数据失败`, e);
				}
			}

			const mergedGeoJson: GeoJSON = {
				type: "FeatureCollection",
				features: mergedFeatures,
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			echarts.registerMap("china_merged", mergedGeoJson as any);

			geoJsonCache.current = {
				china: chinaGeoJson,
				merged: mergedGeoJson,
				provinceMap,
				cityRegionNames,
			};

			chartInstance.current = echarts.init(chartRef.current);
			setIsReady(true);
		};

		loadGeoJson();

		const handleResize = () => chartInstance.current?.resize();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			chartInstance.current?.dispose();
			geoJsonCache.current = null;
			setIsReady(false);
		};
	}, [cities]);

	// 主题变化时更新图表样式
	useEffect(() => {
		if (!isReady || !chartInstance.current || !geoJsonCache.current) return;

		const { provinceMap, cityRegionNames } = geoJsonCache.current;
		const citiesWithCoords = cities.filter((c) => c.coords);
		const isDark = theme === "dark";
		const primaryColor = hueToHex(hue, isDark);

		const scatterData = citiesWithCoords.map((city) => ({
			name: city.name,
			value: [city.coords!.lng, city.coords!.lat] as [number, number],
		}));

		// 计算点亮城市的中心坐标
		const centerLng = scatterData.reduce((sum, d) => sum + d.value[0], 0) / scatterData.length;
		const centerLat = scatterData.reduce((sum, d) => sum + d.value[1], 0) / scatterData.length;

		const regions: Array<{
			name: string;
			itemStyle?: { areaColor?: string };
			label?: { show?: boolean };
			emphasis?: {
				itemStyle?: { areaColor?: string };
				label?: { show?: boolean; fontFamily?: string; fontSize?: number };
			};
		}> = [];
		for (const province of provinceMap.values()) {
			regions.push({
				name: province.name,
				itemStyle: { areaColor: primaryColor + "30" },
				emphasis: { itemStyle: { areaColor: primaryColor + "50" } },
			});
		}
		for (const [, regionName] of cityRegionNames) {
			regions.push({
				name: regionName,
				itemStyle: { areaColor: primaryColor + "60" },
				label: { show: false },
				emphasis: {
					itemStyle: { areaColor: primaryColor + "80" },
					label: { show: true, fontFamily: "MaokenZhuyuanTi", fontSize: 12 },
				},
			});
		}

		const tooltipFormatter = (params: unknown) => {
			const p = params as { name?: string; value?: number[] | string };
			if (Array.isArray(p.value)) {
				const city = citiesWithCoords.find(
					(c) => c.coords!.lng === p.value![0] && c.coords!.lat === p.value![1]
				);
				if (city) {
					return `<div style="padding:4px;font-family:MaokenZhuyuanTi,sans-serif;">
						<strong>${city.name}</strong><br/>
						${city.visited_at || ""}
						${city.highlights ? `<br/><span style="color:#999">${city.highlights.join(", ")}</span>` : ""}
					</div>`;
				}
			}
			if (p.name) {
				const cityEntry = Array.from(cityRegionNames.entries()).find(
					([, regionName]) => regionName === p.name
				);
				if (cityEntry) {
					const cityName = cityEntry[0];
					const city = citiesWithCoords.find((c) => c.name === cityName);
					if (city) {
						return `<div style="padding:4px;font-family:MaokenZhuyuanTi,sans-serif;">
							<strong>${cityName}</strong><br/>
							${city.visited_at || ""}
							${city.highlights ? `<br/><span style="color:#999">${city.highlights.join(", ")}</span>` : ""}
						</div>`;
					}
				}
				return `<span style="font-family:MaokenZhuyuanTi,sans-serif;">${p.name}</span>`;
			}
			return "";
		};

		const option: echarts.EChartsOption = {
			backgroundColor: "transparent",
			tooltip: {
				trigger: "item",
				formatter: tooltipFormatter,
				extraCssText: "font-family: MaokenZhuyuanTi, sans-serif !important;",
			},
			geo: {
				tooltip: {
					show: true,
					formatter: tooltipFormatter,
					extraCssText: "font-family: MaokenZhuyuanTi, sans-serif !important;",
				},
				map: "china_merged",
				roam: true,
				zoom:10,
				center: scatterData.length > 0 ? [centerLng, centerLat] : [105, 36],
				regions,
				itemStyle: {
					areaColor: isDark ? "#1e293b" : "#f1f5f9",
					borderColor: isDark ? "#334155" : "#cbd5e1",
					borderWidth: 1,
				},
				emphasis: {
					itemStyle: { areaColor: isDark ? "#334155" : "#e2e8f0" },
					label: { show: true, fontFamily: "MaokenZhuyuanTi", fontSize: 12 },
				},
				label: {
					show: false,
					fontFamily: "MaokenZhuyuanTi",
					fontSize: 10,
					color: isDark ? "#94a3b8" : "#64748b",
				},
			},
			series: [
				{
					type: "scatter",
					coordinateSystem: "geo",
					data: scatterData,
					symbolSize: 6,
					itemStyle: {
						color: primaryColor,
						shadowBlur: 4,
						shadowColor: primaryColor + "80",
					},
					emphasis: {
						itemStyle: {
							color: primaryColor,
							shadowBlur: 8,
							shadowColor: primaryColor,
						},
					},
				},
				{
					type: "effectScatter",
					coordinateSystem: "geo",
					data: scatterData.slice(0, 3),
					symbolSize: 5,
					showEffectOn: "render",
					rippleEffect: {
						brushType: "stroke",
						scale: 4,
						period: 4,
					},
					itemStyle: {
						color: primaryColor,
						shadowBlur: 4,
						shadowColor: primaryColor,
					},
				},
			],
		};

		chartInstance.current.setOption(option, { notMerge: true });
	}, [isReady, theme, hue, cities]);

	return (
		<div
			ref={chartRef}
			className="h-[400px] md:h-[500px] w-full rounded-xl overflow-hidden"
		/>
	);
}