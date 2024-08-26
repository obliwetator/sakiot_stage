
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Params, useLocation, useParams } from 'react-router-dom';
import { AudioParams, UserGuilds, valuetext } from './Constants';
import { RangeSlider } from './RangeSlider';
import { useAppSelector } from './app/hooks';
import { setHasSilence } from './reducers/silence';



export function AudioInterface(props: { isClip: boolean; userGuilds: UserGuilds[] | null; isSilence: boolean }) {
	console.log('render Audio Interface');
	const intervalRef = useRef<number | undefined>();
	const params = useParams<AudioParams>();
	// const audioElementRef = React.useRef<HTMLMediaElement>(null);
	const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
	const [readyToPlay, setReadyToPlay] = useState(false);
	const [error, setError] = useState(false);
	const dispatch = useDispatch();
	let value = useAppSelector(state => state.hasSilence.value)



	useEffect(() => {
		console.log("useffect")
		console.log(
			`https://dev.patrykstyla.com/audio/clips/${params.guild_id}/${encodeURIComponent(params.file_name!)}`
		);
		//TODO: FIX THIS
		let audioRef: HTMLAudioElement;
		if (props.isClip) {
			audioRef = new Audio(
				`https://dev.patrykstyla.com/audio/clips/${params.guild_id}/${encodeURIComponent(params.file_name!)}`
			);
		} else {
			audioRef = new Audio(
				`https://dev.patrykstyla.com/audio/${params.guild_id}/${params.channel_id}/${params.year}/${params.month
				}/${encodeURIComponent(params.file_name!)}.ogg${props.isSilence ? "?silence=true" : ""}`
			);
		}

		audioRef!.addEventListener('canplaythrough', (e) => {
			console.log('canplaythrough');
			setReadyToPlay(true);
			setAudioRef(audioRef);
			if (props.isSilence) {
				// dispatch(setHasSilence(true))
			}
		});

		audioRef.onerror = (ev) => {
			console.log('Audio Ref error', ev);
			setError(true);
			if (props.isSilence) {
				// dispatch(setHasSilence(false))
			}

		};
		console.log('mount Audio Interface');

		return function cleanup() {
			audioRef?.pause();
			//   setAudioRef(null);
			setReadyToPlay(false);
			setError(false);
			dispatch(setHasSilence(false))
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
