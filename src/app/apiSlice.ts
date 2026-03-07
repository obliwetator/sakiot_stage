import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { UserGuilds } from '../Constants';

export interface User {
	guild_id: string;
	permissions: number;
	icon: number;
	name: string;
}

export interface AuthDetails {
	user: User | null;
	guilds: UserGuilds[] | null;
	token: string | null;
}

// Create our base query separately so we can wrap it
const baseQuery = fetchBaseQuery({
	baseUrl: 'https://dev.patrykstyla.com/api/',
	// Ensure cookies are sent for authentication
	fetchFn: (input, init) => fetch(input, { ...init, credentials: 'include' })
});

// A mutex to prevent multiple parallel refresh calls
let isRefreshing = false;
let refreshSubscribers: ((isRefreshed: boolean) => void)[] = [];

const subscribeTokenRefresh = (cb: (isRefreshed: boolean) => void) => {
	refreshSubscribers.push(cb);
};

const onRefreshed = (isRefreshed: boolean) => {
	refreshSubscribers.forEach((cb) => cb(isRefreshed));
	refreshSubscribers = [];
};

// Wrap the base query with reauthentication logic
const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	// Wait until the mutex is available
	if (isRefreshing) {
		await new Promise<boolean>((resolve) => {
			subscribeTokenRefresh((isRefreshed) => {
				resolve(isRefreshed);
			});
		});
	}

	let result = await baseQuery(args, api, extraOptions);

	if (result.error && result.error.status === 401) {
		if (!isRefreshing) {
			isRefreshing = true;
			try {
				// Try to get a new token
				const refreshResult = await baseQuery(
					{ url: 'refresh', method: 'GET' }, // Adjust method to POST if your backend expects it
					api,
					extraOptions
				);

				if (refreshResult.data) {
					// Token refresh successful, notify subscribers
					onRefreshed(true);
					// Retry the original query
					result = await baseQuery(args, api, extraOptions);
				} else {
					// Refresh failed (e.g. refresh token expired)
					onRefreshed(false);
					// Optional: Dispatch a logout action or clear tokens here
					// api.dispatch(loggedOutAction());
				}
			} finally {
				isRefreshing = false;
			}
		} else {
			// Another request already triggered a refresh. Wait for it to finish.
			const isRefreshed = await new Promise<boolean>((resolve) => {
				subscribeTokenRefresh((success) => {
					resolve(success);
				});
			});

			if (isRefreshed) {
				// Retry original query
				result = await baseQuery(args, api, extraOptions);
			}
		}
	}
	return result;
};

export const apiSlice = createApi({
	reducerPath: 'api',
	baseQuery: baseQueryWithReauth,
	endpoints: (builder) => ({
		// Combine all 3 requests into a single query to emulate the existing Promise.all behavior
		getAuthDetails: builder.query<AuthDetails, void>({
			async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
				const [userResult, guildsResult, tokenResult] = await Promise.all([
					fetchWithBQ('users/@me'),
					fetchWithBQ('users/@me/guilds'),
					fetchWithBQ('token')
				]);

				if (userResult.error || guildsResult.error || tokenResult.error) {
					return { error: userResult.error || guildsResult.error || tokenResult.error as any };
				}

				return {
					data: {
						user: userResult.data as User,
						guilds: guildsResult.data as UserGuilds[],
						token: (tokenResult.data as any).token as string
					}
				};
			}
		}),
	}),
});

export const { useGetAuthDetailsQuery } = apiSlice;
