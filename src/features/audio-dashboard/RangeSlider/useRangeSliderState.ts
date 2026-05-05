import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";

const ArrowKeySkip = 5;
const CtrlArrowKeySkip = 30;
const MinDistance = 1;

export interface RangeSliderState {
	playing: boolean;
	startEnd: number[];
	setStartEnd: Dispatch<SetStateAction<number[]>>;
	zoomInStartEnd: number;
	setIsSliderClicked: Dispatch<SetStateAction<boolean>>;
	handleChange: (
		event: Event,
		newValue: number | number[],
		activeThumb: number,
	) => void;
	togglePlay: () => void;
	pinEnd: () => void;
}

export function useRangeSliderState(args: {
	audioRef: HTMLAudioElement;
	intervalRef: MutableRefObject<number | undefined>;
	trueDuration?: number | null;
	liveStartedAt?: number | null;
}): RangeSliderState {
	const [actualDuration, setActualDuration] = useState(
		args.trueDuration && Number.isFinite(args.trueDuration)
			? args.trueDuration
			: Number.isFinite(args.audioRef.duration)
				? args.audioRef.duration
				: 0,
	);
	const [playing, setPlaying] = useState(false);
	const [startEnd, setStartEnd] = useState<number[]>([
		args.audioRef.currentTime || 0,
		actualDuration,
	]);
	const [zoomInStartEnd, setZoomInStartEnd] = useState<number>(0);
	const [isSliderClicked, setIsSliderClicked] = useState(false);
	const [rightPinned, setRightPinned] = useState(false);

	useEffect(() => {
		if (args.trueDuration && Number.isFinite(args.trueDuration)) {
			setActualDuration(args.trueDuration);
			if (!rightPinned) {
				setStartEnd((prev) => [
					prev[0],
					Math.max(prev[1], args.trueDuration as number),
				]);
			}
		}
	}, [args.trueDuration, rightPinned]);

	useEffect(() => {
		if (!args.liveStartedAt) return;
		const startedAt = args.liveStartedAt;
		const tick = () => {
			const dur = (Date.now() - startedAt) / 1000;
			if (dur <= 0) return;
			setActualDuration(dur);
			if (!rightPinned) {
				setStartEnd((prev) => [prev[0], Math.max(prev[1], dur)]);
			}
		};
		tick();
		const id = window.setInterval(tick, 250);
		return () => window.clearInterval(id);
	}, [args.liveStartedAt, rightPinned]);

	useEffect(() => {
		const audio = args.audioRef;
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onTime = () => {
			if (!isSliderClicked) setStartEnd((prev) => [audio.currentTime, prev[1]]);
		};
		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("timeupdate", onTime);
		return () => {
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("timeupdate", onTime);
		};
	}, [args.audioRef, isSliderClicked]);

	useEffect(() => {
		const handleArrowKeys = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") {
				const skip = event.ctrlKey ? CtrlArrowKeySkip : ArrowKeySkip;
				setStartEnd((s) => [s[0] + skip, s[1]]);
				args.audioRef.currentTime += skip;
			} else if (event.key === "ArrowLeft") {
				const skip = event.ctrlKey ? CtrlArrowKeySkip : ArrowKeySkip;
				setStartEnd((s) => [s[0] - skip, s[1]]);
				args.audioRef.currentTime -= skip;
			} else {
				return;
			}
			setZoomInStartEnd(0);
		};
		window.addEventListener("keydown", handleArrowKeys);
		return () => window.removeEventListener("keydown", handleArrowKeys);
	}, [args.audioRef]);

	const startTimer = useCallback(() => {
		clearInterval(args.intervalRef.current);
		args.intervalRef.current = setInterval(() => {
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
			setStartEnd((prev) => [args.audioRef.currentTime, prev[1]]);
		}, 1000);
	}, [args.audioRef, args.intervalRef, isSliderClicked]);

	const togglePlay = useCallback(() => {
		setPlaying((prev) => {
			if (prev) {
				clearInterval(args.intervalRef.current);
				args.audioRef.pause();
				return false;
			}
			args.audioRef.play();
			startTimer();
			return true;
		});
	}, [args.audioRef, args.intervalRef, startTimer]);

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: intervalRef.current is mutable; including it clears the playback timer on each render.
	useEffect(() => {
		if (isSliderClicked) startTimer();
		return () => clearInterval(args.intervalRef.current);
	}, [isSliderClicked, startTimer]);

	const handleChange = (
		_event: Event,
		newValue: number | number[],
		activeThumb: number,
	) => {
		if (!Array.isArray(newValue)) {
			setIsSliderClicked(true);
			if (startEnd[0] + newValue < 0) {
				setStartEnd([0, startEnd[1]]);
				setZoomInStartEnd(0);
				return;
			} else if (startEnd[0] + newValue + MinDistance > startEnd[1]) {
				setStartEnd([startEnd[1] - MinDistance, startEnd[1]]);
				args.audioRef.play();
				setZoomInStartEnd(0);
				return;
			}
			const diff = newValue - zoomInStartEnd;
			setStartEnd([startEnd[0] + diff, startEnd[1]]);
			args.audioRef.currentTime = startEnd[0] + diff;
			setZoomInStartEnd(newValue);
			return;
		}

		if (activeThumb === 0) {
			args.audioRef.currentTime = newValue[0];
			const newStart = Math.min(newValue[0], startEnd[1] - MinDistance);
			setStartEnd([newStart, startEnd[1]]);
		} else {
			const newEnd = Math.max(newValue[1], startEnd[0] + MinDistance);
			setStartEnd([startEnd[0], newEnd]);
			setRightPinned(true);
		}
		setZoomInStartEnd(0);
	};

	return {
		playing,
		startEnd,
		setStartEnd,
		zoomInStartEnd,
		setIsSliderClicked,
		handleChange,
		togglePlay,
		pinEnd: () => setRightPinned(true),
	};
}
