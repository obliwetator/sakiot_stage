import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGetAuthDetailsQuery } from '../app/apiSlice';
import { useAppSelector } from '../app/hooks';
import { setGuildSelected } from '../reducers/appSlice';

interface GuildInfo {
	id: string;
	name: string;
}

interface Metrics {
	total_guilds: number;
	active_voice_connections: number;
	uptime_seconds: number;
	commands_executed: number;
	guilds: GuildInfo[];
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

	const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

export function Dashboard() {
	const dispatch = useDispatch();
	const selectedGuild = useAppSelector((state) => state.app.guildSelected);

	const [metrics, setMetrics] = useState<Metrics | null>(null);
	const [localUptime, setLocalUptime] = useState<number>(0);

	const hasToken = !!localStorage.getItem('token');
	const { data: authData } = useGetAuthDetailsQuery(undefined, {
		skip: !hasToken
	});

	// TODO: Check against database if user is admin
	// For now we mock it as true, later use authData?.user?.id
	const isAdmin = true;

	useEffect(() => {
		if (!isAdmin) return;

		const wsUrl = `wss://dev.patrykstyla.com/api/dashboard/stream?name=global`;

		console.log("Connecting to WebSocket at", wsUrl);
		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('Connected to metrics WebSocket');
			ws.send(JSON.stringify({ action: "subscribe", topic: "global" }));
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event_type === "METRICS_UPDATE") {
					const metricsData: Metrics = JSON.parse(data.payload);
					setMetrics(metricsData);
					setLocalUptime(metricsData.uptime_seconds);
				}
			} catch (e) {
				console.error('Failed to parse metrics data', e);
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket Error:', error);
		};

		ws.onclose = () => {
			console.log('Disconnected from metrics WebSocket');
		};

		return () => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ action: "unsubscribe", topic: "global" }));
			}
			ws.close();
		};
	}, [isAdmin]);

	useEffect(() => {
		if (localUptime > 0) {
			const interval = setInterval(() => {
				setLocalUptime(prev => prev + 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [localUptime > 0]);

	const [voiceUsers, setVoiceUsers] = useState<VoiceState[]>([]);
	const [channelStartTimes, setChannelStartTimes] = useState<Record<string, number>>({});
	const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000));

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(Math.floor(Date.now() / 1000));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!isAdmin || !selectedGuild) {
			setVoiceUsers([]);
			setChannelStartTimes({});
			return;
		}

		const wsUrl = `wss://dev.patrykstyla.com/api/dashboard/stream?name=guild_voice_${selectedGuild.id}`;
		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			ws.send(JSON.stringify({ action: "subscribe", topic: `guild_voice:${selectedGuild.id}` }));
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event_type === "GUILD_VOICE_UPDATE") {
					const payload = JSON.parse(data.payload);
					setVoiceUsers(payload.voice_states);
					setChannelStartTimes(payload.channel_start_times);
				}
			} catch (e) {
				console.error('Failed to parse voice data', e);
			}
		};

		return () => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ action: "unsubscribe", topic: `guild_voice:${selectedGuild.id}` }));
			}
			ws.close();
		};
	}, [isAdmin, selectedGuild]);

	if (!isAdmin) {
		return (
			<Box p={2}>
				<Typography color="error">You are not authorized to view the admin dashboard.</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ flexGrow: 1, p: 3 }}>
			<Box sx={{ mb: 2, width: 300 }}>
				<Autocomplete
					size="small"
					options={metrics?.guilds || []}
					getOptionLabel={(option) => option.name}
					value={selectedGuild as unknown as GuildInfo | null}
					onChange={(_, newValue) => dispatch(setGuildSelected(newValue as any))}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					renderInput={(params) => <TextField {...params} label="Search Guild" />}
				/>
			</Box>
			<Typography variant="h4" component="h2" gutterBottom>
				Bot Metrics Dashboard
			</Typography>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
				<Box sx={{ flex: '1 1 200px' }}>
					<Card>
						<CardContent>
							<Typography color="textSecondary" gutterBottom>
								Total Guilds
							</Typography>
							<Typography variant="h5" component="div">
								{metrics ? metrics.total_guilds : 'Loading...'}
							</Typography>
						</CardContent>
					</Card>
				</Box>
				<Box sx={{ flex: '1 1 200px' }}>
					<Card>
						<CardContent>
							<Typography color="textSecondary" gutterBottom>
								Active Voice Connections
							</Typography>
							<Typography variant="h5" component="div">
								{metrics ? metrics.active_voice_connections : 'Loading...'}
							</Typography>
						</CardContent>
					</Card>
				</Box>
				<Box sx={{ flex: '1 1 200px' }}>
					<Card>
						<CardContent>
							<Typography color="textSecondary" gutterBottom>
								Commands Executed
							</Typography>
							<Typography variant="h5" component="div">
								{metrics ? metrics.commands_executed : 'Loading...'}
							</Typography>
						</CardContent>
					</Card>
				</Box>
				<Box sx={{ flex: '1 1 200px' }}>
					<Card>
						<CardContent>
							<Typography color="textSecondary" gutterBottom>
								Uptime
							</Typography>
							<Typography variant="h6" component="div">
								{metrics ? formatUptime(localUptime) : 'Loading...'}
							</Typography>
						</CardContent>
					</Card>
				</Box>
			</Box>

			<Box mt={4}>
				<Typography variant="h5" gutterBottom>
					Active Voice Users {selectedGuild ? `(${selectedGuild.name})` : ''}
				</Typography>
				{!selectedGuild ? (
					<Typography>Select a guild to view active voice users.</Typography>
				) : voiceUsers.length === 0 ? (
					<Typography>No users in voice channels.</Typography>
				) : (
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
						{voiceUsers.map((user) => (
							<Box sx={{ flex: '1 1 300px' }} key={user.user_id}>
								<Card>
									<CardContent>
										<Typography variant="subtitle1">User: {user.user_id}</Typography>
										<Typography variant="body2" color="textSecondary">
											Channel: {user.channel_id}
											{channelStartTimes[user.channel_id] &&
												` (Active for: ${formatUptime(currentTime - channelStartTimes[user.channel_id])})`}
										</Typography>
										<Typography variant="body2" color="textSecondary">
											Muted: {user.mute ? 'Yes' : 'No'} | Deafened: {user.deaf ? 'Yes' : 'No'}
										</Typography>
										<Typography variant="body2" color="textSecondary">
											Self Muted: {user.self_mute ? 'Yes' : 'No'} | Self Deafened: {user.self_deaf ? 'Yes' : 'No'}
										</Typography>
									</CardContent>
								</Card>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</Box>
	);
}
