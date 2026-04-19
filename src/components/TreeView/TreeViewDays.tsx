import type { IndividualFileArray } from "../../Constants";
import { ItemsEl } from "./ItemsEl";
import { StyledTreeItem } from "./StyledTreeItem";

export function TreeViewDays(props: {
	index: number;
	day: number;
	files: IndividualFileArray;
	year: number;
	month_name: number;
}) {
	const itemsEl = props.files.map((el) => (
		<ItemsEl
			file={el}
			month_name={props.month_name}
			year={props.year}
			key={el.file}
		/>
	));

	return (
		<StyledTreeItem
			onContextMenu={() => console.log("days")}
			className="bg-pink-700"
			label={props.day}
			itemId={`${props.year}-${props.month_name}-${props.day}`}
		>
			<div
				key={`${props.year}-${props.month_name}-${props.day}`}
				className="bg-violet-700 overflow-hidden rounded"
			>
				{itemsEl}
			</div>
		</StyledTreeItem>
	);
}
