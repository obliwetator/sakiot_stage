import { Tooltip } from '@mui/material';
import { Fragment, useContext, useEffect, useRef, useState } from 'react';
import {
	NavigateFunction,
	Params,
	useLocation,
	useNavigate,
	useParams,
	Location as ReactLocation,
} from 'react-router-dom';
import {
	Channels,
	Dirs,
	Favorites,
	IndividualFile,
	IndividualFileArray,
	months,
	PATH_PREFIX_FOR_LOGGED_USERS,
	UserGuilds,
} from '../App';
import { transform_to_months } from '../data';

// TODO: DB
function addCommentsToData(data: Dirs[]) {
	// let transaction = db.transaction('ids', 'readonly');
	// let ids = transaction.objectStore('ids');
	// const favorites: IndividualFileArray = [];
	// data.forEach((el, index) => {
	// 	let months_obj = Object.keys(el.months);
	// 	months_obj.forEach((month_name, index1) => {
	// 		let month = month_name as months;
	// 		el.months[month]!.forEach((dirs, dirs_index) => {
	// 			let request = ids.get(dirs.file);
	// 			request.onsuccess = function () {
	// 				if (request.result !== undefined) {
	// 					dirs.comment = request.result;
	// 					favorites.push({ comment: request.result, file: dirs.file });
	// 				}
	// 			};
	// 			request.onerror = function () {
	// 				console.log('Error', request.error);
	// 			};
	// 		});
	// 	});
	// });
	// return { newData: data, newFavorites: favorites };
}

export function AllYears(props: {
	setContextMenu: React.Dispatch<
		React.SetStateAction<{
			mouseX: number;
			mouseY: number;
			file: string | null;
		} | null>
	>;
	setMenuItems: React.Dispatch<
		React.SetStateAction<
			| {
					name: string;
					cb: () => void;
			  }[]
			| null
		>
	>;
	setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
	guildSelected: UserGuilds | null;
}) {
	// get directory data
	const [data, setData] = useState<Dirs[] | null>(null);
	const [favorites, setFavorites] = useState<IndividualFileArray | null>(null);
	const params = useParams();

	useEffect(() => {
		fetch(`https://dev.patrykstyla.com/current/${params.guild_id}`, {
			method: 'GET',
			credentials: 'include',
		}).then((response) => {
			if (!response.ok) {
				console.log('cannot get guild_iddirectory data');
			} else {
				console.log('got directory data');
				response.json().then((result: Dirs[]) => {
					let res = transform_to_months(result as any as Channels[]);
					// let { newData, newFavorites } = addCommentsToData(res);
					// TODO: change to function data
					setData(res);
					// setFavorites(newFavorites);
				});
			}
		});
	}, [props.guildSelected]);
	const [clicked, setClicked] = useState(-1);

	// state to keep one accordion open
	const handleToggle = (index: number) => {
		// We start indexing from 0 so no selection is anyhting lower or higher that our current index
		if (clicked === index) {
			return setClicked(-1);
		}
		setClicked(index);
	};

	if (data) {
		const years = data.map((el, index) => {
			return (
				<YearsEl
					key={index}
					el={el}
					index={index}
					onToggle={() => handleToggle(index)}
					active={clicked === index}
					setContextMenu={props.setContextMenu}
					setMenuItems={props.setMenuItems}
					setFormOpen={props.setFormOpen}
					favorites={{ favorites: favorites, setFavorites: setFavorites }}
				/>
			);
		});
		return (
			<div className="flex-initial w-1/5 p-5">
				{years}
				<Favorites
					key={2}
					active={clicked === 2}
					index={2}
					favorites={{ favorites: favorites, setFavorites: setFavorites }}
					onToggle={() => handleToggle(2)}
					setContextMenu={props.setContextMenu}
					setMenuItems={props.setMenuItems}
					setFormOpen={props.setFormOpen}
				/>
			</div>
		);
	} else {
		return <div>Loading</div>;
	}
}

// a year will return up to 12 months
export function YearsEl(props: {
	el: Dirs;
	index: number;
	onToggle: (index: number) => void;
	active: boolean;
	setContextMenu: React.Dispatch<
		React.SetStateAction<{
			mouseX: number;
			mouseY: number;
			file: string | null;
		} | null>
	>;
	setMenuItems: React.Dispatch<
		React.SetStateAction<
			| {
					name: string;
					cb: () => void;
			  }[]
			| null
		>
	>;
	setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
	favorites: {
		favorites: IndividualFileArray | null;
		setFavorites: React.Dispatch<React.SetStateAction<IndividualFileArray | null>>;
	};
}) {
	const [clicked, setClicked] = useState(-1);
	const contentEl = useRef<HTMLDivElement>(null);
	// state to keep one accordion open
	const handleToggle = (index: number) => {
		// We start indexing from 0 so no selection is anyhting lower or higher that our current index
		if (clicked === index) {
			return setClicked(-1);
		}
		setClicked(index);
	};

	let months_obj = Object.keys(props.el.months);
	let result = months_obj.map((month_name, index) => {
		let month = month_name as months;
		let files = props.el.months[month]!;
		return (
			<MonthsEl
				index={index}
				month_name={month}
				year={props.el.year}
				active={clicked === index}
				onToggle={() => handleToggle(index)}
				key={index}
				files={files}
				setContextMenu={props.setContextMenu}
				setMenuItems={props.setMenuItems}
				setFormOpen={props.setFormOpen}
				favorites={{
					favorites: props.favorites.favorites,
					setFavorites: props.favorites.setFavorites,
				}}
			/>
		);
	});
	return (
		<>
			<div
				className={
					'accordion ' +
					(props.active ? 'bg-green-800' : 'bg-green-500') +
					' hover:bg-green-700 active:bg-red-800'
				}
				onClick={(e) => {
					props.onToggle(props.index);
				}}
				onContextMenu={(e) => {
					handleContextMenu(e, props.setContextMenu);
					props.setMenuItems([
						{
							name: 'test 1',
							cb: () => {
								console.log('test 1');
							},
						},
						{
							name: 'test 2',
							cb: () => {
								console.log('test 2');
							},
						},
					]);
					console.log('Years');
				}}
			>
				{props.el.year}
			</div>
			<div
				key={props.index}
				className="bg-green-500 overflow-hidden"
				ref={contentEl}
				style={props.active ? { display: 'block' } : { display: 'none' }}
			>
				{result}
			</div>
		</>
	);
}

// TODO: extra day element
export function MonthsEl(props: {
	files: IndividualFileArray;
	month_name: months;
	year: number;
	index: number;
	onToggle: (index: number) => void;
	active: boolean;
	setContextMenu: React.Dispatch<
		React.SetStateAction<{
			mouseX: number;
			mouseY: number;
			file: string | null;
		} | null>
	>;
	setMenuItems: React.Dispatch<
		React.SetStateAction<
			| {
					name: string;
					cb: () => void;
			  }[]
			| null
		>
	>;
	setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
	favorites: {
		favorites: IndividualFileArray | null;
		setFavorites: React.Dispatch<React.SetStateAction<IndividualFileArray | null>>;
	};
}) {
	const [clicked, setClicked] = useState(-1);
	const contentEl = useRef<HTMLDivElement>(null);
	const handleToggle = (index: number) => {
		// We start indexing from 0 so no selection is anyhting lower or higher that our current index
		if (clicked === index) {
			return setClicked(-1);
		}
		setClicked(index);
	};

	// sort the array
	props.files.sort((a, b) => a.file.localeCompare(b.file));
	// keep the day index
	let prevDay = 0;

	let file_names: IndividualFileArray = [];
	const days = props.files.map((el, index) => {
		// get the timestamp from the file
		let timestamp = parseInt(el.file.slice(0, 13));
		var date = new Date(timestamp);

		// Return a different day el
		if (prevDay != date.getDate()) {
			file_names = [];
			file_names.push({ file: el.file, comment: el.comment, channel_id: el.channel_id });

			prevDay = date.getDate();
			return (
				<DayEl
					active={clicked === index}
					index={index}
					onToggle={() => handleToggle(index)}
					day={date.getDate()}
					files={file_names}
					month_name={props.month_name}
					year={props.year}
					key={index}
					setContextMenu={props.setContextMenu}
					setMenuItems={props.setMenuItems}
					setFormOpen={props.setFormOpen}
					favorites={{
						favorites: props.favorites.favorites,
						setFavorites: props.favorites.setFavorites,
					}}
				/>
			);
		} else {
			file_names.push({ file: el.file, comment: el.comment, channel_id: el.channel_id });

			// reset the files for that day
			//   file_names = [];
		}
	});

	return (
		<Fragment>
			<div
				onClick={() => props.onToggle(props.index)}
				onContextMenu={(e) => {
					console.log('months');
				}}
				className="bg-blue-700"
			>
				{props.month_name}
			</div>
			<div
				key={props.index}
				className="bg-green-500 overflow-hidden"
				ref={contentEl}
				style={props.active ? { display: 'block' } : { display: 'none' }}
			>
				{days}
			</div>
		</Fragment>
	);
}

export function DayEl(props: {
	index: number;
	onToggle: (index: number) => void;
	active: boolean;
	day: number;
	files: IndividualFileArray;
	year: number;
	month_name: string;
	setContextMenu: React.Dispatch<
		React.SetStateAction<{
			mouseX: number;
			mouseY: number;
			file: string | null;
		} | null>
	>;
	setMenuItems: React.Dispatch<
		React.SetStateAction<
			| {
					name: string;
					cb: () => void;
			  }[]
			| null
		>
	>;
	setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
	favorites: {
		favorites: IndividualFileArray | null;
		setFavorites: React.Dispatch<React.SetStateAction<IndividualFileArray | null>>;
	};
}) {
	const contentEl = useRef<HTMLDivElement>(null);
	// state to keep one accordion open
	const itemsEl = props.files.map((el, index) => {
		return (
			<ItemsEl
				file={el}
				month_name={props.month_name}
				year={props.year}
				key={index}
				setContextMenu={props.setContextMenu}
				setMenuItems={props.setMenuItems}
				setFormOpen={props.setFormOpen}
				favorites={{
					favorites: props.favorites.favorites,
					setFavorites: props.favorites.setFavorites,
				}}
			/>
		);
	});
	return (
		<>
			<div
				onClick={() => props.onToggle(props.index)}
				onContextMenu={(e) => {
					console.log('days');
				}}
				className="bg-pink-700"
			>
				{props.day}
			</div>
			<div
				key={props.index}
				className="bg-green-500 overflow-hidden"
				ref={contentEl}
				style={props.active ? { display: 'block' } : { display: 'none' }}
			>
				{itemsEl}
			</div>
		</>
	);
}

export function ItemsEl(props: {
	file: IndividualFile;
	year: number;
	month_name: string;
	setContextMenu: React.Dispatch<
		React.SetStateAction<{
			mouseX: number;
			mouseY: number;
			file: string | null;
		} | null>
	>;
	setMenuItems: React.Dispatch<
		React.SetStateAction<
			| {
					name: string;
					cb: () => void;
			  }[]
			| null
		>
	>;
	setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
	favorites: {
		favorites: IndividualFileArray | null;
		setFavorites: React.Dispatch<React.SetStateAction<IndividualFileArray | null>>;
	};
}) {
	let navigate = useNavigate();
	let location = useLocation();
	let params = useParams();

	// TODO: DB
	const handleFavorite = (e: any) => {
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
		<Tooltip title={props.file.comment ? props.file.comment : ''}>
			<div
				className={`${props.file.comment !== null ? 'bg-orange-600' : 'bg-violet-600'} `}
				onClick={(e) =>
					handleClickOnFile(
						e,
						navigate,
						location,
						props.year,
						props.month_name,
						props.file.channel_id!,
						params
					)
				}
				style={{ cursor: 'context-menu' }}
				onContextMenu={(e) => {
					handleContextMenu(e, props.setContextMenu, props.file.file);
					props.file.comment !== null
						? props.setMenuItems([
								{
									name: 'Remove From Favorite',
									cb: () => {
										handleFavorite(e);
									},
								},
						  ])
						: props.setMenuItems([
								{
									name: 'Add To Favorite',
									cb: () => {
										handleFavorite(e);
									},
								},
						  ]);
				}}
			>
				{props.file.file}
			</div>
		</Tooltip>
	);
}

export const handleContextMenu = (
	event: React.MouseEvent,
	setContextMenu: React.Dispatch<
		React.SetStateAction<{
			mouseX: number;
			mouseY: number;
			file: string | null;
		} | null>
	>,
	file: string | null = null
) => {
	console.log(event.target as HTMLBaseElement);
	event.preventDefault();
	setContextMenu((contextMenu) =>
		contextMenu === null
			? {
					mouseX: event.clientX + 2,
					mouseY: event.clientY - 6,
					file: file,
			  }
			: // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
			  // Other native context menus might behave different.
			  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
			  null
	);
};

export function handleClickOnFile(
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
		`${PATH_PREFIX_FOR_LOGGED_USERS}/audio/${
			params.guild_id
		}/${channel_id}/${year}/${month_name}${e.currentTarget.innerHTML.slice(0, -4)}`
	) {
		// same location dont do anything
	} else {
		navigate(
			`${PATH_PREFIX_FOR_LOGGED_USERS}/audio/${
				params.guild_id
			}/${channel_id}/${year}/${month_name}/${e.currentTarget.innerHTML.slice(0, -4)}`
		);
	}
}
