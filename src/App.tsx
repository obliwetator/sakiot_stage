import { ThemeProvider, createTheme } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { UserGuilds } from './Constants';
import Clips from './clips';

// Extracted Components
import { Dashboard } from './components/Dashboard';
import { FormDialog } from './components/FormDialog';
import { YearSelection } from './components/YearSelection';
import { LayoutsWithNavbar } from './layouts/LayoutsWithNavbar';
import { ProtectedLayout } from './layouts/ProtectedLayout';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

interface User {
	guild_id: string;
	permissions: number;
	icon: number;
	name: string;
}

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const [userGuilds, setUserGuilds] = useState<UserGuilds[] | null>(null);
	const [guildSelected, setGuildSelected] = useState<UserGuilds | null>(null);

	const getUserDetails = () => {
		const users = fetch('https://dev.patrykstyla.com/api/users/@me', {
			credentials: 'include',
		});

		const guilds = fetch('https://dev.patrykstyla.com/api/users/@me/guilds', {
			credentials: 'include',
		});

		const token = fetch('https://dev.patrykstyla.com/api/token', {
			credentials: 'include',
		});

		Promise.all([users, guilds, token]).then(async (values) => {
			if (!(values[0].status >= 200) || !(values[0].status < 300)) {
				setIsLoading(false);
				return;
			}

			if (!(values[1].status >= 200) || !(values[1].status < 300)) {
				setIsLoading(false);
				return;
			}

			if (!(values[2].status >= 200) || !(values[2].status < 300)) {
				setIsLoading(false);
				return;
			}

			const guildsData = (await values[1].json()) as UserGuilds[];

			setUser((await values[0].json()) as User);
			setUserGuilds(guildsData);

			const url = window.location.href;
			const split = url.split('/');
			const res = split[5];
			if (res) {
				console.log('here');
				const guild = guildsData.find(({ id }) => id === res) as UserGuilds | null;
				setGuildSelected(guild);
			}

			localStorage.setItem('token', (await values[2].json()).token as any);
			setIsLoggedIn(true);
			setIsLoading(false);
		});
	};

	useEffect(() => {
		console.log('laa');
		if (localStorage.getItem('token')) {
			getUserDetails();
		} else {
			// do nothing. User is not authenticated
			setIsLoading(false);
		}
	}, []);

	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		file: string | null;
	} | null>(null);

	useEffect(() => {
		window.onmessage = (e) => {
			if (e.origin !== 'https://dev.patrykstyla.com') {
				return;
			}

			console.log('message', e);

			if (e.data.success === 1) {
				console.log('Succ');
				setTimeout(() => {
					getUserDetails();
				}, 100);
			} else {
				console.error('something failed when authenticating');
			}
		};
	}, []);

	const [menuItems, setMenuItems] = useState<{ name: string; cb: () => void }[] | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);

	const handleClose = (e: any) => {
		e.stopPropagation();
		setContextMenu(null);
	};

	const menu = menuItems?.map((el, value) => {
		return (
			<MenuItem
				key={value}
				onClick={() => {
					el.cb();
				}}
			>
				{el.name}
			</MenuItem>
		);
	});

	const handleContextMenu = (event: React.MouseEvent) => {
		console.log(event.target as HTMLBaseElement);
		event.preventDefault();
		setContextMenu(
			contextMenu === null
				? {
					mouseX: event.clientX + 2,
					mouseY: event.clientY - 6,
					file: null,
				}
				: null
		);
	};

	if (isLoading || !isLoggedIn) {
		return (
			<ThemeProvider theme={darkTheme}>
				<BrowserRouter>
					<LayoutsWithNavbar
						isLoggedIn={isLoggedIn}
						setIsLoggedIn={setIsLoggedIn}
						guildSelected={guildSelected}
						setGuildSelected={setGuildSelected}
						userGuilds={userGuilds}
					/>
					<Box p={2}>
						{!isLoggedIn
							? "You are not logged in or you are not authorized to view this content"
							: "Loading..."}
					</Box>
				</BrowserRouter>
			</ThemeProvider>
		);
	}

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<BrowserRouter>
				<Routes>
					<Route
						path="/"
						element={
							<LayoutsWithNavbar
								isLoggedIn={isLoggedIn}
								setIsLoggedIn={setIsLoggedIn}
								guildSelected={guildSelected}
								setGuildSelected={setGuildSelected}
								userGuilds={userGuilds}
							/>
						}
					>
						<Route
							path="/"
							element={
								<ProtectedLayout
									isLoggedIn={isLoggedIn}
									guildSelected={guildSelected}
									setGuildSelected={setGuildSelected}
									userGuilds={userGuilds}
								/>
							}
						/>
						<Route path=":guild_id" element={<Box p={2}>select from top navbar</Box>} />

						<Route
							path="/dashboard"
							element={
								<ProtectedLayout
									isLoggedIn={isLoggedIn}
									guildSelected={guildSelected}
									setGuildSelected={setGuildSelected}
									userGuilds={userGuilds}
								/>
							}
						>
							<Route path=":guild_id">
								<Route path="" element={<Box p={2}>select from top navbar</Box>} />
								<Route path="audio">
									<Route
										path=""
										element={
											<YearSelection
												setContextMenu={setContextMenu}
												setMenuItems={setMenuItems}
												setFormOpen={setIsFormOpen}
												guildSelected={guildSelected}
												userGuilds={userGuilds}
											/>
										}
									/>
									<Route
										path=":channel_id/:year/:month/:file_name"
										element={
											<YearSelection
												setContextMenu={setContextMenu}
												setMenuItems={setMenuItems}
												setFormOpen={setIsFormOpen}
												guildSelected={guildSelected}
												userGuilds={userGuilds}
											/>
										}
									/>
								</Route>
								<Route path="clips" />
							</Route>
							<Route path="audio">
								<Route
									path=":guild_id/:channel_id/:year/:month/:file_name"
									element={
										<YearSelection
											setContextMenu={setContextMenu}
											setMenuItems={setMenuItems}
											setFormOpen={setIsFormOpen}
											guildSelected={guildSelected}
											userGuilds={userGuilds}
										/>
									}
								/>
								<Route
									path=":guild_id"
									element={
										<YearSelection
											setContextMenu={setContextMenu}
											setMenuItems={setMenuItems}
											setFormOpen={setIsFormOpen}
											guildSelected={guildSelected}
											userGuilds={userGuilds}
										/>
									}
								/>
							</Route>
							<Route path="clips">
								<Route
									path=":guild_id"
									element={<Clips guildSelected={guildSelected} userGuilds={userGuilds} />}
								/>
								<Route
									path=":guild_id/:file_name"
									element={<Clips guildSelected={guildSelected} userGuilds={userGuilds} />}
								/>
							</Route>
						</Route>
					</Route>
				</Routes>
			</BrowserRouter>
			<Menu
				open={contextMenu !== null}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
				}
				onContextMenu={handleContextMenu}
			>
				{menu}
			</Menu>
			<FormDialog
				setOpen={setIsFormOpen}
				isOpen={isFormOpen}
				setContextMenu={setContextMenu}
				contextMenu={contextMenu}
			/>
		</ThemeProvider>
	);
}

export default App;
