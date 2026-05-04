import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { useGetAuthDetailsQuery } from "../app/apiSlice";
import { useAppSelector } from "../app/hooks";
import { useGuildSync } from "../app/useGuildSync";
import type { UserGuilds } from "../Constants";
import ResponsiveAppBar from "../navbar";
import { setGuildSelected } from "../reducers/appSlice";

export function LayoutsWithNavbar() {
	const dispatch = useDispatch();
	const guildSelected = useAppSelector((state) => state.app.guildSelected);
	const { data: authData, isError } = useGetAuthDetailsQuery(undefined, {
		skip: !localStorage.getItem("auth_probe"),
	});

	const isLoggedIn = !!authData?.user && !isError;
	const userGuilds = authData?.guilds || null;

	useGuildSync(userGuilds);

	const setIsLoggedIn = (value: boolean | ((prev: boolean) => boolean)) => {
		if (
			value === false ||
			(typeof value === "function" && value(isLoggedIn) === false)
		) {
			localStorage.removeItem("auth_probe");
			window.location.reload();
		}
	};

	const setGuildSelectedAction = (guild: UserGuilds | null) => {
		dispatch(setGuildSelected(guild));
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
