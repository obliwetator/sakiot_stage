import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import type { VoiceEvent } from "../../../app/apiSlice";

const LABELS: Record<string, string> = {
	SERVER_MUTE: "Muted (server)",
	SERVER_UNMUTE: "Unmuted (server)",
	SERVER_DEAFEN: "Deafened (server)",
	SERVER_UNDEAFEN: "Undeafened (server)",
	SELF_MUTE: "Muted",
	SELF_UNMUTE: "Unmuted",
	SELF_DEAFEN: "Deafened",
	SELF_UNDEAFEN: "Undeafened",
	SUPPRESS_ON: "Suppressed",
	SUPPRESS_OFF: "Unsuppressed",
	STREAM_START: "Started streaming",
	STREAM_STOP: "Stopped streaming",
	VIDEO_ON: "Camera on",
	VIDEO_OFF: "Camera off",
	CHANNEL_JOIN: "Joined channel",
	CHANNEL_LEAVE: "Left channel",
	CHANNEL_SWITCH: "Switched channel",
	RECORDING_PAUSE: "Recording paused",
	RECORDING_RESUME: "Recording resumed",
};

// Distinct color per event family. Tweakable; chosen to read against MUI
// primary blue track without clashing.
//
// Legend:
//   #ef4444 red    — mute toggles (SERVER_MUTE / SERVER_UNMUTE / SELF_MUTE / SELF_UNMUTE)
//   #a855f7 purple — deafen toggles (SERVER_DEAFEN / SERVER_UNDEAFEN / SELF_DEAFEN / SELF_UNDEAFEN)
//   #06b6d4 cyan   — channel transitions (CHANNEL_JOIN / CHANNEL_LEAVE / CHANNEL_SWITCH)
//   #eab308 yellow — suppress toggles (SUPPRESS_ON / SUPPRESS_OFF)
//   #22c55e green  — stream / video toggles (STREAM_START/STOP, VIDEO_ON/OFF)
//   #f97316 orange — recording pause/resume on bot recoverable disconnect (RECORDING_PAUSE / RECORDING_RESUME)
//   #9ca3af gray   — fallback for unrecognized event_type strings
function colorFor(t: string): string {
	if (t.endsWith("MUTE") || t.endsWith("UNMUTE")) return "#ef4444";
	if (t.endsWith("DEAFEN") || t.endsWith("UNDEAFEN")) return "#a855f7";
	if (t.startsWith("CHANNEL")) return "#06b6d4";
	if (t.startsWith("SUPPRESS")) return "#eab308";
	if (t.startsWith("STREAM") || t.startsWith("VIDEO")) return "#22c55e";
	if (t.startsWith("RECORDING")) return "#f97316";
	return "#9ca3af";
}

function formatOffset(ms: number): string {
	if (ms < 0) return "--:--";
	const total = Math.floor(ms / 1000);
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceEventMarkers(props: {
	events: VoiceEvent[];
	durationSec: number;
	audioRef: HTMLAudioElement;
}) {
	if (!Number.isFinite(props.durationSec) || props.durationSec <= 0)
		return null;

	return (
		<Box
			sx={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				pointerEvents: "none",
			}}
		>
			{props.events.map((e) => {
				const sec = e.offset_ms / 1000;
				if (sec < 0 || sec > props.durationSec) return null;
				const pct = (sec / props.durationSec) * 100;
				const label = LABELS[e.event_type] ?? e.event_type;
				return (
					<Tooltip
						key={`${e.user_id}-${e.offset_ms}-${e.event_type}`}
						title={`${label} @ ${formatOffset(e.offset_ms)}`}
						arrow
						disableInteractive
					>
						<Box
							onClick={() => {
								props.audioRef.currentTime = sec;
							}}
							onKeyDown={(ev) => {
								if (ev.key === "Enter" || ev.key === " ") {
									props.audioRef.currentTime = sec;
								}
							}}
							sx={{
								position: "absolute",
								left: `${pct}%`,
								top: "50%",
								transform: "translate(-50%, -50%)",
								width: 10,
								height: 10,
								borderRadius: "50%",
								bgcolor: colorFor(e.event_type),
								border: "1.5px solid rgba(255,255,255,0.85)",
								boxShadow: "0 0 2px rgba(0,0,0,0.6)",
								pointerEvents: "auto",
								cursor: "pointer",
								zIndex: 2,
								"&:hover": {
									transform: "translate(-50%, -50%) scale(1.4)",
								},
								transition: "transform 80ms ease-out",
							}}
						/>
					</Tooltip>
				);
			})}
		</Box>
	);
}
