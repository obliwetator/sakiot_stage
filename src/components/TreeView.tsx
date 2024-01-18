import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import Collapse from '@mui/material/Collapse';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { alpha, styled } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import { animated, useSpring } from '@react-spring/web';
import * as React from 'react';
import { useState } from 'react';
import {
	NavigateFunction,
	Params,
	Location as ReactLocation,
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom';

import {
	Channels,
	Dirs,
	IndividualFile,
	IndividualFileArray,
	PATH_PREFIX_FOR_LOGGED_USERS,
	UserGuilds,
	months,
} from '../Constants';
import { transform_to_months } from '../data';

function MinusSquare(props: SvgIconProps) {
	return (
		<SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
			{/* tslint:disable-next-line: max-line-length */}
			<path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
		</SvgIcon>
	);
}

function PlusSquare(props: SvgIconProps) {
	return (
		<SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
			{/* tslint:disable-next-line: max-line-length */}
			<path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
		</SvgIcon>
	);
}

function CloseSquare(props: SvgIconProps) {
	return (
		<SvgIcon className="close" fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
			{/* tslint:disable-next-line: max-line-length */}
			<path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
		</SvgIcon>
	);
}

function TransitionComponent(props: TransitionProps) {
	const style = useSpring({
		from: {
			opacity: 0,
			transform: 'translate3d(20px,0,0)',
		},
		to: {
			opacity: props.in ? 1 : 0,
			transform: `translate3d(${props.in ? 0 : 2}px,0,0)`,
		},
	});

	return (
		<animated.div style={style}>
			<Collapse {...props} />
		</animated.div>
	);
}

const StyledTreeItem = styled((props: TreeItemProps) => (
	<TreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
	[`& .${treeItemClasses.iconContainer}`]: {
		'& .close': {
			opacity: 0.3,
		},
	},
	[`& .${treeItemClasses.group}`]: {
		marginLeft: 5,
		paddingLeft: 8,
		borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
	},
}));

export default function CustomizedTreeView(props: { guildSelected: UserGuilds | null }) {
	const [data, setData] = useState<Dirs[] | null>(null);
	const params = useParams();

	React.useEffect(() => {
		fetch(`https://dev.patrykstyla.com/api/current/${params.guild_id}`, {
			method: 'GET',
			credentials: 'include',
		}).then((response) => {
			if (!response.ok) {
				console.log('cannot get guild_iddirectory data');
			} else {
				console.log('got directory data');
				response.json().then((result: Channels[]) => {
					const res = transform_to_months(result);
					// let { newData, newFavorites } = addCommentsToData(res);
					// TODO: change to function data
					setData(res);
					// setFavorites(newFavorites);
				});
			}
		});
	}, [props.guildSelected]);
	if (data) {
		const years = data.map((el, index) => {
			return <TreeViewYears el={el} index={index} key={index} />;
		});
		const month = new Date().toLocaleString('default', { month: 'long' });

		console.log(years)
		return (
			<TreeView
				aria-label="customized"
				defaultExpanded={['2024', month]}
				defaultCollapseIcon={<MinusSquare />}
				defaultExpandIcon={<PlusSquare />}
				defaultEndIcon={<CloseSquare />}
				className="flex-initial w-1/5 p-5"
			>
				{years}
			</TreeView>
		);
	} else {
		return <div className="flex-initial w-1/5 p-5">Loading</div>;
	}
}

function TreeViewYears(props: { el: Dirs; index: number }) {
	const months_obj = Object.keys(props.el.months);
	// Sort the months. true = reverse order
	const safe_months = sortByMonthName(months_obj, true);
	const result = safe_months.map((month_name, index) => {
		const month = month_name as months;
		const files = props.el.months[month]!;

		return <TreeViewMonths files={files} index={index} month_name={month} year={props.el.year} key={index} />;
	});

	return (
		<StyledTreeItem
			className="bg-green-500 overflow-hidden"
			label={props.el.year}
			nodeId={`${props.el.year}`}
		// className={
		// 	'accordion ' +
		// 	(props.active ? 'bg-green-800' : 'bg-green-500') +
		// 	' hover:bg-green-700 active:bg-red-800'
		// }
		// onClick={(_) => {
		// 	props.onToggle(props.index);
		// }}
		// onContextMenu={(e) => {
		// 	handleContextMenu(e, props.setContextMenu);
		// 	props.setMenuItems([
		// 		{
		// 			name: 'test 1',
		// 			cb: () => {
		// 				console.log('test 1');
		// 			},
		// 		},
		// 		{
		// 			name: 'test 2',
		// 			cb: () => {
		// 				console.log('test 2');
		// 			},
		// 		},
		// 	]);
		// 	console.log('Years');
		// }}
		>
			<div>{result}</div>
		</StyledTreeItem>
	);
}

function TreeViewMonths(props: { files: IndividualFileArray; month_name: months; year: number; index: number }) {
	// sort the array
	props.files.sort((a, b) => a.file.localeCompare(b.file));
	// keep the day index
	let prevDay = 0;

	let file_names: IndividualFileArray = [];
	const days = props.files.map((el, index) => {
		// get the timestamp from the file
		const timestamp = parseInt(el.file.slice(0, 13));
		const date = new Date(timestamp);

		// Return a different day el
		if (prevDay != date.getDate()) {
			file_names = [];
			file_names.push({ file: el.file, comment: el.comment, channel_id: el.channel_id });

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
			file_names.push({ file: el.file, comment: el.comment, channel_id: el.channel_id });

			// reset the files for that day
			// file_names = [];
		}
	});

	return (
		<StyledTreeItem
			// onClick={() => props.onToggle(props.index)}
			onContextMenu={() => {
				console.log(`${props.month_name}`);
			}}
			className="bg-blue-700"
			label={props.month_name}
			nodeId={`${props.month_name}`}
		>
			<div key={props.index} className="bg-green-500 overflow-hidden">
				{days}
			</div>
		</StyledTreeItem>
	);
}

function TreeViewDays(props: {
	index: number;
	day: number;
	files: IndividualFileArray;
	year: number;
	month_name: string;
}) {
	const itemsEl = props.files.map((el, index) => {
		return <ItemsEl file={el} month_name={props.month_name} year={props.year} key={index} />;
	});
	return (
		<>
			<StyledTreeItem
				// onClick={() => props.onToggle(props.index)}
				onContextMenu={() => {
					console.log('days');
				}}
				className="bg-pink-700"
				label={props.day}
				nodeId={`${props.month_name + props.day}`}
			>
				<div
					key={props.index}
					className="bg-green-500 overflow-hidden"
				// ref={contentEl}
				// style={props.active ? { display: 'block' } : { display: 'none' }}
				>
					{itemsEl}
				</div>
			</StyledTreeItem>
		</>
	);
}

export function ItemsEl(props: { file: IndividualFile; year: number; month_name: string }) {
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams();

	// TODO: DB
	const handleFavorite = () => {
		console.log('FIXME');
		// // Don't allow the click to click elements below it
		// e.stopPropagation();
		// // props.setContextMenu(null);
		// props.setFormOpen(true);
		// if (props.file.comment) {
		// 	// is in fav remove it
		// 	let transaction = DBcontext.transaction('ids', 'readwrite');
		// 	let ids = transaction.objectStore('ids'); // (2)
		// 	let request = ids.delete(props.file.file);
		// 	request.onsuccess = function () {
		// 		// (4)
		// 		console.log('Book deleted to the store', request.result);
		// 		props.favorites.setFavorites((prev) => prev!.filter((item) => item.file !== props.file.file));
		// 	};
		// 	request.onerror = function () {
		// 		console.log('Error', request.error);
		// 	};
		// } else {
		// 	let transaction = DBcontext.transaction('ids', 'readwrite');
		// 	let ids = transaction.objectStore('ids'); // (2)
		// 	let request = ids.put('', props.file.file);
		// 	request.onsuccess = function () {
		// 		// (4)
		// 		props.favorites.setFavorites((prev) => [
		// 			...prev!,
		// 			{ comment: props.file.comment, file: props.file.file },
		// 		]);
		// 	};
		// 	request.onerror = function () {
		// 		console.log('Error', request.error);
		// 	};
		// }
	};

	return (
		// <Tooltip title={props.file.comment ? props.file.comment : ''}>
		<div
			className={`${props.file.comment !== null ? 'bg-orange-600' : 'bg-violet-600'} `}
			onClick={(e) =>
				handleClickOnFile(e, navigate, location, props.year, props.month_name, props.file.channel_id!, params)
			}
			style={{ cursor: 'context-menu' }}
		// onContextMenu={(e) => {
		// 	handleContextMenu(e, props.setContextMenu, props.file.file);
		// 	props.file.comment !== null
		// 		? props.setMenuItems([
		// 				{
		// 					name: 'Remove From Favorite',
		// 					cb: () => {
		// 						handleFavorite(e);
		// 					},
		// 				},
		// 		  ])
		// 		: props.setMenuItems([
		// 				{
		// 					name: 'Add To Favorite',
		// 					cb: () => {
		// 						handleFavorite(e);
		// 					},
		// 				},
		// 		  ]);
		// }}
		>
			{props.file.file}
		</div>
		// </Tooltip>
	);
}

function handleClickOnFile(
	e: React.MouseEvent<HTMLDivElement, MouseEvent>,
	navigate: NavigateFunction,
	location: ReactLocation,
	year: number,
	month_name: string,
	channel_id: string,
	params: Readonly<Params<string>>
) {
	e.preventDefault();
	if (
		location.pathname ===
		`${PATH_PREFIX_FOR_LOGGED_USERS}/audio/${params.guild_id
		}/${channel_id}/${year}/${month_name}${e.currentTarget.innerHTML.slice(0, -4)}`
	) {
		// same location dont do anything
	} else {
		navigate(
			`${PATH_PREFIX_FOR_LOGGED_USERS}/audio/${params.guild_id
			}/${channel_id}/${year}/${month_name}/${e.currentTarget.innerHTML.slice(0, -4)}`
		);
	}
}

function sortByMonthName(monthNames: string[], isReverse = false) {
	const referenceMonthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
	const directionFactor = isReverse ? -1 : 1;
	const comparator = (a: string, b: string) => {
		if (!a && !b) return 0;
		if (!a && b) return -1 * directionFactor;
		if (a && !b) return 1 * directionFactor;

		const comparableA = a.toLowerCase().substring(0, 3);
		const comparableB = b.toLowerCase().substring(0, 3);
		const comparisonResult = referenceMonthNames.indexOf(comparableA) - referenceMonthNames.indexOf(comparableB);
		return comparisonResult * directionFactor;
	};
	const safeCopyMonthNames = [...monthNames];
	safeCopyMonthNames.sort(comparator);
	return safeCopyMonthNames;
}
