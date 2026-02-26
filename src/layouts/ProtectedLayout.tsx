import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { AudioParams, UserGuilds } from '../Constants';

export const ProtectedLayout = (props: {
	isLoggedIn: boolean;
	guildSelected: UserGuilds | null;
	setGuildSelected: React.Dispatch<React.SetStateAction<UserGuilds | null>>;
	userGuilds: UserGuilds[] | null;
}) => {
	const navigate = useNavigate();
	const params = useParams<AudioParams>();

	const handleGuildSelect = (index: number) => {
		const value = props.userGuilds![index];
		props.setGuildSelected(value);
		navigate(value.id);
	};

	useEffect(() => {
		if (params.guild_id) {
			const guild = props.userGuilds!.find((element) => element.id === params.guild_id!)!;
			props.setGuildSelected(guild);
		}
	});

	if (!props.userGuilds) {
		return <>No guilds</>;
	}

	const guilds = props.userGuilds?.map((value, index) => {
		return (
			<Grid size={{ xs: 1 }} key={index}>
				<div onClick={() => handleGuildSelect(index)} className="cursor-pointer">{value.name}</div>
			</Grid>
		);
	});

	if (!props.guildSelected) {
		return (
			<Box sx={{ flexGrow: 1 }}>
				SELECT A SERVER
				<Grid container justifyContent="center" alignItems="center" minHeight={300}>
					{guilds}
				</Grid>
			</Box>
		);
	}

	return <Outlet />;
};
