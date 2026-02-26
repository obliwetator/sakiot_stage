
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Params, useLocation, useParams } from 'react-router-dom';
import { AudioParams, UserGuilds, valuetext } from './Constants';
import { RangeSlider } from './RangeSlider';
import { useAppSelector } from './app/hooks';
import { setHasSilence } from './reducers/silence';



export function AudioInterface(props: { isClip: boolean; userGuilds: UserGuilds[] | null; isSilence: boolean }) {
	console.log('render Audio Interface');
	const intervalRef = useRef<number | undefined>(undefined);
	const params = useParams<AudioParams>();
	// const audioElementRef = React.useRef<HTMLMediaElement>(null);
	const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
	const [readyToPlay, setReadyToPlay] = useState(false);
	const [error, setError] = useState(false);
	const dispatch = useDispatch();
	let value = useAppSelector(state => state.hasSilence.value)

	// Dispatch clean up on unmount or file change so the global hasSilence resets properly
	// Only run the file check on the "original" player (isSilence === false)
	useEffect(() => {
		if (!props.isClip && !props.isSilence && params.file_name) {
			const silenceUrl = `https://dev.patrykstyla.com/audio/${params.guild_id}/${params.channel_id}/${params.year}/${params.month}/${encodeURIComponent(params.file_name)}.ogg?silence=true`;
			fetch(silenceUrl)
				.then(res => {
					if (res.ok) {
						dispatch(setHasSilence(true));
					} else {
						dispatch(setHasSilence(false));
					}
				})
				.catch(err => {
					console.error("Failed to check for silence file", err);
					dispatch(setHasSilence(false));
				});
		}

		return () => {
			if (!props.isSilence) {
				dispatch(setHasSilence(false));
			}
		};
	}, [params.file_name, props.isClip, props.isSilence, params.guild_id, params.channel_id, params.year, params.month, dispatch]);

	useEffect(() => {
		// If this is the silence player, but silence hasn't been found/generated, don't load anything yet
		if (props.isSilence && !value) {
			setReadyToPlay(false);
			setAudioRef(null);
			return;
		}

		console.log("useffect")
		console.log(
			`https://dev.patrykstyla.com/audio/clips/${params.guild_id}/${encodeURIComponent(params.file_name!)}`
		);
		setReadyToPlay(false);
		setError(false);

		let localAudioRef: HTMLAudioElement;
		if (props.isClip) {
			localAudioRef = new Audio(
				`https://dev.patrykstyla.com/audio/clips/${params.guild_id}/${encodeURIComponent(params.file_name!)}`
			);
		} else {
			localAudioRef = new Audio(
				`https://dev.patrykstyla.com/audio/${params.guild_id}/${params.channel_id}/${params.year}/${params.month
				}/${encodeURIComponent(params.file_name!)}.ogg${props.isSilence ? "?silence=true" : ""}`
			);
		}

		let isActive = true;

		localAudioRef!.addEventListener('canplaythrough', (e) => {
			if (!isActive) return;
			console.log('canplaythrough');
			setReadyToPlay(true);
			setAudioRef(localAudioRef);
		});

		localAudioRef!.onerror = (ev) => {
			if (!isActive) return;
			console.log('Audio Ref error', ev);
			setError(true);
		};
		console.log('mount Audio Interface');

		return function cleanup() {
			isActive = false;
			localAudioRef?.pause();
			localAudioRef.src = '';
		};
	}, [params.file_name, props.isClip, props.isSilence, value]);

	// If it's the silence player and it's not active yet, return nothing instead of "Downloading"
	if (props.isSilence && !value) {
		return <div className="flex-initial w-4/5 mt-4 text-gray-400">Audio file doesn't have a silence free version. You can generate one using the 'Remove Silence' button above.</div>;
	}

	if (error) {
		if (props.isSilence) {
			return <div className="flex-initial w-4/5">Audio file doesn't have silence free vesion</div>;
		} else {
			return <div className="flex-initial w-4/5">An error occured fetching the normal audio file. Try refreshing</div>;
		}
	}

	return (
		<>
			<div className="flex-initial w-4/5">
				{readyToPlay ? (
					<RangeSlider
						audioRef={audioRef!}
						intervalRef={intervalRef}
						isClip={props.isClip}
						userGuilds={props.userGuilds}
						isSilence={props.isSilence}
					/>
				) : (
					'Downloading'
				)}
			</div>
		</>
	);
}
