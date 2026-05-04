import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { useGetAuthDetailsQuery } from "../app/apiSlice";
import { useAppSelector } from "../app/hooks";
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

	// In the real app, setIsLoggedIn is likely no longer necessary with RTK Query since state is bound to the query,
	// but we provide a dummy or logic to clear token to avoid breaking ResponsiveAppBar
	const setIsLoggedIn = (value: boolean | ((prev: boolean) => boolean)) => {
		if (
			value === false ||
			(typeof value === "function" && value(isLoggedIn) === false)
		) {
			localStorage.removeItem("auth_probe");
			window.location.reload();
		}
	};

	const setGuildSelectedAction = (
		guild:
			| import("../Constants").UserGuilds
			| null
			| ((
					prev: import("../Constants").UserGuilds | null,
			  ) => import("../Constants").UserGuilds | null),
	) => {
		// Since setState accepts value or callback:
		const selected = typeof guild === "function" ? guild(guildSelected) : guild;
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
