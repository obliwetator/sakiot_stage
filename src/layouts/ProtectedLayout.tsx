import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useGetAuthDetailsQuery } from '../app/apiSlice';
import { useAppSelector } from '../app/hooks';
import { AudioParams } from '../Constants';
import { setGuildSelected } from '../reducers/appSlice';

export const ProtectedLayout = () => {
	const navigate = useNavigate();
	const params = useParams<AudioParams>();
	const dispatch = useDispatch();

	const guildSelected = useAppSelector((state) => state.app.guildSelected);
	const { data: authData } = useGetAuthDetailsQuery(undefined, { skip: !localStorage.getItem('token') });

	const userGuilds = authData?.guilds || null;

	const handleGuildSelect = (index: number) => {
		if (userGuilds) {
			const value = userGuilds[index];
			dispatch(setGuildSelected(value));
			navigate(value.id);
		}
	};

	useEffect(() => {
		if (params.guild_id && userGuilds) {
			const guild = userGuilds.find((element) => element.id === params.guild_id);
			if (guild) {
				dispatch(setGuildSelected(guild));
			}
		}
	}, [params.guild_id, userGuilds, dispatch]);

	if (!userGuilds) {
		return <>No guilds</>;
	}

	const guilds = userGuilds.map((value, index) => {
		return (
			<Grid size={{ xs: 1 }} key={index}>
				<div onClick={() => handleGuildSelect(index)} className="cursor-pointer">{value.name}</div>
			</Grid>
		);
	});

	if (!guildSelected) {
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
