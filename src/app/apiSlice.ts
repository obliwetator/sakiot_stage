import {
	type BaseQueryFn,
	createApi,
	type FetchArgs,
	type FetchBaseQueryError,
	fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import type { Channels, UserGuilds } from "../Constants";
import type { JamItRespStatus } from "../components/RangeSlider/JamIt";

export interface User {
	guild_id: string;
	permissions: number;
	icon: number;
	name: string;
	is_dev?: boolean;
}

export interface AuthDetails {
	user: User | null;
	guilds: UserGuilds[] | null;
	token: string | null;
}

export interface UserOverride {
	user_id: number;
	cooldown_seconds: number;
	updated_at: string;
}

// Create a new mutex
const mutex = new Mutex();

export const BASE_API_URL = "https://dev.patrykstyla.com/api/";

// Create our base query separately so we can wrap it
const baseQuery = fetchBaseQuery({
	baseUrl: BASE_API_URL,
	// Ensure cookies are sent for authentication
	fetchFn: (input, init) => fetch(input, { ...init, credentials: "include" }),
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

	console.log("[baseQueryWithReauth] Result:", result);

	if (result.error && result.error.status === 401) {
		console.log(
			"[baseQueryWithReauth] Hit 401. Attempting to refresh token...",
		);
		// checking whether the mutex is locked
		if (!mutex.isLocked()) {
			const release = await mutex.acquire();
			try {
				const refreshResult = await baseQuery(
					{ url: "refresh", method: "GET" },
					api,
					extraOptions,
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
	start_time: number;
}

export interface WaveformResponse {
	progress: number;
	data?: string;
	error?: string;
}

export interface StampData {
	id: number;
	guild_id: string;
	channel_id: string;
	target_user_id: string;
	stamper_user_id: string;
	stamp_ts: number;
	offset_ms: number;
	audio_file_id: number | null;
	note: string | null;
	created_at: string;
	target_name: string | null;
	stamper_name: string | null;
	channel_name: string | null;
	file_name: string | null;
	year: number | null;
	month: number | null;
	start_ts: number | null;
}

export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: baseQueryWithReauth,
	tagTypes: ["Clips", "GuildCooldown", "UserOverrides"],
	endpoints: (builder) => ({
		jamIt: builder.mutation<
			{ code: JamItRespStatus },
			{ guild_id: string; clip_name: string }
		>({
			query: (body) => ({
				url: "jamit",
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body,
			}),
		}),
		removeSilence: builder.mutation<
			any,
			{
				guild_id: string;
				channel_id: string;
				year: string;
				month: number;
				file_name: string;
				idempotency_key: string;
			}
		>({
			query: ({
				guild_id,
				channel_id,
				year,
				month,
				file_name,
				idempotency_key,
			}) => ({
				url: `remove_silence/${guild_id}/${channel_id}/${year}/${month}/${file_name}`,
				method: "GET",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"Idempotency-Key": idempotency_key,
				},
			}),
		}),
		refresh: builder.mutation<void, void>({
			query: () => "refresh",
		}),
		logout: builder.mutation<void, void>({
			query: () => ({ url: "logout", method: "GET" }),
		}),
		getCurrentGuildDirs: builder.query<Channels[], string>({
			query: (guild_id) => `current/${guild_id}`,
		}),
		getClips: builder.query<ClipData[], string>({
			query: (guild_id) => ({
				url: `audio/clips/${guild_id}`,
			}),
			providesTags: ["Clips"],
		}),
		getStamps: builder.query<StampData[], string>({
			query: (guild_id) => ({
				url: `stamps/${guild_id}`,
			}),
		}),
		deleteClip: builder.mutation<void, { guild_id: string; file_name: string }>(
			{
				query: ({ guild_id, file_name }) => ({
					url: `audio/clips/delete/${guild_id}`,
					method: "POST",
					headers: {
						"Content-Type": "text/plain",
					},
					body: file_name,
				}),
				invalidatesTags: ["Clips"],
			},
		),
		createClip: builder.mutation<
			any,
			{
				guild_id: string;
				channel_id: string;
				year: string;
				month: number;
				file_name: string;
				start: number;
				end: number;
				name?: string;
			}
		>({
			query: ({
				guild_id,
				channel_id,
				year,
				month,
				file_name,
				start,
				end,
				name,
			}) => ({
				url: `audio/clips/create/${guild_id}/${channel_id}/${year}/${month}/${file_name}`,
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: { start, end, name },
			}),
		}),
		checkSilenceFile: builder.query<
			any,
			{
				guild_id: string;
				channel_id: string;
				year: string;
				month: number;
				file_name: string;
			}
		>({
			query: ({ guild_id, channel_id, year, month, file_name }) => ({
				url: `audio/${guild_id}/${channel_id}/${year}/${month}/${encodeURIComponent(file_name)}.ogg?silence=true`,
				method: "HEAD",
			}),
		}),
		getAudioFile: builder.query<Blob, string>({
			query: (url) => ({
				url,
				responseHandler: (response) => response.blob(),
			}),
		}),
		getWaveform: builder.query<
			WaveformResponse,
			{
				guild_id: string;
				channel_id: string;
				year: string;
				month: number;
				file_name: string;
				timestamp?: number;
			}
		>({
			query: ({ guild_id, channel_id, year, month, file_name, timestamp }) => ({
				url: `audio/waveform/${guild_id}/${channel_id}/${year}/${month}/${encodeURIComponent(file_name)}${timestamp ? `?t=${timestamp}` : ""}`,
			}),
		}),
		downloadFile: builder.mutation<Blob, string>({
			query: (url) => ({
				url,
				responseHandler: (response) => response.blob(),
			}),
		}),
		getGuildCooldown: builder.query<{ cooldown_seconds: number }, string>({
			query: (guild_id) => `admin/guilds/${guild_id}/cooldown`,
			providesTags: (_r, _e, id) => [{ type: "GuildCooldown", id }],
		}),
		setGuildCooldown: builder.mutation<
			void,
			{ guild_id: string; cooldown_seconds: number }
		>({
			query: ({ guild_id, cooldown_seconds }) => ({
				url: `admin/guilds/${guild_id}/cooldown`,
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: { cooldown_seconds },
			}),
			invalidatesTags: (_r, _e, { guild_id }) => [
				{ type: "GuildCooldown", id: guild_id },
			],
		}),
		listUserOverrides: builder.query<UserOverride[], string>({
			query: (guild_id) => `admin/guilds/${guild_id}/cooldown/overrides`,
			providesTags: (_r, _e, id) => [{ type: "UserOverrides", id }],
		}),
		setUserOverride: builder.mutation<
			void,
			{ guild_id: string; user_id: string; cooldown_seconds: number }
		>({
			query: ({ guild_id, user_id, cooldown_seconds }) => ({
				url: `admin/guilds/${guild_id}/cooldown/overrides/${user_id}`,
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: { cooldown_seconds },
			}),
			invalidatesTags: (_r, _e, { guild_id }) => [
				{ type: "UserOverrides", id: guild_id },
			],
		}),
		deleteUserOverride: builder.mutation<
			void,
			{ guild_id: string; user_id: string }
		>({
			query: ({ guild_id, user_id }) => ({
				url: `admin/guilds/${guild_id}/cooldown/overrides/${user_id}`,
				method: "DELETE",
			}),
			invalidatesTags: (_r, _e, { guild_id }) => [
				{ type: "UserOverrides", id: guild_id },
			],
		}),
		// Combine all 3 requests into a single query to emulate the existing Promise.all behavior
		getAuthDetails: builder.query<AuthDetails, void>({
			async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
				const [userResult, guildsResult, tokenResult] = await Promise.all([
					fetchWithBQ("users/@me"),
					fetchWithBQ("users/@me/guilds"),
					fetchWithBQ("token"),
				]);

				if (userResult.error || guildsResult.error || tokenResult.error) {
					return {
						error:
							userResult.error ||
							guildsResult.error ||
							(tokenResult.error as any),
					};
				}

				return {
					data: {
						user: userResult.data as User,
						guilds: guildsResult.data as UserGuilds[],
						token: (tokenResult.data as any).token as string,
					},
				};
			},
		}),
	}),
});

export const {
	useGetAuthDetailsQuery,
	useGetCurrentGuildDirsQuery,
	useGetClipsQuery,
	useDeleteClipMutation,
	useJamItMutation,
	useRemoveSilenceMutation,
	useCheckSilenceFileQuery,
	useRefreshMutation,
	useLogoutMutation,
	useCreateClipMutation,
	useGetAudioFileQuery,
	useDownloadFileMutation,
	useGetWaveformQuery,
	useLazyGetWaveformQuery,
	useGetStampsQuery,
	useGetGuildCooldownQuery,
	useSetGuildCooldownMutation,
	useListUserOverridesQuery,
	useSetUserOverrideMutation,
	useDeleteUserOverrideMutation,
} = apiSlice;
