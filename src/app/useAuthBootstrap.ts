import { useEffect, useState } from "react";
import { useGetAuthDetailsQuery } from "./apiSlice";
import { isLoggedIn as hasLoggedInCookie } from "./authedFetch";

export function useAuthBootstrap() {
	const [hasToken, setHasToken] = useState(hasLoggedInCookie());

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
		const handler = (e: MessageEvent) => {
			if (e.origin !== "https://dev.patrykstyla.com") return;
			if (e.data.success !== 1) {
				console.error("something failed when authenticating");
				return;
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
