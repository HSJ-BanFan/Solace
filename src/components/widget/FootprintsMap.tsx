/**
 * 足迹地图组件 - Echarts 中国地图
 */

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { FootprintCity } from "@/types";

// 中国地图 GeoJSON
const chinaGeoJsonUrl =
	"https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json";

interface FootprintsMapProps {
	cities: FootprintCity[];
}

// 获取 CSS 变量值
function getCssVar(name: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// 解析主题色
function parseThemeColor(): string {
	const defaultColor = "#3b82f6";
	try {
		const primary = getCssVar("--primary");
		if (primary.startsWith("oklch")) {
			const match = primary.match(/oklch\(([\d.]+)\s+([\d.]+)/);
			if (match) {
				const l = parseFloat(match[1]);
				if (l > 0.7) return "#60a5fa";
				if (l > 0.6) return "#3b82f6";
				return "#2563eb";
			}
		}
		return defaultColor;
	} catch {
		return defaultColor;
	}
}

// 点是否在多边形内（射线法）
function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
	const [x, y] = point;
	let inside = false;

	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const [xi, yi] = polygon[i];
		const [xj, yj] = polygon[j];

		const intersect =
			((yi > y) !== (yj > y)) &&
			(x < (xj - xi) * (y - yi) / (yj - yi) + xi);

		if (intersect) inside = !inside;
	}

	return inside;
}

// 根据坐标查找省份名称
function findProvinceByCoords(
	geoJson: GeoJSON.FeatureCollection,
	lat: number,
	lng: number
): string | null {
	for (const feature of geoJson.features) {
		const geometry = feature.geometry;
		if (!geometry) continue;

		const coords: number[][][] = geometry.type === "Polygon"
			? geometry.coordinates
			: geometry.type === "MultiPolygon"
				? geometry.coordinates.flat(1) as number[][]
				: [];

		// 检查点是否在任一多边形内
		for (const polygon of coords) {
			if (pointInPolygon([lng, lat], polygon)) {
				return feature.properties?.name || null;
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
		};
	}>;
}

export function FootprintsMap({ cities }: FootprintsMapProps) {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<echarts.ECharts | null>(null);

	useEffect(() => {
		if (!chartRef.current) return;

		const initChart = async () => {
			// 加载中国地图数据
			let geoJson: GeoJSON;
			try {
				const response = await fetch(chinaGeoJsonUrl);
				geoJson = await response.json();
				echarts.registerMap("china", geoJson as object);
			} catch {
				console.error("加载中国地图数据失败");
				return;
			}

			// 初始化图表
			chartInstance.current = echarts.init(chartRef.current);

			// 过滤有坐标的城市
			const citiesWithCoords = cities.filter((c) => c.coords);

			// 获取主题色
			const primaryColor = parseThemeColor();

			// 查找所有访问过的省份
			const visitedProvinces = new Set<string>();
			for (const city of citiesWithCoords) {
				const province = findProvinceByCoords(
					geoJson,
					city.coords!.lat,
					city.coords!.lng
				);
				if (province) {
					visitedProvinces.add(province);
				}
			}

			// 构建散点数据
			const scatterData = citiesWithCoords.map((city) => ({
				name: city.name,
				value: [city.coords!.lng, city.coords!.lat],
			}));

			// 判断是否为深色模式
			const isDark = document.documentElement.classList.contains("dark");

			// 构建省份高亮配置
			const regions = Array.from(visitedProvinces).map((name) => ({
				name,
				itemStyle: {
					areaColor: primaryColor + "40", // 主题色 25% 透明度
				},
				emphasis: {
					itemStyle: {
						areaColor: primaryColor + "60",
					},
				},
			}));

			// 图表配置
			const option: echarts.EChartsOption = {
				backgroundColor: "transparent",
				tooltip: {
					trigger: "item",
					formatter: (params: unknown) => {
						const p = params as { name?: string; value?: number[] };
						if (p.value) {
							const city = citiesWithCoords.find(
								(c) => c.coords!.lng === p.value![0] && c.coords!.lat === p.value![1]
							);
							if (city) {
								return `<div style="padding:4px;">
									<strong>${city.name}</strong><br/>
									${city.visited_at || ""}
									${city.highlights ? `<br/><span style="color:#999">${city.highlights.join(", ")}</span>` : ""}
								</div>`;
							}
						}
						return p.name || "";
					},
				},
				geo: {
					map: "china",
					roam: true,
					zoom: 2,
					center: [105, 36],
					regions,
					itemStyle: {
						areaColor: isDark ? "#1e293b" : "#f1f5f9",
						borderColor: isDark ? "#334155" : "#cbd5e1",
						borderWidth: 1,
					},
					emphasis: {
						itemStyle: {
							areaColor: isDark ? "#334155" : "#e2e8f0",
						},
					},
					label: {
						show: false,
					},
				},
				series: [
					{
						type: "scatter",
						coordinateSystem: "geo",
						data: scatterData,
						symbolSize: 14,
						itemStyle: {
							color: primaryColor,
							shadowBlur: 6,
							shadowColor: primaryColor + "80",
						},
						emphasis: {
							itemStyle: {
								color: primaryColor,
								shadowBlur: 12,
								shadowColor: primaryColor,
							},
						},
					},
					{
						type: "effectScatter",
						coordinateSystem: "geo",
						data: scatterData.slice(0, 3),
						symbolSize: 6,
						showEffectOn: "render",
						rippleEffect: {
							brushType: "stroke",
							scale: 4,
							period: 4,
						},
						itemStyle: {
							color: primaryColor,
							shadowBlur: 6,
							shadowColor: primaryColor,
						},
					},
				],
			};

			chartInstance.current.setOption(option);
		};

		initChart();

		// 窗口大小变化时重新调整
		const handleResize = () => {
			chartInstance.current?.resize();
		};
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			chartInstance.current?.dispose();
		};
	}, [cities]);

	return (
		<div
			ref={chartRef}
			className="h-[400px] md:h-[500px] w-full rounded-xl overflow-hidden"
		/>
	);
}