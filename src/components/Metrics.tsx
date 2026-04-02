import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ReactNode, useEffect, useState } from 'react';
import { useGetAuthDetailsQuery, useRefreshMutation } from '../app/apiSlice';

interface GuildInfo {
	id: string;
	name: string;
}

interface Metrics {
	total_guilds: number;
	active_voice_connections: number;
	uptime_seconds: number;
	commands_executed: number;
	messages_received: number;
	guilds: GuildInfo[];
	// Voice recording pipeline
	active_recordings: number;
	ffmpeg_spawn_failures: number;
	ffmpeg_process_crashes: number;
	audio_packets_received: number;
	audio_packets_dropped: number;
	// Discord gateway health
	gateway_reconnects: number;
	driver_reconnects: number;
	voice_state_updates_received: number;
	// Database health
	db_query_errors: number;
	db_insert_failures: number;
	// gRPC server health
	grpc_active_streams: number;
	// Process health
	process_rss_bytes: number;
	process_open_fds: number;
	tokio_active_tasks: number;
}

interface RecordingMetrics {
	active_recordings: number;
	ffmpeg_spawn_failures: number;
	ffmpeg_process_crashes: number;
	audio_packets_received: number;
	audio_packets_dropped: number;
}

interface VoiceState {
	user_id: string;
	channel_id: string;
	mute: boolean;
	deaf: boolean;
	self_mute: boolean;
	self_deaf: boolean;
	self_stream: boolean;
	self_video: boolean;
	suppress: boolean;
}

function formatUptime(seconds: number) {
	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor(seconds % (3600 * 24) / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = Math.floor(seconds % 60);
	const dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : '';
	const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
	const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
	const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
	return dDisplay + hDisplay + mDisplay + sDisplay || '0 seconds';
}

function formatBytes(bytes: number): string {
	if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
	return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── Small metric tile used inside group panels ───────────────────────────────
interface TileProps { label: string; value: ReactNode; warn?: boolean }

function Tile({ label, value, warn }: TileProps) {
	return (
		<Box sx={{
			flex: '1 1 130px',
			maxWidth: 200,
			p: 1.5,
			borderRadius: 1,
			bgcolor: 'background.paper',
			border: warn ? '1px solid #f44336' : '1px solid',
			borderColor: warn ? '#f44336' : 'divider',
		}}>
			<Typography fontSize={11} color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
				{label}
			</Typography>
			<Typography variant="h6" fontSize={18} fontWeight={600}>
				{value}
			</Typography>
		</Box>
	);
}

// ─── Larger stat card for the overview row ────────────────────────────────────
function StatCard({ label, value }: { label: string; value: ReactNode }) {
	return (
		<Box sx={{ flex: '1 1 160px' }}>
			<Card>
				<CardContent>
					<Typography color="text.secondary" fontSize={13} gutterBottom>{label}</Typography>
					<Typography variant="h5" fontWeight={600}>{value}</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}

// ─── Bordered group panel ─────────────────────────────────────────────────────
function GroupPanel({ title, children }: { title: string; children: ReactNode }) {
	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Typography
				fontSize={11}
				fontWeight={700}
				color="text.secondary"
				sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}
			>
				{title}
			</Typography>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
				{children}
			</Box>
		</Paper>
	);
}

export function Metrics() {
	const [selectedGuild, setSelectedGuild] = useState<GuildInfo | null>(null);
	const [metrics, setMetrics] = useState<Metrics | null>(null);
	const [localUptime, setLocalUptime] = useState<number>(0);
	const [refreshCounter, setRefreshCounter] = useState(0);
	const [guildRecordingMetrics, setGuildRecordingMetrics] = useState<RecordingMetrics | null>(null);
	const [voiceUsers, setVoiceUsers] = useState<VoiceState[]>([]);
	const [userStartTimes, setUserStartTimes] = useState<Record<string, number>>({});
	const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000));

	const hasToken = !!localStorage.getItem('token');
	useGetAuthDetailsQuery(undefined, { skip: !hasToken });
	const [refreshToken] = useRefreshMutation();
	const isAdmin = true;

	// ── Global metrics WebSocket ────────────────────────────────────────────────
	useEffect(() => {
		if (!isAdmin) return;
		const ws = new WebSocket('wss://dev.patrykstyla.com/api/dashboard/stream?name=global');
		ws.onopen = () => ws.send(JSON.stringify({ action: 'subscribe', topic: 'global' }));
		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event_type === 'METRICS_UPDATE') {
					const m: Metrics = JSON.parse(data.payload);
					setMetrics(m);
					setLocalUptime(m.uptime_seconds);
				}
			} catch (e) { console.error('metrics parse error', e); }
		};
		ws.onclose = async (event) => {
			if (event.code === 4001) {
				try { await refreshToken().unwrap(); setRefreshCounter(p => p + 1); } catch { /* ignored */ }
			}
		};
		return () => {
			if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ action: 'unsubscribe', topic: 'global' }));
			ws.close();
		};
	}, [isAdmin, refreshCounter]);

	// ── Uptime tick ─────────────────────────────────────────────────────────────
	useEffect(() => {
		if (localUptime <= 0) return;
		const id = setInterval(() => setLocalUptime(p => p + 1), 1000);
		return () => clearInterval(id);
	}, [localUptime > 0]);

	// ── Current-time tick (for "active for" display) ────────────────────────────
	useEffect(() => {
		const id = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
		return () => clearInterval(id);
	}, []);

	// ── Per-guild voice WebSocket ───────────────────────────────────────────────
	useEffect(() => {
		if (!isAdmin || !selectedGuild) {
			setVoiceUsers([]);
			setUserStartTimes({});
			setGuildRecordingMetrics(null);
			return;
		}
		const ws = new WebSocket(`wss://dev.patrykstyla.com/api/dashboard/stream?name=guild_voice_${selectedGuild.id}`);
		ws.onopen = () => ws.send(JSON.stringify({ action: 'subscribe', topic: `guild_voice:${selectedGuild.id}` }));
		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event_type === 'GUILD_VOICE_UPDATE') {
					const p = JSON.parse(data.payload);
					setVoiceUsers(p.voice_states);
					setUserStartTimes(p.user_start_times);
					if (p.recording_metrics) setGuildRecordingMetrics(p.recording_metrics);
				}
			} catch (e) { console.error('guild voice parse error', e); }
		};
		ws.onclose = async (event) => {
			if (event.code === 4001) {
				try { await refreshToken().unwrap(); setRefreshCounter(p => p + 1); } catch { /* ignored */ }
			}
		};
		return () => {
			if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ action: 'unsubscribe', topic: `guild_voice:${selectedGuild.id}` }));
			ws.close();
		};
	}, [isAdmin, selectedGuild, refreshCounter]);

	if (!isAdmin) {
		return <Box p={2}><Typography color="error">Not authorized.</Typography></Box>;
	}

	const L = 'Loading...';
	const m = metrics;

	return (
		<Box sx={{ flexGrow: 1, p: 3, maxWidth: 1400 }}>

			{/* ── Header row ─────────────────────────────────────────────────── */}
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
				<Typography variant="h4" fontWeight={700}>Bot Metrics Dashboard</Typography>
				<Box sx={{ width: 280 }}>
					<Autocomplete
						size="small"
						options={m?.guilds || []}
						getOptionLabel={(o) => o.name}
						value={selectedGuild}
						onChange={(_, v) => setSelectedGuild(v)}
						isOptionEqualToValue={(o, v) => o.id === v.id}
						renderInput={(params) => <TextField {...params} label="Guild" />}
					/>
				</Box>
			</Box>

			{/* ── Overview ───────────────────────────────────────────────────── */}
			<Typography variant="overline" color="text.secondary" fontWeight={700}>Overview</Typography>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1, mb: 3 }}>
				<StatCard label="Total Guilds"             value={m ? m.total_guilds : L} />
				<StatCard label="Active Voice Connections" value={m ? m.active_voice_connections : L} />
				<StatCard label="Commands Executed"        value={m ? m.commands_executed : L} />
				<StatCard label="Messages Received"        value={m ? m.messages_received.toLocaleString() : L} />
				<StatCard label="Uptime"                   value={m ? formatUptime(localUptime) : L} />
			</Box>

			<Divider sx={{ mb: 3 }} />

			{/* ── Two-column middle section ───────────────────────────────────── */}
			<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>

				{/* Left: Voice Recording Pipeline */}
				<Box sx={{ flex: '1 1 340px' }}>
					<GroupPanel title="Voice Recording Pipeline">
						<Tile label="Active Recordings"     value={m ? m.active_recordings : L} />
						<Tile label="Packets Received"      value={m ? m.audio_packets_received.toLocaleString() : L} />
						<Tile label="Packets Dropped"       value={m ? m.audio_packets_dropped.toLocaleString() : L} warn={!!m && m.audio_packets_dropped > 0} />
						<Tile label="FFmpeg Spawn Failures" value={m ? m.ffmpeg_spawn_failures : L} warn={!!m && m.ffmpeg_spawn_failures > 0} />
						<Tile label="FFmpeg Crashes"        value={m ? m.ffmpeg_process_crashes : L} warn={!!m && m.ffmpeg_process_crashes > 0} />
					</GroupPanel>
				</Box>

				{/* Right: health panels stacked */}
				<Box sx={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 2 }}>

					<GroupPanel title="Discord Gateway">
						<Tile label="Voice State Updates" value={m ? m.voice_state_updates_received.toLocaleString() : L} />
						<Tile label="Gateway Reconnects"  value={m ? m.gateway_reconnects : L} warn={!!m && m.gateway_reconnects > 0} />
						<Tile label="Driver Reconnects"   value={m ? m.driver_reconnects : L}  warn={!!m && m.driver_reconnects > 0} />
					</GroupPanel>

					<GroupPanel title="Database & gRPC">
						<Tile label="DB Query Errors"   value={m ? m.db_query_errors : L}   warn={!!m && m.db_query_errors > 0} />
						<Tile label="DB Insert Failures" value={m ? m.db_insert_failures : L} warn={!!m && m.db_insert_failures > 0} />
						<Tile label="Active gRPC Streams" value={m ? m.grpc_active_streams : L} />
					</GroupPanel>

					<GroupPanel title="Process">
						<Tile label="Memory (RSS)"    value={m ? formatBytes(m.process_rss_bytes) : L} />
						<Tile label="Open FDs"        value={m ? m.process_open_fds : L} />
						<Tile label="Tokio Tasks"     value={m ? m.tokio_active_tasks : L} />
					</GroupPanel>

				</Box>
			</Box>

			{/* ── Per-guild section ───────────────────────────────────────────── */}
			<Divider sx={{ my: 3 }} />
			<Typography variant="h5" fontWeight={600} gutterBottom>
				Active Voice Users {selectedGuild ? `— ${selectedGuild.name}` : ''}
			</Typography>

			{!selectedGuild ? (
				<Typography color="text.secondary">Select a guild above to view voice users and recording metrics.</Typography>
			) : (
				<>
					{guildRecordingMetrics && (
						<Box sx={{ mb: 2 }}>
							<GroupPanel title="Guild Recording Metrics">
								<Tile label="Active Recordings"     value={guildRecordingMetrics.active_recordings} />
								<Tile label="Packets Received"      value={guildRecordingMetrics.audio_packets_received.toLocaleString()} />
								<Tile label="Packets Dropped"       value={guildRecordingMetrics.audio_packets_dropped.toLocaleString()} warn={guildRecordingMetrics.audio_packets_dropped > 0} />
								<Tile label="FFmpeg Spawn Failures" value={guildRecordingMetrics.ffmpeg_spawn_failures} warn={guildRecordingMetrics.ffmpeg_spawn_failures > 0} />
								<Tile label="FFmpeg Crashes"        value={guildRecordingMetrics.ffmpeg_process_crashes} warn={guildRecordingMetrics.ffmpeg_process_crashes > 0} />
							</GroupPanel>
						</Box>
					)}

					{voiceUsers.length === 0 ? (
						<Typography color="text.secondary">No users currently in voice channels.</Typography>
					) : (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
							{voiceUsers.map((user) => (
								<Box sx={{ flex: '1 1 280px', maxWidth: 360 }} key={user.user_id}>
									<Card variant="outlined">
										<CardContent>
											<Typography variant="subtitle2" fontWeight={700} gutterBottom>
												{user.user_id}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Channel: {user.channel_id}
											</Typography>
											{userStartTimes[user.user_id] && (
												<Typography variant="body2" color="text.secondary">
													Active for: {formatUptime(currentTime - userStartTimes[user.user_id])}
												</Typography>
											)}
											<Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
												{user.mute      && <Typography variant="caption" sx={{ bgcolor: 'warning.dark', px: 0.75, py: 0.25, borderRadius: 0.5 }}>Server Muted</Typography>}
												{user.deaf      && <Typography variant="caption" sx={{ bgcolor: 'warning.dark', px: 0.75, py: 0.25, borderRadius: 0.5 }}>Server Deafened</Typography>}
												{user.self_mute && <Typography variant="caption" sx={{ bgcolor: 'action.selected', px: 0.75, py: 0.25, borderRadius: 0.5 }}>Muted</Typography>}
												{user.self_deaf && <Typography variant="caption" sx={{ bgcolor: 'action.selected', px: 0.75, py: 0.25, borderRadius: 0.5 }}>Deafened</Typography>}
												{user.self_stream && <Typography variant="caption" sx={{ bgcolor: 'info.dark', px: 0.75, py: 0.25, borderRadius: 0.5 }}>Streaming</Typography>}
											</Box>
										</CardContent>
									</Card>
								</Box>
							))}
						</Box>
					)}
				</>
			)}
		</Box>
	);
}
