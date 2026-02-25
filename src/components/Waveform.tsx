import { useEffect, useRef, useState } from "react";
import { Params } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { AudioParams } from "../Constants";

function WaveFormButton(props: { params: Readonly<Params<AudioParams>>, startEnd?: number[] }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const wavesurferRef = useRef<WaveSurfer | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (containerRef.current && !wavesurferRef.current) {
			wavesurferRef.current = WaveSurfer.create({
				container: containerRef.current,
				waveColor: "#4F4A85",
				progressColor: "#383351",
				barWidth: 2,
				barGap: 1,
				barRadius: 2,
				interact: false,
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
				wavesurferRef.current.load("", [normalizedPeaks], duration);
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

	return (
		<div>
			<button onClick={handleClick}>Generate Waveform</button>
			{error && <p style={{ color: "red", padding: "10px" }}>{error}</p>}
			<div ref={containerRef} style={{ width: "100%", height: "128px", backgroundColor: "#f5f5f5", border: "1px solid #ddd", borderRadius: "4px", marginTop: "10px" }}></div>
		</div>
	)
}

export default WaveFormButton;
