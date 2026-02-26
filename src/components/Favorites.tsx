import React, { JSX } from 'react';
import { IndividualFileArray, Months } from '../Constants';
import { ItemsEl } from '../LeftNavMenu/yearSelection';

export function Favorites(props: {
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
	const items: JSX.Element[] = [];
	if (props.favorites.favorites) {
		props.favorites.favorites.forEach((el, index) => {
			const timestamp = parseInt(el.file.slice(0, 13));
			const date = new Date(timestamp);

			const item = (
				<ItemsEl
					key={index}
					file={el}
					month_name={Months[date.getMonth()] as any as string}
					year={date.getFullYear()}
					setContextMenu={props.setContextMenu}
					setMenuItems={props.setMenuItems}
					setFormOpen={props.setFormOpen}
					favorites={{
						favorites: props.favorites.favorites,
						setFavorites: props.favorites.setFavorites,
					}}
				></ItemsEl>
			);

			items.push(item);
		});
		return (
			<>
				<div
					className={
						'accordion ' +
						(props.active ? 'bg-green-800' : 'bg-green-500') +
						' hover:bg-green-700 active:bg-red-800'
					}
					onClick={() => {
						props.onToggle(props.index);
					}}
				>
					Favorites
				</div>
				<div
					key={props.index}
					className="bg-green-500 overflow-hidden"
					style={props.active ? { display: 'block' } : { display: 'none' }}
				>
					{items}
				</div>
			</>
		);
	} else {
		return <div>No favs</div>;
	}
}
