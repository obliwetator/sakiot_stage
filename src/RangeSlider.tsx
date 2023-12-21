import { VolumeDown, VolumeMute, VolumeUp } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, Modal, Slider, Stack, TextField, Typography } from "@mui/material";
import styled from '@mui/material/styles/styled';
import React, { useEffect, useState } from "react";
import { Params, useLocation, useParams } from "react-router-dom";
import { AudioParams, UserGuilds, valuetext } from "./Constants";


const TinyText = styled(Typography)({
	fontSize: '0.75rem',
	opacity: 0.38,
	fontWeight: 500,
	letterSpacing: 0.2,
});

enum RespStatus {
	CONNECTED,
	NOT_CONNECTED,
	UNKOWN,
}

export function RangeSlider(props: {
	audioRef: HTMLAudioElement;
	intervalRef: React.MutableRefObject<number | undefined>;
	isClip: boolean;
	userGuilds: UserGuilds[] | null;
}) {
	const [playing, setPlaying] = useState(false);
	const [startEnd, setStartEnd] = React.useState<number[]>([0, props.audioRef.duration]);
	const [zoomInStartEnd, setZoomInStartEnd] = React.useState<number>(0);
	const [isSliderClicked, setIsSliderClicked] = React.useState(false);
	const [ArrowKeySkip, CtrlArrowKeySKip] = [5, 30];
	const [switchAudio, setSwitchAduio] = React.useState(false);



	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			// Reset zoom in bar
			if (event.key === 'ArrowRight') {
				if (event.ctrlKey) {
					setStartEnd((startEnd1) => [startEnd1[0] + CtrlArrowKeySKip, startEnd1[1]]);
					props.audioRef.currentTime += CtrlArrowKeySKip;
				} else {
					setStartEnd((startEnd1) => [startEnd1[0] + ArrowKeySkip, startEnd1[1]]);
					props.audioRef.currentTime += ArrowKeySkip;
				}
			} else if (event.key === 'ArrowLeft') {
				if (event.ctrlKey) {
					setStartEnd((startEnd1) => [startEnd1[0] - CtrlArrowKeySKip, startEnd1[1]]);
					props.audioRef.currentTime -= CtrlArrowKeySKip;
				} else {
					setStartEnd((startEnd1) => [startEnd1[0] - ArrowKeySkip, startEnd1[1]]);
					props.audioRef.currentTime -= ArrowKeySkip;
				}
			} else {
				return;
			}
			setZoomInStartEnd(0);
		};
		// NOTE: DO NOT RE-WRITE THE FUNCTION AS SHOWN BELOW
		// WHEN USING HOT RELOADING IT WILL RE-REGISTER THE EVENT LISTENER
		// window.addEventListener('keydown', (e) => {
		// 	handleKeyPress(e);
		// });
		window.addEventListener('keydown', handleKeyPress);
		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	//   const currentPercentage = duration
	//     ? `${(trackProgress / duration) * 100}%`
	//     : "0%";
	const startTimer = () => {
		// Clear any timers already running

		clearInterval(props.intervalRef.current);

		props.intervalRef.current = setInterval(() => {
			if (!isSliderClicked) {
				setZoomInStartEnd((prev) => {
					if (prev < 0) {
						if (prev >= -2) return 0;
						return Math.round(-Math.abs(prev * 0.6666));
					} else if (prev > 0) {
						if (prev <= 2) return 0;
						return Math.round(prev * 0.6666);
					} else {
						return 0;
					}
				});
			}

			setStartEnd((prev) => [props.audioRef.currentTime, prev[1]]);
		}, 1000);
	};

	// restart the interval on props change
	// The inreval uses cached values, so if we want to use the state we have to create nnew intervals when the desired state changes
	useEffect(() => {
		if (isSliderClicked)
			startTimer();
		return () => clearInterval(props.intervalRef.current);
	}, [isSliderClicked]);

	//   const currentPercentage = audioCtx.currentTime
	//     ? `${(audioCtx.currentTime / source!.buffer!.duration!) * 100}%`
	//     : "0%";

	//   setInterval(() => { 
	//     console.log(currentPercentage);
	//   }, 10);

	// useEffect(() => {}, [props.audioRef]);

	const handleChange = (event: Event, newValue: number | number[], activeThumb: number) => {
		const minDistance = 10;
		if (!Array.isArray(newValue)) {
			setIsSliderClicked(true);
			if (startEnd[0] + newValue < 0) {
				// Too far left
				setStartEnd([0, startEnd[1]]);
				setZoomInStartEnd(0);

				return;
			} else if (startEnd[0] + newValue + minDistance > startEnd[1]) {
				// Too far right
				setStartEnd([startEnd[1] - minDistance, startEnd[1]]);
				props.audioRef.play();
				setZoomInStartEnd(0);
				return;
			}
			const diff = newValue - zoomInStartEnd;

			setStartEnd([startEnd[0] + diff, startEnd[1]]);
			props.audioRef.currentTime = startEnd[0] + diff;

			setZoomInStartEnd(newValue);

			return;
		}

		if (activeThumb === 0) {
			props.audioRef.currentTime = newValue[0];
			setStartEnd([Math.min(newValue[0], startEnd[1] - minDistance), startEnd[1]]);
		} else {
			setStartEnd([startEnd[0], Math.max(newValue[1], startEnd[0] + minDistance)]);
		}
		// Reset the zoom in slider to 0
		setZoomInStartEnd(0);
	};
	const params = useParams<AudioParams>();

	useEffect(() => {
		// const options: PeaksOptions = {
		// 	zoomview: {
		// 		container: document.getElementById('zoomview-container')!,
		// 		waveformColor: '#00e180',
		// 	},
		// 	overview: {
		// 		container: document.getElementById('overview-container')!,
		// 		waveformColor: '#00e180',
		// 	},
		// 	mediaElement: audioElementRef.current!,

		// 	dataUri: {
		// 		// arraybuffer: 'https://dev.patrykstyla.com/audio/waveform/sample.dat',
		// 		json: 'https://dev.patrykstyla.com/audio/waveform/sample2.json',
		// 	},
		// };

		// Peaks.init(options, function (err, peaks) {
		// 	if (err) {
		// 		console.error('Failed to initialize Peaks instance: ' + err.message);
		// 		return;
		// 	}

		// 	if (!peaks) return;

		// 	peaks.views.getView('zoomview')?.setWheelMode('scroll', { captureVerticalScroll: true });
		// 	console.log('Success?');

		// 	setTimeout(async () => {
		// 		let res = await fetch('https://dev.patrykstyla.com/audio/waveform/sample.dat');
		// 		let buff = await res.arrayBuffer();
		// 		peaks.setSource(
		// 			{
		// 				// waveformData: { arraybuffer: buff },
		// 				dataUri: { arraybuffer: 'https://dev.patrykstyla.com/audio/waveform/sample.dat' },
		// 			},
		// 			(error) => {
		// 				if (error) {
		// 					console.error('setSource error', error);
		// 				}
		// 				console.log('Success2?');
		// 			}
		// 		);
		// 	}, 3000);

		// 	// Do something when the waveform is displayed and ready
		// });

		// const wavesurfer = WaveSurfer.create({
		// 	container: '#waveform',
		// 	waveColor: '#4F4A85',
		// 	progressColor: '#383351',
		// 	media: props.audioRef,
		// 	hideScrollbar: true,
		// 	height: 'auto',
		// 	minPxPerSec: 0.5,
		// 	peaks: [Array(100).fill(0)],
		// 	normalize: true,
		// 	// url: 'https://dev.patrykstyla.com/audio/362257054829641758/763782256980131892/2023/July/1688216556253-161172393719496704-qazz.ogg',
		// });

		// // wavesurfer.once('interaction', () => {});

		// fetch('https://dev.patrykstyla.com/audio/waveform/long_clip.json')
		// 	.then((response) => {
		// 		if (!response.ok) {
		// 			throw new Error('HTTP error ' + response.status);
		// 		}
		// 		return response.json();
		// 	})
		// 	.then((peaks) => {
		// 		console.log('loaded peaks! sample_rate: ' + peaks.sample_rate);

		// 		const minimap = MinimapPlugin.create({ container: '#waveform-minimap', height: 'auto' });
		// 		wavesurfer.registerPlugin(minimap);
		// 		// load peaks into wavesurfer.js
		// 		wavesurfer.load(
		// 			'https://dev.patrykstyla.com/audio/362257054829641758/763782256980131892/2023/July/1688216556253-161172393719496704-qazz.ogg',
		// 			peaks.data
		// 		);
		// 	})

		// 	.catch((e) => {
		// 		console.error('error', e);
		// 	});

		return () => {
			// wavesurfer.destroy();
		};
	}, []);

	return (
		<Box className="m-16">
			{/* <button
				onClick={() =>
					setSwitchAduio((prev) => {
						return !prev;
					})
				}
			>
				Switch
			</button> */}
			<Button
				onClick={(e) => {
					if (!playing) {
						props.audioRef.play();
						setPlaying((prev) => !prev);
						startTimer();
						e.currentTarget.innerHTML = 'Pause';
					} else {
						setPlaying((prev) => !prev);
						// source?.stop();
						clearInterval(props.intervalRef.current);

						props.audioRef.pause();
						e.currentTarget.innerHTML = 'Play';
					}
				}}
			>
				Play
			</Button>
			{/* <div id="waveform"></div>
			<div id="waveform-minimap"></div> */}
			{/* <div>
				<div id="zoomview-container"></div>
				<div id="overview-container"></div>
				<audio ref={audioElementRef} controls>
					<source
						src="https://dev.patrykstyla.com/audio/362257054829641758/763782256980131892/2023/July/1688216556253-161172393719496704-qazz.ogg"
						type='audio/ogg; codecs="vorbis"'
					/>
					Your browser does not support the audio element.
				</audio>
			</div> */}
			<DoubleSlider
				audioRef={props.audioRef}
				handleChange={handleChange}
				setStartEnd={setStartEnd}
				startEnd={startEnd}
				zoomInStartEnd={zoomInStartEnd}
				setIsSliderClicked={setIsSliderClicked}
			/>
			<Stack spacing={40} direction="row" alignItems="center" justifyContent="space-around">
				<VolumeSlider audioRef={props.audioRef} />
				<PlaybackSpeedSlider audioRef={props.audioRef} />
			</Stack>
			<div className="flex">
				<div className="flex-1 w-32">value 1: {formatDuration(Math.round(startEnd[0]))}</div>
				<div className="flex-1 w-32">Recorded in channel: {params.channel_id}</div>
				<div>
					<BasicTextFields startEnd={startEnd} setStartEnd={setStartEnd} audioRef={props.audioRef} />
				</div>
			</div>
			<br />
			value 2: {formatDuration(startEnd[1])}
			<br></br>
			Cropped length: {formatDuration(startEnd[1] - startEnd[0])}
			<br></br>
			<br></br>
			<br></br>
			<Button variant="contained">
				{props.isClip ? (
					<a href={`https://dev.patrykstyla.com/audio/clips/${params.guild_id}/${params.file_name}`}>
						Download
					</a>
				) : (
					<a
						href={`https://dev.patrykstyla.com/download/${params.guild_id}/${params.channel_id}/${params.year}/${params.month}/${params.file_name}.ogg`}
					>
						Download
					</a>
				)}
			</Button>
			<ClipDialog params={params} startEnd={startEnd} disabled={props.isClip} />
			<JamIt disabled={props.isClip} userGuilds={props.userGuilds} />
			{/* <Button variant="contained" onClick={handleClip}>
        <a
          href={`https://dev.patrykstyla.com/download/${params.guild_id}/${
            params.year
          }/${params.month}/${params.file_name}.ogg?start=${startEnd[0]}&end=${
            startEnd[1] - startEnd[0]
          }`}
        >
          Clip
        </a>
      </Button> */}
		</Box>
	);
}

function DoubleSlider(props: {
	startEnd: number[];
	setStartEnd: React.Dispatch<React.SetStateAction<number[]>>;
	handleChange: (event: Event, newValue: number | number[], activeThumb: number) => void;
	audioRef: HTMLAudioElement;
	zoomInStartEnd: number;
	setIsSliderClicked: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [min, max] = [-60, 60];
	return (
		<>
			<Slider
				sx={{
					'& .MuiSlider-thumb': {
						// height: 28,
						// width: 28,
						height: 25,
						width: 5,
						borderRadius: '1px'
						// transition: 'none',
					},
					'& .MuiSlider-track': {
						// transition: 'none',
					},

				}}
				max={props.audioRef.duration}
				getAriaLabel={() => 'Minimum distance'}
				value={props.startEnd}
				onChange={props.handleChange}
				valueLabelDisplay="auto"
				valueLabelFormat={value => <div>{formatDurationV2(value)}</div>}
				getAriaValueText={valuetext}
				disableSwap
			/>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mt: -2,
				}}
			>
				<TinyText>{formatDurationV2(props.startEnd[0])} </TinyText>
				<TinyText>{formatDurationV2(Math.round(props.audioRef.duration))}</TinyText>
			</Box>
			<Box>
				{/* Sub-Slider */}
				<Slider
					sx={{
						'& .MuiSlider-thumb': {
							height: 25,
							width: 5,
							borderRadius: '1px',
							transition: 'none',
						},
						'& .MuiSlider-track': {
							transition: 'none',
						},
					}}
					min={min}
					max={max}
					step={0.1}
					getAriaLabel={() => 'Minimum distance'}
					value={props.zoomInStartEnd}
					onChange={props.handleChange}
					onChangeCommitted={() => props.setIsSliderClicked(false)}
					valueLabelDisplay="auto"
					getAriaValueText={valuetext}

				/>
				<TinyText>{formatDuration(props.zoomInStartEnd)} </TinyText>
				<TinyText>{formatDuration(60)}</TinyText>
			</Box>
		</>
	);
}



function BasicTextFields(props: {
	startEnd: number[];
	setStartEnd: React.Dispatch<React.SetStateAction<number[]>>;
	audioRef: HTMLAudioElement;
}) {


	function SetStartEndWithTime(start: number, end: number) {
		props.setStartEnd([start, end]);
		props.audioRef.currentTime = start;
	}

	return (
		<>
			<LeftSlider startEnd={props.startEnd} SetStartEndWithTime={SetStartEndWithTime} audioRef={props.audioRef} setStartEnd={props.setStartEnd} />
			<RightSlider startEnd={props.startEnd} SetStartEndWithTime={SetStartEndWithTime} audioRef={props.audioRef} setStartEnd={props.setStartEnd} />
		</>

	);
}

function LeftSlider(props: { startEnd: number[], SetStartEndWithTime(start: number, end: number): void, setStartEnd: React.Dispatch<React.SetStateAction<number[]>>; audioRef: HTMLAudioElement; }) {
	const [isError, setIsError] = useState(false);
	let hours = Math.floor(props.startEnd[0] / 3600);
	var minutes = Math.floor((props.startEnd[0] % 3600) / 60);
	var seconds = Math.floor((props.startEnd[0] % 3600) % 60);

	function SetNewTime(currentValue: number, hours: number, multiplier: number) {
		let diff = Math.abs(currentValue - hours) * multiplier;

		if (currentValue >= hours) {
			props.SetStartEndWithTime(props.startEnd[0] + diff, props.startEnd[1]);
		}
		else {
			props.SetStartEndWithTime(props.startEnd[0] - diff, props.startEnd[1]);
		}
	}

	return <Box>
		<div>Left Slider</div>
		<TextField
			id="standard-basic"
			error={isError}
			label="Hours"
			variant="standard"
			type="number"
			value={hours}
			helperText={isError ? 'Out of range' : ''}
			inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
			onChange={(e) => {

				if ((e.target.value as any as number) * 3600 > props.audioRef.duration) {
					setIsError(true);
					props.audioRef.currentTime = props.audioRef.duration;
					props.setStartEnd((prev) => [props.audioRef.duration, prev[1]]);
					return;
				}
				if (typeof e.target.value !== "string" || e.target.value == "") return;

				setIsError(false);

				let currentValue = parseInt(e.target.value);
				if (currentValue > 60) {
					setIsError(true);
					return;
				}
				SetNewTime(currentValue, hours, 60 * 60)
			}} />
		<TextField
			id="standard-basic"
			error={isError}
			label="Minutes"
			variant="standard"
			type="number"
			value={minutes}
			helperText={isError ? 'Out of range' : ''}
			inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
			onChange={(e) => {
				if (typeof e.target.value !== "string" || e.target.value == "") return;

				setIsError(false);
				let currentValue = parseInt(e.target.value);
				if (currentValue > 60) {
					setIsError(true);
					return;
				}
				SetNewTime(currentValue, minutes, 60)

			}} />
		<TextField
			id="standard-basic"
			error={isError}
			label="Seconds"
			variant="standard"
			type="number"
			value={seconds}
			helperText={isError ? 'Out of range' : ''}
			inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
			onChange={(e) => {
				if (typeof e.target.value !== "string" || e.target.value == "") return;

				setIsError(false);

				let currentValue = parseInt(e.target.value);
				if (currentValue > 60) {
					setIsError(true);
					return;
				}

				SetNewTime(currentValue, seconds, 1)
			}} />
	</Box>;
}


function RightSlider(props: {
	startEnd: number[], SetStartEndWithTime(start: number, end: number): void,
	setStartEnd: React.Dispatch<React.SetStateAction<number[]>>;
	audioRef: HTMLAudioElement;
}) {
	const [isError, setIsError] = useState(false);
	let hours = Math.floor(props.startEnd[1] / 3600);
	var minutes = Math.floor((props.startEnd[1] % 3600) / 60);
	var seconds = Math.floor((props.startEnd[1] % 3600) % 60);

	function SetNewTime(currentValue: number, timeInSeconds: number, multiplier: number) {
		let diff = Math.abs(currentValue - timeInSeconds) * multiplier;

		if (currentValue >= timeInSeconds) {
			props.SetStartEndWithTime(props.startEnd[0], props.startEnd[1] + diff);
		}
		else {
			props.SetStartEndWithTime(props.startEnd[0], props.startEnd[1] - diff);
		}
	}

	return <Box>
		<div>Right Slider</div>
		<TextField
			id="standard-basic"
			error={isError}
			label="Hours"
			variant="standard"
			type="number"
			value={hours}
			helperText={isError ? 'Out of range' : ''}
			inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
			onChange={(e) => {
				if ((e.target.value as any as number) * 3600 > props.audioRef.duration) {
					setIsError(true);
					props.audioRef.currentTime = props.audioRef.duration;
					props.setStartEnd((prev) => [props.audioRef.duration, prev[1]]);
					return;
				}
				if (typeof e.target.value !== "string" || e.target.value == "") return;

				setIsError(false);

				let currentValue = parseInt(e.target.value);
				if (currentValue > 60) {
					setIsError(true);
					return;
				}
				SetNewTime(currentValue, hours, 60 * 60);
			}} />
		<TextField
			id="standard-basic"
			error={isError}
			label="Minutes"
			variant="standard"
			type="number"
			value={minutes}
			helperText={isError ? 'Out of range' : ''}
			inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
			onChange={(e) => {
				if (typeof e.target.value !== "string" || e.target.value == "") return;

				setIsError(false);

				let currentValue = parseInt(e.target.value);
				if (currentValue > 60) {
					setIsError(true);
					return;
				}
				SetNewTime(currentValue, minutes, 60);
			}} />
		<TextField
			id="standard-basic"
			error={isError}
			label="Seconds"
			variant="standard"
			type="number"
			value={seconds}
			helperText={isError ? 'Out of range' : ''}
			inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
			onChange={(e) => {
				if (typeof e.target.value !== "string" || e.target.value == "") return;

				setIsError(false);

				let currentValue = parseInt(e.target.value);
				if (currentValue > 60) {
					setIsError(true);
					return;
				}
				SetNewTime(currentValue, seconds, 1);
			}} />
	</Box>;
}





function VolumeSlider(props: { audioRef: HTMLAudioElement }) {
	const handleChangeVolume = (event: Event, newValue: number | number[]) => {
		setVolume(newValue as number);
		props.audioRef.volume = newValue as number;
	};
	// 0 current volume, 1 prev volume
	const [volume, setVolume] = useState(0.5);
	const [muted, setMuted] = useState(false);

	return (
		<Stack spacing={2} direction="row" sx={{ mb: 1, width: 200 }} alignItems="center">
			{muted ? (
				<VolumeMute
					onClick={() => {
						props.audioRef.muted = false;
						setMuted(false);
					}}
				/>
			) : (
				<VolumeDown
					onClick={() => {
						props.audioRef.muted = true;
						setMuted(true);
					}}
				/>
			)}

			<Slider
				sx={{
					'& .MuiSlider-thumb': {
						// height: 28,
						// width: 28,
					},
				}}
				max={1}
				step={0.01}
				getAriaLabel={() => 'Minimum distance'}
				value={volume}
				onChange={handleChangeVolume}
				valueLabelDisplay="auto"
				getAriaValueText={valuetext}
			/>
			<VolumeUp />
		</Stack>
	);
}

function PlaybackSpeedSlider(props: { audioRef: HTMLAudioElement }) {
	const handleChangePlaybackSpeed = (event: Event, newValue: number | number[]) => {
		setPlaybackSpeed(newValue as number);
		props.audioRef.playbackRate = newValue as number;
	};
	const [playbackSpeed, setPlaybackSpeed] = useState(1);
	return (
		<Stack spacing={2} direction="row" sx={{ mb: 1, width: 200 }} alignItems="center">
			<Slider
				sx={{
					'& .MuiSlider-thumb': {
						// height: 28,
						// width: 28,
					},
				}}
				max={10}
				step={0.1}
				getAriaLabel={() => 'Minimum distance'}
				value={playbackSpeed}
				onChange={handleChangePlaybackSpeed}
				valueLabelDisplay="auto"
				getAriaValueText={valuetext}
			/>
		</Stack>
	);
}


function JamIt(props: { disabled: boolean; userGuilds: UserGuilds[] | null }) {
	if (!props.disabled) return <></>;

	const [isError, setIsError] = useState<{ type: RespStatus; code: number }>({
		type: RespStatus.UNKOWN,
		code: 0,
	});
	const location = useLocation();
	const params = useParams();

	const handleJamIt = async () => {
		const req = fetch('https://dev.patrykstyla.com/jamit', {
			body: JSON.stringify({
				guild_id: params.guild_id as string,
				clip_name: params.file_name as string,
			}),

			credentials: 'include',

			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});

		const res = await req;
		if (!res.ok) {
			setIsError({ type: RespStatus.NOT_CONNECTED, code: 0 });
			setOpen(true);

			return;
		}
		const c = await res.json();

		console.log(c);

		if (c.code) {
			setIsError({ type: RespStatus.CONNECTED, code: c.code as number });
			setOpen(true);
		} else {
			// prob success or unhandled
		}
	};

	const style = {
		position: 'absolute' as const,
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: 400,
		bgcolor: 'background.paper',
		border: '2px solid #000',
		boxShadow: 24,
		p: 4,
	};

	const [open, setOpen] = React.useState(false);
	const handleClose = () => {
		setOpen(false), setIsError({ type: RespStatus.CONNECTED, code: 0 });
	};

	return (
		<>
			<Button onClick={handleJamIt} variant="contained">
				Jam It
			</Button>
			{/* if Error show a modal explaining the error */}
			{(isError.code > 0 || isError.type === RespStatus.NOT_CONNECTED) && (
				<div>
					<Modal
						open={open}
						onClose={handleClose}
						aria-labelledby="modal-modal-title"
						aria-describedby="modal-modal-description"
					>
						<Box sx={style}>
							<Typography id="modal-modal-title" variant="h6" component="h2">
								Error
							</Typography>
							<Typography id="modal-modal-description" sx={{ mt: 2 }}>
								error code: {isError.code}
								<br />
								TODO: proper messages
								<br />
								number 0 = I probably broke something
								<br />
								number 1 = bot is not in voice channel
								<br />
								number &gt;= 2 =¯\_(ツ)_/¯
							</Typography>
						</Box>
					</Modal>
				</div>
			)}
		</>
	);
}




function ClipDialog(props: { params: Readonly<Params<AudioParams>>; startEnd: number[]; disabled: boolean }) {
	const [open, setOpen] = useState(false);
	const [text, setText] = useState('');

	const handleClickOpen = () => {
		setOpen(true);
		setText('');
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<Button variant="contained" onClick={handleClickOpen} disabled={props.disabled}>
				Clip
			</Button>
			<Dialog open={open} onClose={handleClose}>
				<DialogContent>
					<DialogContentText>
						Enter a name for this clip. Will return an error if name is a duplicate. Leave blank for default
						name
					</DialogContentText>
					<TextField
						value={text}
						onChange={(e) => {
							setText(e.currentTarget.value);
						}}
						autoFocus
						margin="dense"
						id="name"
						label="Name"
						type="text"
						fullWidth
						variant="standard"
						autoComplete="off"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>

					<Button onClick={handleClose}>
						<a
							href={`https://dev.patrykstyla.com/download/${props.params.guild_id}/${props.params.channel_id
								}/${props.params.year}/${props.params.month}/${props.params.file_name}.ogg?start=${props.startEnd[0]
								}&end=${props.startEnd[1] - props.startEnd[0]}${text.length > 0 ? `&name=${text}` : ''}`}
						>
							Clip
						</a>
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}


function formatDuration(value: number) {
	const minute = Math.floor(value / 60);
	const secondLeft = Math.floor(value - minute * 60);
	return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
}

function formatDurationV2(value: number) {
	// if (typeof value === "number"  ) return 0;

	return new Date(value * 1000).toISOString().slice(11, 19);
}


