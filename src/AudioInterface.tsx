
import React, { useEffect, useRef, useState } from 'react';
import { Params, useLocation, useParams } from 'react-router-dom';
import { AudioParams, UserGuilds, valuetext } from './Constants';
import { RangeSlider } from './RangeSlider';
 

 
export function AudioInterface(props: { isClip: boolean; userGuilds: UserGuilds[] | null }) {
	console.log('render Audio Interface');
	const intervalRef = useRef<number | undefined>();
	const params = useParams<AudioParams>();
	// const audioElementRef = React.useRef<HTMLMediaElement>(null);
	const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
	const [readyToPlay, setReadyToPlay] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
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
				`https://dev.patrykstyla.com/audio/${params.guild_id}/${params.channel_id}/${params.year}/${
					params.month
				}/${encodeURIComponent(params.file_name!)}.ogg`
			);
		}

		audioRef!.addEventListener('canplaythrough', (e) => {
			console.log('canplaythrough');
			setReadyToPlay(true);
			setAudioRef(audioRef);
		});

		audioRef.onerror = (ev) => {
			console.log('Audio Ref error', ev);
			setError(true);
		};
		console.log('mount Audio Interface');

		return function cleanup() {
			audioRef?.pause();
			//   setAudioRef(null);
			setReadyToPlay(false);
			setError(false);
		};
	}, [params.file_name]);
	// return function cleanup() {
	//   setData(null)
	// }

	if (error) {
		return <div className="flex-initial w-4/5">An error occured</div>;
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
					/>
				) : (
					'Downloading'
				)}
			</div>
		</>
	);
}
