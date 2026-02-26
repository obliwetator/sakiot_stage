import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
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

export const apiSlice = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://dev.patrykstyla.com/api/',
		// Ensure cookies are sent for authentication
		fetchFn: (input, init) => fetch(input, { ...init, credentials: 'include' })
	}),
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
