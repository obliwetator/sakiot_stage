import { useEffect, useState } from "react";
import { useRefreshMutation } from "../../app/apiSlice";
import { Metrics, RecordingMetrics, VoiceState } from "./types";

export function useMetricsStream(enabled: boolean) {
	const [metrics, setMetrics] = useState<Metrics | null>(null);
	const [localUptime, setLocalUptime] = useState<number>(0);
	const [refreshCounter, setRefreshCounter] = useState(0);
	const [refreshToken] = useRefreshMutation();

	useEffect(() => {
		if (!enabled) return;
		const ws = new WebSocket(
			"wss://dev.patrykstyla.com/api/dashboard/stream?name=global",
		);
		ws.onopen = () =>
			ws.send(JSON.stringify({ action: "subscribe", topic: "global" }));
		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event_type === "METRICS_UPDATE") {
					const m: Metrics = JSON.parse(data.payload);
					setMetrics(m);
					setLocalUptime(m.uptime_seconds);
				}
			} catch (e) {
				console.error("metrics parse error", e);
			}
		};
		ws.onclose = async (event) => {
			if (event.code === 4001) {
				try {
					await refreshToken().unwrap();
					setRefreshCounter((p) => p + 1);
				} catch {
					/* ignored */
				}
			}
		};
		return () => {
			if (ws.readyState === WebSocket.OPEN)
				ws.send(JSON.stringify({ action: "unsubscribe", topic: "global" }));
			ws.close();
		};
	}, [enabled, refreshCounter]);

	useEffect(() => {
		if (localUptime <= 0) return;
		const id = setInterval(() => setLocalUptime((p) => p + 1), 1000);
		return () => clearInterval(id);
	}, [localUptime > 0]);

	return {
		metrics,
		localUptime,
		bumpRefresh: () => setRefreshCounter((p) => p + 1),
		refreshCounter,
	};
}

export function useGuildVoiceStream(
	enabled: boolean,
	guildId: string | null,
	refreshCounter: number,
) {
	const [voiceUsers, setVoiceUsers] = useState<VoiceState[]>([]);
	const [userStartTimes, setUserStartTimes] = useState<Record<string, number>>(
		{},
	);
	const [guildRecordingMetrics, setGuildRecordingMetrics] =
		useState<RecordingMetrics | null>(null);
	const [, setLocalBump] = useState(0);
	const [refreshToken] = useRefreshMutation();

	useEffect(() => {
		if (!enabled || !guildId) {
			setVoiceUsers([]);
			setUserStartTimes({});
			setGuildRecordingMetrics(null);
			return;
		}
		const ws = new WebSocket(
			`wss://dev.patrykstyla.com/api/dashboard/stream?name=guild_voice_${guildId}`,
		);
		ws.onopen = () =>
			ws.send(
				JSON.stringify({
					action: "subscribe",
					topic: `guild_voice:${guildId}`,
				}),
			);
		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event_type === "GUILD_VOICE_UPDATE") {
					const p = JSON.parse(data.payload);
					setVoiceUsers(p.voice_states);
					setUserStartTimes(p.user_start_times);
					if (p.recording_metrics)
						setGuildRecordingMetrics(p.recording_metrics);
				}
			} catch (e) {
				console.error("guild voice parse error", e);
			}
		};
		ws.onclose = async (event) => {
			if (event.code === 4001) {
				try {
					await refreshToken().unwrap();
					setLocalBump((p) => p + 1);
				} catch {
					/* ignored */
				}
			}
		};
		return () => {
			if (ws.readyState === WebSocket.OPEN)
				ws.send(
					JSON.stringify({
						action: "unsubscribe",
						topic: `guild_voice:${guildId}`,
					}),
				);
			ws.close();
		};
	}, [enabled, guildId, refreshCounter]);

	return { voiceUsers, userStartTimes, guildRecordingMetrics };
}

export function useNowTick() {
	const [currentTime, setCurrentTime] = useState<number>(
		Math.floor(Date.now() / 1000),
	);
	useEffect(() => {
		const id = setInterval(
			() => setCurrentTime(Math.floor(Date.now() / 1000)),
			1000,
		);
		return () => clearInterval(id);
	}, []);
	return currentTime;
}
