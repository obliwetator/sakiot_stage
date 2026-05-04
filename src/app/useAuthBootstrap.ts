import { useEffect, useState } from "react";
import { useGetAuthDetailsQuery } from "./apiSlice";

export function useAuthBootstrap() {
	const [hasToken, setHasToken] = useState(
		!!localStorage.getItem("auth_probe"),
	);

	const {
		data: authData,
		isLoading,
		isError,
		refetch,
	} = useGetAuthDetailsQuery(undefined, {
		skip: !hasToken,
	});

	const isLoggedIn = !!authData?.user && !isError;

	useEffect(() => {
		if (authData?.token) {
			localStorage.setItem("auth_probe", authData.token);
		}
	}, [authData]);

	useEffect(() => {
		const handler = (e: MessageEvent) => {
			if (e.origin !== "https://dev.patrykstyla.com") return;
			if (e.data.success !== 1) {
				console.error("something failed when authenticating");
				return;
			}
			if (!localStorage.getItem("auth_probe")) {
				console.error(
					"This should not happen - auth_probe should be set at this point",
				);
				localStorage.setItem("auth_probe", "logged-in");
			}
			setHasToken(true);
			refetch();
			if (e.source && (e.source as Window).close) {
				setTimeout(() => (e.source as Window).close(), 200);
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [refetch]);

	return { authData, isLoading, isLoggedIn };
}
