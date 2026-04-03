import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { Channels, UserGuilds } from '../Constants';

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

// Create a new mutex
const mutex = new Mutex();

// Create our base query separately so we can wrap it
const baseQuery = fetchBaseQuery({
	baseUrl: 'https://dev.patrykstyla.com/api/',
	// Ensure cookies are sent for authentication
	fetchFn: (input, init) => fetch(input, { ...init, credentials: 'include' })
});

// Wrap the base query with reauthentication logic
const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	// wait until the mutex is available without locking it
	await mutex.waitForUnlock();
	let result = await baseQuery(args, api, extraOptions);

	console.log('[baseQueryWithReauth] Result:', result);

	if (result.error && result.error.status === 401) {
		console.log('[baseQueryWithReauth] Hit 401. Attempting to refresh token...');
		// checking whether the mutex is locked
		if (!mutex.isLocked()) {
			const release = await mutex.acquire();
			try {
				const refreshResult = await baseQuery(
					{ url: 'refresh', method: 'GET' },
					api,
					extraOptions
				);
				if (refreshResult.data) {
					// retry the initial query
					result = await baseQuery(args, api, extraOptions);
				} else {
					// Optionally dispatch logout or clear tokens
				}
			} finally {
				// release must be called once the mutex should be released again.
				release();
			}
		} else {
			// wait until the mutex is available without locking it
			await mutex.waitForUnlock();
			result = await baseQuery(args, api, extraOptions);
		}
	}
	return result;
};

export interface ClipData {
	clip_id: string;
	user_id: string;
	name: string;
	original_file_name: string;
	saved_file_name: string;
	length: number;
	size: number;
	guild_id: string;
	channel_id: string;
}

export const apiSlice = createApi({
	reducerPath: 'api',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Clips'],
	endpoints: (builder) => ({
		jamIt: builder.mutation<any, { guild_id: string, clip_name: string }>({
			query: (body) => ({
				url: 'jamit',
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body,
			}),
		}),
		removeSilence: builder.mutation<any, { guild_id: string, channel_id: string, year: string, month: number, file_name: string, idempotency_key: string }>({
			query: ({ guild_id, channel_id, year, month, file_name, idempotency_key }) => ({
				url: `remove_silence/${guild_id}/${channel_id}/${year}/${month}/${file_name}`,
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'Idempotency-Key': idempotency_key
				},
			}),
		}),
		refresh: builder.mutation<void, void>({
			query: () => 'refresh'
		}),
		getCurrentGuildDirs: builder.query<Channels[], string>({
			query: (guild_id) => `current/${guild_id}`
		}),
		getClips: builder.query<ClipData[], string>({
			query: (guild_id) => ({
				url: `audio/clips/${guild_id}`
			}),
			providesTags: ['Clips'],
		}),
		deleteClip: builder.mutation<void, { guild_id: string, file_name: string }>({
			query: ({ guild_id, file_name }) => ({
				url: `audio/clips/delete/${guild_id}`,
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain',
				},
				body: file_name,
			}),
			invalidatesTags: ['Clips'],
		}),
		createClip: builder.mutation<any, { guild_id: string, channel_id: string, year: string, month: number, file_name: string, start: number, end: number, name?: string }>({
			query: ({ guild_id, channel_id, year, month, file_name, start, end, name }) => ({
				url: `audio/clips/create/${guild_id}/${channel_id}/${year}/${month}/${file_name}`,
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: { start, end, name }
			}),
		}),
		checkSilenceFile: builder.query<any, { guild_id: string, channel_id: string, year: string, month: number, file_name: string }>({
			query: ({ guild_id, channel_id, year, month, file_name }) => ({
				url: `https://dev.patrykstyla.com/audio/${guild_id}/${channel_id}/${year}/${month}/${encodeURIComponent(file_name)}.ogg?silence=true`,
				method: 'HEAD',
			}),
		}),
		getAudioFile: builder.query<Blob, string>({
			query: (url) => ({
				url,
				responseHandler: (response) => response.blob(),
			}),
		}),
		downloadFile: builder.mutation<Blob, string>({
			query: (url) => ({
				url,
				responseHandler: (response) => response.blob(),
			}),
		}),
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

export const { useGetAuthDetailsQuery, useGetCurrentGuildDirsQuery, useGetClipsQuery, useDeleteClipMutation, useJamItMutation, useRemoveSilenceMutation, useCheckSilenceFileQuery, useRefreshMutation, useCreateClipMutation, useGetAudioFileQuery, useDownloadFileMutation } = apiSlice;
