import { ThemeProvider, createTheme } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Clips from './clips';
import { FormDialog } from './components/FormDialog';
import { YearSelection } from './components/YearSelection';
import { LayoutsWithNavbar } from './layouts/LayoutsWithNavbar';
import { ProtectedLayout } from './layouts/ProtectedLayout';

// Extracted Components
const Metrics = React.lazy(() => import('./components/Metrics').then(m => ({ default: m.Metrics })));

// RTK Query & Redux
import { useDispatch } from 'react-redux';
import { useGetAuthDetailsQuery } from './app/apiSlice';
import { setGuildSelected } from './reducers/appSlice';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

function App() {
	const dispatch = useDispatch();
	const [hasToken, setHasToken] = useState(!!localStorage.getItem('token'));

	const {
		data: authData,
		isLoading,
		isError,
		refetch
	} = useGetAuthDetailsQuery(undefined, {
		// Only run the query if a token is marked as existing
		skip: !hasToken
	});

	const isLoggedIn = !!authData?.user && !isError;

	// Set initial guild selection if we have a guild in the URL and the query completes
	useEffect(() => {
		if (authData?.guilds) {
			const url = window.location.href;
			const split = url.split('/');
			const res = split[4];
			if (res) {
				const guild = authData.guilds.find(({ id }) => id === res) || null;
				dispatch(setGuildSelected(guild));
			}

			if (authData.token) {
				localStorage.setItem('token', authData.token);
			}
		}
	}, [authData, dispatch]);

	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		file: string | null;
	} | null>(null);

	// Discord oauth success handler
	useEffect(() => {
		window.onmessage = (e) => {
			if (e.origin !== 'https://dev.patrykstyla.com') return;

			console.log('message', e);
			if (e.data.success === 1) {
				console.log('Succ');

				// Setting a dummy token and setting hasToken to true
				if (!localStorage.getItem('token')) {
					localStorage.setItem('token', 'pending');
				}

				// Changing this state triggers React to un-skip the RTK query
				// so it automatically fetches without needing a refetch() or timeout!
				setHasToken(true);

				// Close the popup window slightly later so cookies and state can settle
				if (e.source && (e.source as Window).close) {
					setTimeout(() => {
						(e.source as Window).close();
					}, 200);
				}
			} else {
				console.error('something failed when authenticating');
			}
		};
	}, [setHasToken]);

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
					<LayoutsWithNavbar />
					<Box p={2}>
						{!isLoggedIn && !isLoading
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
					<Route path="/" element={<LayoutsWithNavbar />}>
						<Route path="/" element={<ProtectedLayout />} />
						<Route path=":guild_id" element={<Box p={2}>select from top navbar</Box>} />

						<Route
							path="/metrics"
							element={
								<Suspense fallback={<Box p={2}>Loading...</Box>}>
									<Metrics />
								</Suspense>
							}
						/>

						<Route path="/dashboard" element={<ProtectedLayout />}>
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
											/>
										}
									/>
								</Route>
								<Route path="clips">
									<Route path="" element={<Clips />} />
									<Route path=":file_name" element={<Clips />} />
								</Route>
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
