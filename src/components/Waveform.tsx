import { useEffect, useRef, useState } from "react";
import { Params } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
// @ts-ignore
import Button from '@mui/material/Button';
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import { AudioParams } from "../Constants";

function WaveFormButton(props: { params: Readonly<Params<AudioParams>>, startEnd?: number[] }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const wavesurferRef = useRef<WaveSurfer | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [zoomLevel, setZoomLevel] = useState(1);
	const [minPxPerSec, setMinPxPerSec] = useState(1); // default minimum px per second

	useEffect(() => {
		if (containerRef.current && !wavesurferRef.current) {
			wavesurferRef.current = WaveSurfer.create({
				container: containerRef.current,
				waveColor: "#ff00ff", // magenta
				progressColor: "#cc00cc", // darker magenta for progress
				barWidth: 2,
				barGap: 1,
				barRadius: 2,
				interact: false,
				plugins: [
					TimelinePlugin.create({
						// Not providing a container renders it inside the main wavesurfer wrapper
						height: 20,
						timeInterval: 60,
						primaryLabelInterval: 600,
						style: {
							fontSize: '12px',
							color: '#6a6a6a',
						}
					}),
				],
			});
		}
		return () => {
			if (wavesurferRef.current) {
				wavesurferRef.current.destroy();
				wavesurferRef.current = null;
			}
		};
	}, []);

	const handleClick = async () => {
		setError(null);
		try {
			const res = await fetch(`https://dev.patrykstyla.com/audio/waveform/${props.params.guild_id}/${props.params.channel_id}/${props.params.year}/${props.params.month}/${props.params.file_name}`, {
				credentials: 'include',
				headers: {
					// Expecting binary data for waveform
					Accept: 'application/octet-stream',
				},
			});

			if (!res.ok) {
				console.error(res);
				setError("Failed to fetch waveform data.");
				return;
			}

			const buffer = await res.arrayBuffer();

			const view = new DataView(buffer);
			// const version = view.getUint32(0, true);
			const flags = view.getUint32(4, true);
			const sampleRate = view.getUint32(8, true);
			const samplesPerPixel = view.getUint32(12, true);
			const length = view.getUint32(16, true);

			const is16Bit = flags === 1;
			const peaks = [];
			let offset = 20;

			for (let i = 0; i < length; i++) {
				if (is16Bit) {
					peaks.push(view.getInt16(offset, true));
					offset += 2;
				} else {
					peaks.push(view.getInt8(offset));
					offset += 1;
				}
			}

			let max = 0;
			for (let i = 0; i < peaks.length; i++) {
				const absPeak = Math.abs(peaks[i]);
				if (absPeak > max) {
					max = absPeak;
				}
			}
			const normalizedPeaks = max > 0 ? peaks.map((p) => p / max) : peaks;

			const duration = (length * samplesPerPixel) / sampleRate;

			if (wavesurferRef.current) {
				wavesurferRef.current.on('interaction', (newTime) => {
					// We can implement seek here if needed
				});
				// According to WaveSurfer v7, we pass the URL, peaks array of arrays, and duration.
				// URL is empty as we only use peaks.
				wavesurferRef.current.load("", [peaks], duration);
			}
		} catch (err) {
			console.error(err);
			setError("Error generating waveform.");
		}
	}

	// Update waveform position based on startEnd
	useEffect(() => {
		if (wavesurferRef.current && props.startEnd && props.startEnd.length > 0) {
			const duration = wavesurferRef.current.getDuration();
			if (duration > 0) {
				const time = props.startEnd[0];
				wavesurferRef.current.setTime(time);
			}
		}
	}, [props.startEnd]);

	const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newZoomLevel = Number(e.target.value);
		setZoomLevel(newZoomLevel);
		if (wavesurferRef.current) {
			wavesurferRef.current.zoom(newZoomLevel);
		}
	};

	// Reset zoom level to initial on waveform ready
	useEffect(() => {
		if (wavesurferRef.current) {
			wavesurferRef.current.on('ready', () => {
				setZoomLevel(0); // 0 or minimum possible value usually auto-fits the screen
			});
		}
	}, [wavesurferRef.current]);

	return (
		<div style={{ width: "100%", maxWidth: "100%", marginBottom: "20px" }}>
			<Button variant="contained" onClick={handleClick}>Generate Waveform </Button>
			<p>You have to click every time you want to generate a waveform. (for now). Be patient for big files</p>
			{error && <p style={{ color: "red", padding: "10px" }}>{error}</p>}
			<div style={{ marginTop: "10px", marginBottom: "10px" }}>
				<label>
					Zoom: <input type="range" min="0" max="10" value={zoomLevel} onChange={handleZoom} style={{ width: "200px" }} />
				</label>
			</div>
			<div ref={containerRef} style={{ width: "100%", height: "148px", backgroundColor: "transparent", border: "none", borderRadius: "4px", paddingBottom: "10px" }}></div>
		</div>
	)
}

export default WaveFormButton;
