import MenuIcon from '@mui/icons-material/Menu';
import { Select, SelectChangeEvent } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { PATH_PREFIX_FOR_LOGGED_USERS, UserGuilds } from './Constants';
import Login from './login/login';

const pages = ['Audio', 'Clips', 'DashBoard'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function ResponsiveAppBar(props: {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	guildSelected: UserGuilds | null;
	setGuildSelected: React.Dispatch<React.SetStateAction<UserGuilds | null>>;
	userGuilds: UserGuilds[] | null;
}) {
	const navigate = useNavigate();
	const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

	const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget);
	};
	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseMenuNav = (name: string) => {
		setAnchorElNav(null);

		if (!props.guildSelected) {
			console.log('a');
			navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}`);
			return;
		}
		switch (name) {
			case 'Audio':
				// TODO: Dynamic need auth
				navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}/audio/${props.guildSelected.id}`);
				break;

			case 'Clips':
				// TODO: Dynamic need auth
				navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}/clips/${props.guildSelected.id}`);
				break;
			case 'DashBoard':
				// TODO: Dynamic need auth
				navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}`);
				break;
		}
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	return (
		<AppBar position="static">
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleOpenNavMenu}
							color="inherit"
						>
							<MenuIcon />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: 'block', md: 'none' },
							}}
						>
							{pages.map((page) => (
								<MenuItem key={page} onClick={handleCloseNavMenu}>
									<Typography textAlign="center">{page}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>

					{/* Desktop */}
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						{pages.map((page) => (
							<Button
								key={page}
								onClick={() => {
									handleCloseMenuNav(page);
								}}
								sx={{ my: 2, color: 'white', display: 'block' }}
							>
								{page}
							</Button>
						))}
						{props.guildSelected ? (
							<MenuItem>
								Select Serevr:
								<BasicSelect
									guildSelected={props.guildSelected}
									setGuildSelected={props.setGuildSelected}
									userGuilds={props.userGuilds}
								/>
							</MenuItem>
						) : (
							''
						)}
					</Box>
					<Login isLoggedIn={props.isLoggedIn} setIsLoggedIn={props.setIsLoggedIn} />
					<Box sx={{ flexGrow: 0 }}>
						<Tooltip title="Open settings">
							<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
								<Avatar alt="Remy Sharp" src="/pepega.png" />
							</IconButton>
						</Tooltip>
						<Menu
							sx={{ mt: '45px' }}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}
						>
							{settings.map((setting) => (
								<MenuItem key={setting} onClick={handleCloseUserMenu}>
									<Typography textAlign="center">{setting}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
export default ResponsiveAppBar;

function BasicSelect(props: {
	guildSelected: UserGuilds | null;
	setGuildSelected: React.Dispatch<React.SetStateAction<UserGuilds | null>>;
	userGuilds: UserGuilds[] | null;
}) {
	const navigate = useNavigate();
	const params = useParams();
	const location = useLocation();
	const handleChange = (event: SelectChangeEvent) => {
		const index = props.userGuilds!.map((item) => item.name).indexOf(event.target.value);
		if (!params.guild_id) {
			props.setGuildSelected(props.userGuilds![index]);
			// If there is no guild id param dont do navigate, just change the state and the menu
			return;
		}

		props.setGuildSelected(props.userGuilds![index]);
		const pathname = location.pathname;
		// const replaced_path = pathname.replace(params.guild_id as any as string, props.userGuilds![index].id);

		const result = pathname.split(params.guild_id);

		navigate(result[0] + props.userGuilds![index].id);
	};

	const guilds = props.userGuilds?.map((value, index) => {
		return (
			<MenuItem key={index} value={value.name}>
				{value.name}
			</MenuItem>
		);
	});

	return (
		<Box sx={{ minWidth: 120 }}>
			<FormControl fullWidth>
				<InputLabel id="demo-simple-select-label">Server</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					label="Server"
					onChange={(e) => {
						handleChange(e);
					}}
					value={props.guildSelected ? props.guildSelected.name : ''}
				>
					{guilds}
				</Select>
			</FormControl>
		</Box>
	);
}
