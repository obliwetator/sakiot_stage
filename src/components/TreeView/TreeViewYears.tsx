import type { Dirs, months } from "../../Constants";
import { StyledTreeItem } from "./StyledTreeItem";
import { TreeViewMonths } from "./TreeViewMonths";

export function TreeViewYears(props: { el: Dirs; index: number }) {
	const months_obj = Object.keys(props.el.months);
	const safe_months = months_obj.map(Number).sort((a, b) => b - a);

	const result = safe_months.map((month_name, index) => {
		const month = month_name as months;
		const files = props.el.months[month] ?? [];
		return (
			<TreeViewMonths
				files={files}
				index={index}
				month_name={month}
				year={props.el.year}
				key={index}
			/>
		);
	});

	return (
		<StyledTreeItem
			className="bg-green-500 overflow-hidden"
			label={props.el.year}
			itemId={`${props.el.year}`}
		>
			<div>{result}</div>
		</StyledTreeItem>
	);
}
