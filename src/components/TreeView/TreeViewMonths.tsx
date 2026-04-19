import { getMonthName, IndividualFileArray } from "../../Constants";
import { StyledTreeItem } from "./StyledTreeItem";
import { TreeViewDays } from "./TreeViewDays";

export function TreeViewMonths(props: {
	files: IndividualFileArray | null;
	month_name: number;
	year: number;
	index: number;
}) {
	if (props.files) {
		props.files.sort((a, b) => a.file.localeCompare(b.file));
	}
	const safeFiles = props.files || [];
	let prevDay = 0;
	let file_names: IndividualFileArray = [];

	const days = safeFiles.map((el, index) => {
		const timestamp = parseInt(el.file.slice(0, 13));
		const date = new Date(timestamp);

		if (prevDay != date.getDate()) {
			file_names = [];
			file_names.push({
				file: el.file,
				comment: el.comment,
				channel_id: el.channel_id,
			});
			prevDay = date.getDate();
			return (
				<TreeViewDays
					index={index}
					day={date.getDate()}
					files={file_names}
					month_name={props.month_name}
					year={props.year}
					key={index}
				/>
			);
		} else {
			file_names.push({
				file: el.file,
				comment: el.comment,
				channel_id: el.channel_id,
			});
		}
	});

	return (
		<StyledTreeItem
			onContextMenu={() => console.log(`${props.month_name}`)}
			className="bg-blue-700"
			label={getMonthName(props.month_name)}
			itemId={`${props.year}-${props.month_name}`}
		>
			<div key={props.index} className="bg-green-500 overflow-hidden">
				{days}
			</div>
		</StyledTreeItem>
	);
}
