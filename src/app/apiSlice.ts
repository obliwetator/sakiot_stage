import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Channels, UserGuilds } from "../Constants";
import type { JamItRespStatus } from "../features/audio-dashboard/RangeSlider/JamIt";
import { BASE_API_URL, ensureRefreshed, getCsrfToken } from "./authedFetch";

export { BASE_API_URL };

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

export interface RemoveSilenceResponse {
	url?: string;
	message?: string;
}

export interface CreateClipResponse {
	status: string;
	file: string;
	id: string;
	name: string;
}

const baseQuery = fetchBaseQuery({
	baseUrl: BASE_API_URL,
	fetchFn: (input, init) => fetch(input, { ...init, credentials: "include" }),
});

const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	if (typeof args !== "string") {
		const method = (args.method || "GET").toUpperCase();
		if (method !== "GET" && method !== "HEAD") {
			const csrf = getCsrfToken();
			if (csrf) {
				const headers = new Headers(args.headers as HeadersInit | undefined);
				headers.set("X-CSRF-Token", csrf);
				args = { ...args, headers };
			}
		}
	}

	let result = await baseQuery(args, api, extraOptions);

	if (result.error && result.error.status === 401) {
		const ok = await ensureRefreshed();
		if (ok) result = await baseQuery(args, api, extraOptions);
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
			RemoveSilenceResponse,
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
		getLiveStems: builder.query<string[], string>({
			query: (guild_id) => `current/${guild_id}/live-stems`,
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
					method: "DELETE",
					headers: {
						"Content-Type": "text/plain",
					},
					body: file_name,
				}),
				invalidatesTags: ["Clips"],
			},
		),
		createClip: builder.mutation<
			CreateClipResponse,
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
			void,
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
		getLiveState: builder.query<
			{ live: boolean; started_at: number | null; ended_at: number | null },
			{
				guild_id: string;
				channel_id: string;
				year: string;
				month: number;
				file_name: string;
			}
		>({
			query: ({ guild_id, channel_id, year, month, file_name }) => ({
				url: `audio/live/${guild_id}/${channel_id}/${year}/${month}/${encodeURIComponent(file_name)}/state`,
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
							(tokenResult.error as FetchBaseQueryError),
					};
				}

				return {
					data: {
						user: userResult.data as User,
						guilds: guildsResult.data as UserGuilds[],
						token: (tokenResult.data as { token: string }).token,
					},
				};
			},
		}),
	}),
});

export const {
	useGetAuthDetailsQuery,
	useGetCurrentGuildDirsQuery,
	useGetLiveStemsQuery,
	useGetClipsQuery,
	useDeleteClipMutation,
	useJamItMutation,
	useRemoveSilenceMutation,
	useCheckSilenceFileQuery,
	useRefreshMutation,
	useLogoutMutation,
	useCreateClipMutation,
	useGetLiveStateQuery,
	useGetWaveformQuery,
	useLazyGetWaveformQuery,
	useGetStampsQuery,
	useGetGuildCooldownQuery,
	useSetGuildCooldownMutation,
	useListUserOverridesQuery,
	useSetUserOverrideMutation,
	useDeleteUserOverrideMutation,
} = apiSlice;
