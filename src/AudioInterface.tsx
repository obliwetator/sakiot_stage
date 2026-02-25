
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

	useEffect(() => {
		// if (value) return;
		console.log("useffect")
		console.log(
			`https://dev.patrykstyla.com/audio/clips/${params.guild_id}/${encodeURIComponent(params.file_name!)}`
		);
		//TODO: FIX THIS
		let localAudioRef: HTMLAudioElement;
		if (props.isClip) {
			localAudioRef = new Audio(
				`https://dev.patrykstyla.com/audio/clips/${params.guild_id}/${encodeURIComponent(params.file_name!)}`
			);
		} else {
			if (!value || audioRef!) {
				// TODO: If we have a audio will silence dont re-load the silence free version
				localAudioRef = new Audio(
					`https://dev.patrykstyla.com/audio/${params.guild_id}/${params.channel_id}/${params.year}/${params.month
					}/${encodeURIComponent(params.file_name!)}.ogg ${props.isSilence ? "?silence=true" : ""}`
				);
			}
		}

		localAudioRef!.addEventListener('canplaythrough', (e) => {
			console.log('canplaythrough');
			setReadyToPlay(true);
			setAudioRef(localAudioRef);
			if (props.isSilence) {
				dispatch(setHasSilence(true))
			}
		});

		localAudioRef!.onerror = (ev) => {
			console.log('Audio Ref error', ev);
			setError(true);
			if (props.isSilence) {
				// dispatch(setHasSilence(false))
			}

		};
		console.log('mount Audio Interface');

		return function cleanup() {
			localAudioRef?.pause();
			//   setAudioRef(null);
			// setReadyToPlay(false);
			// setError(false);
			// dispatch(setHasSilence(false))
		};
	}, [params.file_name, value]);

	if (error) {

		if (value) {
			return <div className="flex-initial w-4/5">An error occured. Try refreshing</div>;
		} else {
			return <div className="flex-initial w-4/5">Audio file doesn't have silence free vesion</div>;
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
