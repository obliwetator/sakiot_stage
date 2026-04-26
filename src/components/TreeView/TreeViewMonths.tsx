import { getMonthName, type IndividualFileArray } from "../../Constants";
import { LiveDot } from "./LiveDot";
import { StyledTreeItem } from "./StyledTreeItem";
import { TreeViewDays } from "./TreeViewDays";

export function TreeViewMonths(props: {
	files: IndividualFileArray | null;
	month_name: number;
	year: number;
	index: number;
	liveSet: Set<string>;
}) {
	if (props.files) {
		props.files.sort((a, b) => a.file.localeCompare(b.file));
	}
	const safeFiles = props.files || [];
	const hasLive = safeFiles.some((f) => props.liveSet.has(f.file.slice(0, -4)));
	let prevDay = 0;
	let file_names: IndividualFileArray = [];

	const days = safeFiles.map((el, index) => {
		const timestamp = parseInt(el.file.slice(0, 13), 10);
		const date = new Date(timestamp);

		if (prevDay !== date.getDate()) {
			file_names = [];
			file_names.push({ ...el });
			prevDay = date.getDate();
			return (
				<TreeViewDays
					index={index}
					day={date.getDate()}
					files={file_names}
					month_name={props.month_name}
					year={props.year}
					liveSet={props.liveSet}
					key={el.file}
				/>
			);
		}

		file_names.push({ ...el });
		return null;
	});

	return (
		<StyledTreeItem
			onContextMenu={() => console.log(`${props.month_name}`)}
			className="bg-blue-700"
			label={
				<span className="inline-flex items-center">
					{getMonthName(props.month_name)}
					{hasLive && <LiveDot />}
				</span>
			}
			itemId={`${props.year}-${props.month_name}`}
		>
			<div
				key={`${props.year}-${props.month_name}`}
				className="bg-green-500 overflow-hidden"
			>
				{days}
			</div>
		</StyledTreeItem>
	);
}
