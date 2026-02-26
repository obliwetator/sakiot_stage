import React from 'react';
import { Outlet } from 'react-router-dom';
import ResponsiveAppBar from '../navbar';

import { useDispatch } from 'react-redux';
import { useGetAuthDetailsQuery } from '../app/apiSlice';
import { useAppSelector } from '../app/hooks';
import { setGuildSelected } from '../reducers/appSlice';

export function LayoutsWithNavbar() {
	const dispatch = useDispatch();
	const guildSelected = useAppSelector((state) => state.app.guildSelected);
	const { data: authData, isError } = useGetAuthDetailsQuery(undefined, { skip: !localStorage.getItem('token') });

	const isLoggedIn = !!authData?.user && !isError;
	const userGuilds = authData?.guilds || null;

	// In the real app, setIsLoggedIn is likely no longer necessary with RTK Query since state is bound to the query, 
	// but we provide a dummy or logic to clear token to avoid breaking ResponsiveAppBar
	const setIsLoggedIn = (value: any) => {
		if (value === false || value(isLoggedIn) === false) {
			localStorage.removeItem('token');
			window.location.reload();
		}
	};

	const setGuildSelectedAction = (guild: any) => {
		// Since setState accepts value or callback:
		const selected = typeof guild === 'function' ? guild(guildSelected) : guild;
		dispatch(setGuildSelected(selected));
	};

	return (
		<div className="h-full">
			<ResponsiveAppBar
				isLoggedIn={isLoggedIn}
				setIsLoggedIn={setIsLoggedIn}
				guildSelected={guildSelected}
				setGuildSelected={setGuildSelectedAction}
				userGuilds={userGuilds}
			/>
			<Outlet />
		</div>
	);
}
