import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDownloadFileMutation } from "../../app/apiSlice";
import type { AudioParams, UserGuilds } from "../../Constants";
import { formatDuration } from "../../utils/formatTime";
import { ClipDialog } from "./ClipDialog";
import { DoubleSlider } from "./DoubleSlider";
import { JamIt } from "./JamIt";
import { PlaybackSpeedSlider } from "./PlaybackSpeedSlider";
import { SilenceButton } from "./SilenceButton";
import { TimeEditors } from "./TimeEditor";
import { VolumeSlider } from "./VolumeSlider";

const ArrowKeySkip = 5;
const CtrlArrowKeySkip = 30;

export function RangeSlider(props: {
	audioRef: HTMLAudioElement;
	intervalRef: React.MutableRefObject<number | undefined>;
	isClip: boolean;
	userGuilds: UserGuilds[] | null;
	isSilence: boolean;
	trueDuration?: number | null;
}) {
	const [actualDuration, setActualDuration] = useState(
		props.trueDuration && Number.isFinite(props.trueDuration)
			? props.trueDuration
			: Number.isFinite(props.audioRef.duration)
				? props.audioRef.duration
				: 0,
	);

	const [playing, setPlaying] = useState(false);
	const [startEnd, setStartEnd] = useState<number[]>([
		props.audioRef.currentTime || 0,
		actualDuration,
	]);
	const [zoomInStartEnd, setZoomInStartEnd] = useState<number>(0);
	const [isSliderClicked, setIsSliderClicked] = useState(false);

	const params = useParams<AudioParams>();
	const [downloadFile] = useDownloadFileMutation();

	useEffect(() => {
		if (props.trueDuration && Number.isFinite(props.trueDuration)) {
			setActualDuration(props.trueDuration);
			setStartEnd((prev) => [
				prev[0],
				Math.max(prev[1], props.trueDuration as number),
			]);
		}
	}, [props.trueDuration]);

	useEffect(() => {
		const handleArrowKeys = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") {
				const skip = event.ctrlKey ? CtrlArrowKeySkip : ArrowKeySkip;
				setStartEnd((s) => [s[0] + skip, s[1]]);
				props.audioRef.currentTime += skip;
			} else if (event.key === "ArrowLeft") {
				const skip = event.ctrlKey ? CtrlArrowKeySkip : ArrowKeySkip;
				setStartEnd((s) => [s[0] - skip, s[1]]);
				props.audioRef.currentTime -= skip;
			} else {
				return;
			}
			setZoomInStartEnd(0);
		};
		window.addEventListener("keydown", handleArrowKeys);
		return () => window.removeEventListener("keydown", handleArrowKeys);
	}, [props.audioRef]);

	const startTimer = useCallback(() => {
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
					}
					return 0;
				});
			}
			setStartEnd((prev) => [props.audioRef.currentTime, prev[1]]);
		}, 1000);
	}, [isSliderClicked, props.audioRef, props.intervalRef]);

	const togglePlay = useCallback(() => {
		setPlaying((prev) => {
			if (prev) {
				clearInterval(props.intervalRef.current);
				props.audioRef.pause();
				return false;
			}
			props.audioRef.play();
			startTimer();
			return true;
		});
	}, [props.audioRef, props.intervalRef, startTimer]);

	useEffect(() => {
		const handleSpace = (event: KeyboardEvent) => {
			if (event.key !== " " && event.code !== "Space") return;
			const target = event.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			)
				return;
			event.preventDefault();
			togglePlay();
		};
		window.addEventListener("keydown", handleSpace);
		return () => window.removeEventListener("keydown", handleSpace);
	}, [togglePlay]);

	useEffect(() => {
		if (isSliderClicked) startTimer();
		return () => clearInterval(props.intervalRef.current);
	}, [isSliderClicked, startTimer, props.intervalRef.current]);

	const handleChange = (
		_event: Event,
		newValue: number | number[],
		activeThumb: number,
	) => {
		const minDistance = 1;
		if (!Array.isArray(newValue)) {
			setIsSliderClicked(true);
			if (startEnd[0] + newValue < 0) {
				setStartEnd([0, startEnd[1]]);
				setZoomInStartEnd(0);
				return;
			} else if (startEnd[0] + newValue + minDistance > startEnd[1]) {
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
			const newStart = Math.min(newValue[0], startEnd[1] - minDistance);
			setStartEnd([newStart, startEnd[1]]);
		} else {
			const newEnd = Math.max(newValue[1], startEnd[0] + minDistance);
			setStartEnd([startEnd[0], newEnd]);
		}
		setZoomInStartEnd(0);
	};

	const handleDownload = async () => {
		const url = props.isClip
			? `audio/clips/${params.guild_id}/${params.file_name}`
			: `download/${params.guild_id}/${params.channel_id}/${params.year}/${params.month}/${params.file_name}.ogg${props.isSilence ? "?silence=true" : ""}`;
		try {
			const blob = await downloadFile(url).unwrap();
			const objectUrl = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = objectUrl;
			a.download = params.file_name ?? "";
			a.click();
			URL.revokeObjectURL(objectUrl);
		} catch (e) {
			console.error("Download failed", e);
		}
	};

	return (
		<Box sx={{ m: { xs: 1, md: 8 } }}>
			<Button variant="contained" onClick={togglePlay}>
				{playing ? "Pause" : "Play"}
			</Button>
			<DoubleSlider
				audioRef={props.audioRef}
				handleChange={handleChange}
				setStartEnd={setStartEnd}
				startEnd={startEnd}
				zoomInStartEnd={zoomInStartEnd}
				setIsSliderClicked={setIsSliderClicked}
			/>
			<Stack
				spacing={{ xs: 2, md: 8 }}
				direction={{ xs: "column", md: "row" }}
				alignItems={{ xs: "stretch", md: "center" }}
				justifyContent="space-around"
				sx={{ my: 2 }}
			>
				<VolumeSlider audioRef={props.audioRef} />
				<PlaybackSpeedSlider audioRef={props.audioRef} />
			</Stack>
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					gap: 1,
				}}
			>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					value 1: {formatDuration(Math.round(startEnd[0]))}
				</Box>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					Recorded in channel: {params.channel_id}
					{(() => {
						const parts = (params.file_name ?? "").split("-");
						const userId = parts[1];
						return userId ? (
							<Box sx={{ fontSize: 12, opacity: 0.75 }}>User ID: {userId}</Box>
						) : null;
					})()}
				</Box>
				<Box>
					<TimeEditors
						startEnd={startEnd}
						setStartEnd={setStartEnd}
						audioRef={props.audioRef}
					/>
				</Box>
			</Box>
			<br />
			value 2: {formatDuration(startEnd[1])}
			<br />
			Cropped length: {formatDuration(startEnd[1] - startEnd[0])}
			<br />
			<br />
			<br />
			<Button variant="contained" onClick={handleDownload}>
				Download
			</Button>
			<ClipDialog params={params} startEnd={startEnd} disabled={props.isClip} />
			<SilenceButton params={params} isSilence={props.isSilence} />
			<JamIt disabled={props.isClip} userGuilds={props.userGuilds} />
		</Box>
	);
}
