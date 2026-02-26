import Container from '@mui/material/Container';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AudioInterface } from '../AudioInterface';
import CustomizedTreeView from '../components/TreeView';

import { useGetAuthDetailsQuery } from '../app/apiSlice';
import { useAppSelector } from '../app/hooks';

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
}) {
	const params = useParams();
	const location = useLocation();

	const guildSelected = useAppSelector((state) => state.app.guildSelected);
	const { data: authData } = useGetAuthDetailsQuery(undefined, { skip: !localStorage.getItem('token') });
	const userGuilds = authData?.guilds || null;

	return (
		<div className="flex">
			<CustomizedTreeView guildSelected={guildSelected} />
			<Container maxWidth={false} style={{ minWidth: 0 }}>
				{params.year && <AudioInterface key={`${location.pathname}-nosilence`} isClip={false} userGuilds={userGuilds} isSilence={false} />}
				{params.year && <AudioInterface key={`${location.pathname}-silence`} isClip={false} userGuilds={userGuilds} isSilence={true} />}
			</Container>
		</div>
	);
}
