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
	const itemsEl = props.files.map((el, index) => (
		<ItemsEl
			file={el}
			month_name={props.month_name}
			year={props.year}
			key={index}
		/>
	));

	return (
		<StyledTreeItem
			onContextMenu={() => console.log("days")}
			className="bg-pink-700"
			label={props.day}
			itemId={`${props.year}-${props.month_name}-${props.day}`}
		>
			<div key={props.index} className="bg-green-500 overflow-hidden">
				{itemsEl}
			</div>
		</StyledTreeItem>
	);
}
