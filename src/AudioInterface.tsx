import type Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import {
	BASE_API_URL,
	useCheckSilenceFileQuery,
	useGetAudioFileQuery,
	useGetLiveStateQuery,
} from "./app/apiSlice";
import { useAppSelector } from "./app/hooks";
import type { AudioParams, UserGuilds } from "./Constants";
import { RangeSlider } from "./components/RangeSlider";
import { setHasSilence } from "./reducers/silence";

export function AudioInterface(props: {
	isClip: boolean;
	userGuilds: UserGuilds[] | null;
	isSilence: boolean;
}) {
	console.log("render Audio Interface");
	const intervalRef = useRef<number | undefined>(undefined);
	const params = useParams<AudioParams>();
	const location = useLocation();
	const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
	const [readyToPlay, setReadyToPlay] = useState(false);
	const [error, setError] = useState(false);
	// `hls` path = streaming via HLS, `blob` path = legacy full-file blob.
	// Clips and silence-stripped files always use blob; everything else tries
	// HLS first and falls back to blob on error.
	const [mode, setMode] = useState<"hls" | "blob">(
		props.isClip || props.isSilence ? "blob" : "hls",
	);
	const [trueDuration, setTrueDuration] = useState<number | null>(null);
	const dispatch = useDispatch();
	const value = useAppSelector((state) => state.hasSilence.value);

	const shouldCheckSilence =
		!props.isClip && !props.isSilence && !!params.file_name;
	const { isSuccess, isError } = useCheckSilenceFileQuery(
		{
			guild_id: params.guild_id ?? "",
			channel_id: params.channel_id ?? "",
			year: params.year ?? "",
			month: Number(params.month ?? ""),
			file_name: params.file_name ?? "",
		},
		{ skip: !shouldCheckSilence },
	);

	useEffect(() => {
		if (shouldCheckSilence) {
			if (isSuccess) {
				dispatch(setHasSilence(true));
			} else if (isError) {
				dispatch(setHasSilence(false));
			}
		}

		return () => {
			if (!props.isSilence) {
				dispatch(setHasSilence(false));
			}
		};
	}, [shouldCheckSilence, isSuccess, isError, dispatch, props.isSilence]);

	const liveStateArgs =
		mode === "hls" && !props.isClip && !!params.file_name
			? {
					guild_id: params.guild_id ?? "",
					channel_id: params.channel_id ?? "",
					year: params.year ?? "",
					month: Number(params.month ?? ""),
					file_name: params.file_name ?? "",
				}
			: undefined;
	const { data: liveState } = useGetLiveStateQuery(
		liveStateArgs ?? ({} as never),
		{ skip: !liveStateArgs, pollingInterval: liveStateArgs ? 10_000 : 0 },
	);
	const isLive = !!liveState?.live;

	// Blob fallback path (only fetched when in blob mode).
	const blobUrl = props.isClip
		? `audio/clips/${params.guild_id}/${encodeURIComponent(params.file_name ?? "")}`
		: `audio/${params.guild_id}/${params.channel_id}/${params.year}/${params.month}/${encodeURIComponent(params.file_name ?? "")}.ogg${props.isSilence ? "?silence=true" : ""}`;

	const shouldFetchBlob =
		mode === "blob" && !(props.isSilence && !value) && !!params.file_name;
	const { data: audioBlob, isError: audioFetchError } = useGetAudioFileQuery(
		blobUrl,
		{ skip: !shouldFetchBlob },
	);

	useEffect(() => {
		if (audioFetchError) setError(true);
	}, [audioFetchError]);

	// HLS playback
	useEffect(() => {
		if (mode !== "hls" || !params.file_name || props.isClip || props.isSilence)
			return;

		setReadyToPlay(false);
		setError(false);
		setTrueDuration(null);

		const hlsUrl = `${BASE_API_URL}audio/live/${params.guild_id}/${params.channel_id}/${params.year}/${params.month}/${encodeURIComponent(params.file_name)}/playlist.m3u8`;

		const audio = new Audio();
		audio.preload = "auto";
		let hls: Hls | null = null;
		let isActive = true;
		let didFallback = false;

		const fallback = (reason: string) => {
			if (!isActive || didFallback) return;
			didFallback = true;
			console.warn("HLS failed, falling back to blob:", reason);
			hls?.destroy();
			hls = null;
			setMode("blob");
		};

		const onDurationChange = () => {
			if (!isActive) return;
			if (Number.isFinite(audio.duration)) setTrueDuration(audio.duration);
		};
		const onCanPlay = () => {
			if (!isActive) return;
			const t = new URLSearchParams(location.search).get("t");
			if (t && audio.currentTime === 0) audio.currentTime = parseFloat(t);
			setReadyToPlay(true);
			setAudioRef(audio);
			if (Number.isFinite(audio.duration)) setTrueDuration(audio.duration);
		};
		audio.addEventListener("durationchange", onDurationChange);
		audio.addEventListener("canplay", onCanPlay);
		audio.addEventListener("error", () => fallback("audio element error"));

		// Safari can play HLS natively — skip the hls.js download entirely.
		if (audio.canPlayType("application/vnd.apple.mpegurl")) {
			audio.src = hlsUrl;
		} else {
			// Code-split hls.js so it doesn't bloat the initial bundle. Loaded
			// only when an HLS-eligible recording is opened.
			import("hls.js")
				.then(({ default: Hls }) => {
					if (!isActive) return;
					if (!Hls.isSupported()) {
						fallback("hls not supported in this browser");
						return;
					}
					hls = new Hls({
						xhrSetup: (xhr) => {
							xhr.withCredentials = true;
						},
						// Live latency target. Stays ~1 segment behind edge.
						liveSyncDuration: 2,
						liveMaxLatencyDuration: 15,
					});
					hls.on(Hls.Events.ERROR, (_e, data) => {
						if (data.fatal) fallback(`hls fatal: ${data.type}/${data.details}`);
					});
					hls.loadSource(hlsUrl);
					hls.attachMedia(audio);
				})
				.catch((e) => fallback(`hls.js import failed: ${e}`));
		}

		return () => {
			isActive = false;
			hls?.destroy();
			audio.pause();
			audio.removeAttribute("src");
			audio.load();
		};
	}, [
		mode,
		params.file_name,
		params.guild_id,
		params.channel_id,
		params.year,
		params.month,
		props.isClip,
		props.isSilence,
		location.search,
	]);

	// Blob playback (legacy / fallback)
	useEffect(() => {
		if (mode !== "blob") return;
		if (!audioBlob) {
			setReadyToPlay(false);
			setAudioRef(null);
			return;
		}

		setReadyToPlay(false);
		setError(false);
		setTrueDuration(null);

		const objectUrl = URL.createObjectURL(audioBlob);
		const localAudioRef: HTMLAudioElement = new Audio(objectUrl);
		let isActive = true;

		localAudioRef.addEventListener("durationchange", () => {
			if (!isActive) return;
			if (
				localAudioRef.duration !== Infinity &&
				Number.isFinite(localAudioRef.duration)
			) {
				setTrueDuration(localAudioRef.duration);
			}
		});

		localAudioRef.addEventListener("canplaythrough", () => {
			if (!isActive) return;
			const t = new URLSearchParams(location.search).get("t");
			if (t && localAudioRef.currentTime === 0)
				localAudioRef.currentTime = parseFloat(t);
			setReadyToPlay(true);
			setAudioRef(localAudioRef);
			if (
				localAudioRef.duration !== Infinity &&
				Number.isFinite(localAudioRef.duration)
			) {
				setTrueDuration(localAudioRef.duration);
			}
		});

		localAudioRef.onerror = () => {
			if (!isActive) return;
			setError(true);
		};

		return () => {
			isActive = false;
			localAudioRef.pause();
			localAudioRef.src = "";
			URL.revokeObjectURL(objectUrl);
		};
	}, [mode, audioBlob, location.search]);

	if (props.isSilence && !value) {
		return (
			<div className="w-full mt-4 text-gray-400">
				Audio file doesn't have a silence free version. You can generate one
				using the 'Remove Silence' button above.
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full">
				{props.isSilence
					? "Audio file doesn't have silence free vesion"
					: "An error occured fetching the audio. Try refreshing"}
			</div>
		);
	}

	return (
		<div className="w-full">
			{readyToPlay && audioRef ? (
				<>
					{mode === "hls" && isLive && (
						<div className="mb-2 inline-block px-2 py-1 text-xs font-bold text-white bg-red-600 rounded">
							● LIVE
						</div>
					)}
					<RangeSlider
						audioRef={audioRef}
						intervalRef={intervalRef}
						isClip={props.isClip}
						userGuilds={props.userGuilds}
						isSilence={props.isSilence}
						trueDuration={trueDuration}
					/>
				</>
			) : (
				"Loading"
			)}
		</div>
	);
}
