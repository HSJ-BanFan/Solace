/**
 * 管理页面筛选按钮组件
 *
 * 提供统一的筛选按钮组，减少重复代码
 */

interface FilterButtonProps<T extends string> {
	options: readonly T[];
	labels: Record<T, string>;
	current: T;
	onChange: (value: T) => void;
}

/** 筛选按钮组组件 */
export function FilterButtons<T extends string>({
	options,
	labels,
	current,
	onChange,
}: FilterButtonProps<T>) {
	return (
		<div className="flex gap-2">
			{options.map((option) => (
				<button
					key={option}
					onClick={() => onChange(option)}
					className={`btn-regular btn-sm py-1 px-2.5 ${
						current === option
							? "border-[var(--primary)] bg-[var(--btn-regular-bg-active)]"
							: ""
					}`}
				>
					{labels[option]}
				</button>
			))}
		</div>
	);
}

/** 筛选按钮容器组件 */
export function FilterButtonsContainer({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`card-base p-4 fade-in-up flex items-center justify-between flex-wrap gap-4 ${className}`}>
			<div className="flex gap-4 flex-wrap">{children}</div>
		</div>
	);
}