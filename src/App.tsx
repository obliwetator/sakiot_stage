import {
	CssBaseline,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	Menu,
	MenuItem,
	TextField,
	ThemeProvider,
	createTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AudioInterface } from './AudioInterface';
import { AudioParams, IndividualFileArray, Months, UserGuilds } from './Constants';
import { ItemsEl } from './LeftNavMenu/yearSelection';
import { useAppDispatch, useAppSelector } from './app/hooks';
import Clips from './clips';
import CustomizedTreeView from './components/TreeView';
import ResponsiveAppBar from './navbar';

function YearSelection(props: {
	setContextMenu: React.Dispatch<
		React.SetStateAction<{
			mouseX: number;
			mouseY: number;
			file: string | null;
		} | null>
	>;
	setMenuItems: React.Dispatch<
		React.SetStateAction<
			| {
					name: string;
					cb: () => void;
			  }[]
			| null
		>
	>;
	setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
	guildSelected: UserGuilds | null;
	userGuilds: UserGuilds[] | null;
}) {
	const params = useParams();

	return (
		// render the audio playback functionality if we have the full url

		<div className="flex">
			{/* <AllYears
				setContextMenu={props.setContextMenu}
				setMenuItems={props.setMenuItems}
				setFormOpen={props.setFormOpen}
				guildSelected={props.guildSelected}
			/> */}
			<CustomizedTreeView guildSelected={props.guildSelected} />
			{params.year && <AudioInterface isClip={false} userGuilds={props.userGuilds} />}
		</div>
	);
}

{
	/* // <div id="audio-player-container">
    //   <p>Audio Player</p>

    //   <button
    //     id="play-icon"
    //     onClick={(e) => {
    //       if (!playing) {
    //         e.currentTarget.children[0].innerHTML = "play_arrow";
    //       } else {
    //         e.currentTarget.children[0].innerHTML = "pause";
    //       }
    //       setPlaying((prev) => !prev);
    //     }}
    //   >
    //     {" "}
    //     <span className="material-icons">pause</span>
    //   </button>
    //   <span id="current-time" className="time">
    //     0:00
    //   </span>
    //   {/* Current audio time slider */
}

//   {/* Volume slider */}
//   <output id="volume-output">100</output>
//   <input type="range" id="volume-slider" max="100" defaultValue="100" />
//   <button id="mute-icon"></button>
// </div> */}

const ProtectedLayout = (props: {
	isLoggedIn: boolean;
	guildSelected: UserGuilds | null;
	setGuildSelected: React.Dispatch<React.SetStateAction<UserGuilds | null>>;
	userGuilds: UserGuilds[] | null;
}) => {
	const navigate = useNavigate();
	const params = useParams<AudioParams>();

	const handleGuildSelect = (index: number) => {
		const value = props.userGuilds![index];
		props.setGuildSelected(value);
		navigate(value.id);
	};
	useEffect(() => {
		if (params.guild_id) {
			const guild = props.userGuilds!.find((element) => element.id === params.guild_id!)!;
			props.setGuildSelected(guild);
		}
	});

	if (!props.userGuilds) {
		return <>No guilds</>;
	}

	const guilds = props.userGuilds?.map((value, index) => {
		return (
			<Grid xs={1} key={index}>
				<div onClick={() => handleGuildSelect(index)}>{value.name}</div>
			</Grid>
		);
	});
	if (!props.guildSelected) {
		return (
			<Box sx={{ flexGrow: 1 }}>
				SELECT A SERVER
				<Grid container justifyContent="center" alignItems="center" minHeight={300}>
					{guilds}
				</Grid>
			</Box>
		);
	}

	return <Outlet />;
};

function Dashboard() {
	return <div>TODO: BIG MENU WITH A LOT OF FEATURES THAT WILL SURELY GET ADDED SOON</div>;
}

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

function LayoutsWithNavbar(props: {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	guildSelected: UserGuilds | null;
	setGuildSelected: React.Dispatch<React.SetStateAction<UserGuilds | null>>;
	userGuilds: UserGuilds[] | null;
}) {
	return (
		<div className="h-full">
			{/* Your navbar component */}
			<ResponsiveAppBar
				isLoggedIn={props.isLoggedIn}
				setIsLoggedIn={props.setIsLoggedIn}
				guildSelected={props.guildSelected}
				setGuildSelected={props.setGuildSelected}
				userGuilds={props.userGuilds}
			/>

			{/* This Outlet is the place in which react-router will render your components that you need with the navbar */}
			<Outlet />

			{/* You can add a footer to get fancy in here :) */}
		</div>
	);
}

interface User {
	guild_id: string;
	permissions: number;
	icon: number;
	name: string;
}

function App() {
	// useAppSelector((state) => {
	// 	state.counter.value;
	// });
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

			const guilds = (await values[1].json()) as UserGuilds[];

			setUser((await values[0].json()) as User);
			setUserGuilds(guilds);

			const url = window.location.href;
			const split = url.split('/');
			const res = split[5];
			if (res) {
				console.log('here');
				const guild = guilds.find(({ id }) => id === res) as UserGuilds | null;
				setGuildSelected(guild);
			}

			localStorage.setItem('token', (await values[2].json()).token as any);
			setIsLoggedIn(true);
			setIsLoading(false);
		});
	};

	const disp = useAppDispatch();
	const sel = useAppSelector((state) => state.token.value);
	useEffect(() => {
		console.log('laa');
		// disp(setToken('alalaal'));
		if (localStorage.getItem('token')) {
			getUserDetails();
		} else {
			// do nothing. User is not authenticated
		}
	}, []);

	// This prob way too complicated
	// We pass the setContext menu in order to set the coordinates when the onContextMenu event is triggered
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

			// Discord call sucesfull
			if (e.data.success === 1) {
				console.log('Succ');
				setTimeout(() => {
					getUserDetails();
				}, 100);
			} else {
				console.error('sommething failed when authenticating');
			}
		};
	}, []);

	// When the onContextMenu is triggered the clicked element set the menu that it wants to display along with a function to execute to handle the menu
	// TODO: clear the memu items after the menu is closed (in case we forget to override the menu items when we open a new context menu which has no implementation)
	const [menuItems, setMenuItems] = useState<{ name: string; cb: () => void }[] | null>(null);
	const handleClose = (e: any) => {
		// Don't allow the click to click elements below it
		e.stopPropagation();
		setContextMenu(null);
		// This only clears the items when we DON'T select any of the menu items
		// The menu items themselves must clear it or we do something smarter
		// setMenuItems(null);
	};

	const [isFormOpen, setIsFormOpen] = useState(false);

	const menu = menuItems?.map((el, value) => {
		return (
			<MenuItem
				key={value}
				onClick={() => {
					el.cb();
					//   setContextMenu(null);
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
				: // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
				  // Other native context menus might behave different.
				  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
				  null
		);
	};

	// Return the App component.
	if (isLoading || !isLoggedIn) {
		if (!isLoggedIn) {
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
						<div>You are not logged in or you are not authorized to view this content</div>
					</BrowserRouter>
				</ThemeProvider>
			);
		} else {
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
						<div>wait. If it takes too long somehting is broken or you are not logged in</div>
					</BrowserRouter>
				</ThemeProvider>
			);
		}
	} else {
		return (
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<BrowserRouter>
					{/* <Button variant="contained">Hello World</Button> */}
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
							<Route path=":guild_id" element={'select from top navbar'} />
							<Route />

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
									<Route path="" element={'select from top navbar'} />
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
									<Route path="clips"></Route>
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
					onClose={(e) => handleClose(e)}
					anchorReference="anchorPosition"
					anchorPosition={
						contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
					}
					onContextMenu={(e) => handleContextMenu(e)}
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
}

function FormDialog(props: {
	isOpen: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setContextMenu: React.Dispatch<
		React.SetStateAction<{
			mouseX: number;
			mouseY: number;
			file: string | null;
		} | null>
	>;
	contextMenu: {
		mouseX: number;
		mouseY: number;
		file: string | null;
	} | null;
}) {
	//   const DBcontext = useContext(DB);

	//   let transaction = DBcontext.transaction("ids", "readwrite");
	//   let ids = transaction.objectStore("ids"); // (2)

	//   let request = ids.add("a", "b");

	//   request.onsuccess = function () {
	//     // (4)
	//     console.log("Book added to the store", request.result);
	//   };

	//   request.onerror = function () {
	//     console.log("Error", request.error);
	//   };

	const [formText, setFormText] = useState('');

	const handleClickOpen = () => {
		props.setOpen(true);
	};

	const handleClose = () => {
		props.setContextMenu(null);
		props.setOpen(false);
	};

	// TODO: DB
	const handleAddNote = () => {
		console.log('FIXME');
		// let transaction = DBcontext.transaction('ids', 'readwrite');
		// let ids = transaction.objectStore('ids'); // (2)

		// let request = ids.put(formText, props.contextMenu!.file!);

		// request.onsuccess = function () {
		// 	// (4)
		// };

		// request.onerror = function () {
		// 	console.log('Error', request.error);
		// };
		// props.setOpen(false);
	};

	return (
		<div>
			<Dialog open={props.isOpen} onClose={handleClose}>
				<DialogContent>
					<DialogContentText>Add a custom note for the recording</DialogContentText>
					<TextField
						value={formText}
						onChange={(e) => {
							setFormText(e.currentTarget.value);
						}}
						autoFocus
						margin="dense"
						id="name"
						label="Note"
						type="text"
						fullWidth
						variant="standard"
						autoComplete="off"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleAddNote}>Add Note</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export function Favorites(props: {
	index: number;
	onToggle: (index: number) => void;
	active: boolean;
	setContextMenu: React.Dispatch<
		React.SetStateAction<{
			mouseX: number;
			mouseY: number;
			file: string | null;
		} | null>
	>;
	setMenuItems: React.Dispatch<
		React.SetStateAction<
			| {
					name: string;
					cb: () => void;
			  }[]
			| null
		>
	>;
	setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
	favorites: {
		favorites: IndividualFileArray | null;
		setFavorites: React.Dispatch<React.SetStateAction<IndividualFileArray | null>>;
	};
}) {
	const items: JSX.Element[] = [];
	if (props.favorites.favorites) {
		props.favorites.favorites.forEach((el, index) => {
			const timestamp = parseInt(el.file.slice(0, 13));
			const date = new Date(timestamp);

			const item = (
				<ItemsEl
					key={index}
					file={el}
					month_name={Months[date.getMonth()] as any as string}
					year={date.getFullYear()}
					setContextMenu={props.setContextMenu}
					setMenuItems={props.setMenuItems}
					setFormOpen={props.setFormOpen}
					favorites={{
						favorites: props.favorites.favorites,
						setFavorites: props.favorites.setFavorites,
					}}
				></ItemsEl>
			);

			items.push(item);
		});
		return (
			<>
				<div
					className={
						'accordion ' +
						(props.active ? 'bg-green-800' : 'bg-green-500') +
						' hover:bg-green-700 active:bg-red-800'
					}
					onClick={() => {
						props.onToggle(props.index);
					}}
				>
					Favorites
				</div>
				<div
					key={props.index}
					className="bg-green-500 overflow-hidden"
					style={props.active ? { display: 'block' } : { display: 'none' }}
				>
					{items}
				</div>
			</>
		);
	} else {
		return <div>No favs</div>;
	}
}

export default App;
