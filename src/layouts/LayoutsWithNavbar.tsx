import React from 'react';
import { Outlet } from 'react-router-dom';
import { UserGuilds } from '../Constants';
import ResponsiveAppBar from '../navbar';

export function LayoutsWithNavbar(props: {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	guildSelected: UserGuilds | null;
	setGuildSelected: React.Dispatch<React.SetStateAction<UserGuilds | null>>;
	userGuilds: UserGuilds[] | null;
}) {
	return (
		<div className="h-full">
			<ResponsiveAppBar
				isLoggedIn={props.isLoggedIn}
				setIsLoggedIn={props.setIsLoggedIn}
				guildSelected={props.guildSelected}
				setGuildSelected={props.setGuildSelected}
				userGuilds={props.userGuilds}
			/>
			<Outlet />
		</div>
	);
}
