import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Params, useLocation, useParams } from "react-router-dom";
import { useCheckSilenceFileQuery, useGetAudioFileQuery } from "./app/apiSlice";
import { useAppSelector } from "./app/hooks";
import { type AudioParams, type UserGuilds, valuetext } from "./Constants";
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
	const dispatch = useDispatch();
	const value = useAppSelector((state) => state.hasSilence.value);

	const shouldCheckSilence =
		!props.isClip && !props.isSilence && !!params.file_name;
	const { isSuccess, isError } = useCheckSilenceFileQuery(
		{
			guild_id: params.guild_id!,
			channel_id: params.channel_id!,
			year: params.year!,
			month: Number(params.month!),
			file_name: params.file_name!,
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

	const [trueDuration, setTrueDuration] = useState<number | null>(null);

	const audioUrl = props.isClip
		? `audio/clips/${params.guild_id}/${encodeURIComponent(params.file_name!)}`
		: `audio/${params.guild_id}/${params.channel_id}/${params.year}/${params.month}/${encodeURIComponent(params.file_name!)}.ogg${props.isSilence ? "?silence=true" : ""}`;

	const shouldFetchAudio = !(props.isSilence && !value) && !!params.file_name;
	const { data: audioBlob, isError: audioFetchError } = useGetAudioFileQuery(
		audioUrl,
		{ skip: !shouldFetchAudio },
	);

	useEffect(() => {
		if (audioFetchError) {
			setError(true);
		}
	}, [audioFetchError]);

	useEffect(() => {
		if (!audioBlob) {
			setReadyToPlay(false);
			setAudioRef(null);
			return;
		}

		console.log("useffect for blob");
		setReadyToPlay(false);
		setError(false);
		setTrueDuration(null);

		const objectUrl = URL.createObjectURL(audioBlob);
		const localAudioRef: HTMLAudioElement = new Audio(objectUrl);
		let isActive = true;

		// Update duration safely as the file buffers/plays
		localAudioRef.addEventListener("durationchange", () => {
			if (!isActive) return;
			if (
				localAudioRef.duration !== Infinity &&
				isFinite(localAudioRef.duration)
			) {
				setTrueDuration(localAudioRef.duration);
			}
		});

		localAudioRef!.addEventListener("canplaythrough", (e) => {
			if (!isActive) return;
			console.log("canplaythrough");

			const searchParams = new URLSearchParams(location.search);
			const t = searchParams.get("t");
			if (t && localAudioRef.currentTime === 0) {
				localAudioRef.currentTime = parseFloat(t);
			}

			setReadyToPlay(true);
			setAudioRef(localAudioRef);

			if (
				localAudioRef.duration !== Infinity &&
				isFinite(localAudioRef.duration)
			) {
				setTrueDuration(localAudioRef.duration);
			}
		});

		localAudioRef!.onerror = (ev) => {
			if (!isActive) return;
			console.log("Audio Ref error", ev);
			setError(true);
		};
		console.log("mount Audio Interface");

		return function cleanup() {
			isActive = false;
			localAudioRef?.pause();
			localAudioRef.src = "";
			URL.revokeObjectURL(objectUrl);
		};
	}, [audioBlob]);

	// If it's the silence player and it's not active yet, return nothing instead of "Downloading"
	if (props.isSilence && !value) {
		return (
			<div className="w-full mt-4 text-gray-400">
				Audio file doesn't have a silence free version. You can generate one
				using the 'Remove Silence' button above.
			</div>
		);
	}

	if (error) {
		if (props.isSilence) {
			return (
				<div className="w-full">
					Audio file doesn't have silence free vesion
				</div>
			);
		} else {
			return (
				<div className="w-full">
					An error occured fetching the normal audio file. Try refreshing
				</div>
			);
		}
	}

	return (
		<>
			<div className="w-full">
				{readyToPlay ? (
					<RangeSlider
						audioRef={audioRef!}
						intervalRef={intervalRef}
						isClip={props.isClip}
						userGuilds={props.userGuilds}
						isSilence={props.isSilence}
						trueDuration={trueDuration}
					/>
				) : (
					"Downloading"
				)}
			</div>
		</>
	);
}
