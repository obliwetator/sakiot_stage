import Container from '@mui/material/Container';
import React from 'react';
import { useParams } from 'react-router-dom';
import { AudioInterface } from '../AudioInterface';
import CustomizedTreeView from '../components/TreeView';
import { UserGuilds } from '../Constants';

export function YearSelection(props: {
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
	userGuilds: UserGuilds[] | null;
}) {
	const params = useParams();

	return (
		<div className="flex">
			<CustomizedTreeView guildSelected={props.guildSelected} />
			<Container maxWidth={false} style={{ minWidth: 0 }}>
				{params.year && <AudioInterface isClip={false} userGuilds={props.userGuilds} isSilence={false} />}
				<AudioInterface isClip={false} userGuilds={props.userGuilds} isSilence={true} />
			</Container>
		</div>
	);
}
