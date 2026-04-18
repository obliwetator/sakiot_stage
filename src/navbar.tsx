import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import BarChartIcon from '@mui/icons-material/BarChart';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MenuIcon from '@mui/icons-material/Menu';
import MovieIcon from '@mui/icons-material/Movie';

import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { PATH_PREFIX_FOR_LOGGED_USERS, UserGuilds } from './Constants';
import Login from './login/login';

type PageName = 'Audio' | 'Clips' | 'Metrics' | 'Stamps' | 'Admin';

const pages: PageName[] = ['Audio', 'Clips', 'Metrics', 'Stamps'];
const settings = ['Profile', 'Account', 'Metrics', 'Logout'];

const pageIcons: Record<PageName, React.ReactElement> = {
	Audio: <AudiotrackIcon />,
	Clips: <MovieIcon />,
	Metrics: <BarChartIcon />,
	Stamps: <BookmarkIcon />,
	Admin: <AdminPanelSettingsIcon />,
};

const ADMIN_BIT = 0x8n;
const MANAGE_GUILD_BIT = 0x20n;
function isGuildAdmin(g: UserGuilds | null): boolean {
	if (!g) return false;
	if (g.owner) return true;
	try {
		const bits = BigInt(g.permissions);
		return (bits & (ADMIN_BIT | MANAGE_GUILD_BIT)) !== 0n;
	} catch {
		return false;
	}
}

function ResponsiveAppBar(props: {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	guildSelected: UserGuilds | null;
	setGuildSelected: React.Dispatch<React.SetStateAction<UserGuilds | null>>;
	userGuilds: UserGuilds[] | null;
}) {
	const navigate = useNavigate();
	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const navigateTo = (name: PageName) => {
		if (!props.guildSelected && name !== 'Metrics' && name !== 'Stamps') {
			navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}`);
			return;
		}
		switch (name) {
			case 'Admin':
				navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}/${props.guildSelected?.id}/admin/cooldowns`);
				break;
			case 'Audio':
				navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}/${props.guildSelected?.id}/audio`);
				break;
			case 'Clips':
				navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}/${props.guildSelected?.id}/clips`);
				break;
			case 'Metrics':
				navigate(props.guildSelected?.id ? `/metrics/${props.guildSelected.id}` : `/metrics`);
				break;
			case 'Stamps':
				navigate(props.guildSelected?.id ? `/stamps/${props.guildSelected.id}` : `/stamps`);
				break;
		}
	};

	const handleDesktopNavClick = (name: PageName) => {
		navigateTo(name);
	};

	const handleDrawerNavClick = (name: PageName) => {
		setDrawerOpen(false);
		navigateTo(name);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const visiblePages: PageName[] = isGuildAdmin(props.guildSelected) ? [...pages, 'Admin'] : pages;

	const drawer = (
		<Box sx={{ width: 280 }} role="presentation">
			<Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
				<Avatar alt="user" src="/pepega.png" />
				<Typography variant="subtitle1" noWrap>
					{props.isLoggedIn ? 'Account' : 'Guest'}
				</Typography>
			</Box>
			<Divider />
			{props.userGuilds && props.userGuilds.length > 0 ? (
				<Box sx={{ p: 2 }}>
					<BasicSelect
						guildSelected={props.guildSelected}
						setGuildSelected={props.setGuildSelected}
						userGuilds={props.userGuilds}
					/>
				</Box>
			) : null}
			<Divider />
			<List subheader={<ListSubheader>Navigate</ListSubheader>}>
				{visiblePages.map((page) => (
					<ListItem key={page} disablePadding>
						<ListItemButton onClick={() => handleDrawerNavClick(page)}>
							<ListItemIcon>{pageIcons[page]}</ListItemIcon>
							<ListItemText primary={page} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
			<Divider />
			<List subheader={<ListSubheader>Account</ListSubheader>}>
				<ListItem disablePadding>
					<Box sx={{ px: 2, py: 1 }}>
						<Login isLoggedIn={props.isLoggedIn} setIsLoggedIn={props.setIsLoggedIn} />
					</Box>
				</ListItem>
			</List>
		</Box>
	);

	return (
		<AppBar position="static">
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					{/* Mobile: hamburger */}
					<Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
						<IconButton
							size="large"
							aria-label="open navigation"
							onClick={() => setDrawerOpen(true)}
							color="inherit"
						>
							<MenuIcon />
						</IconButton>
					</Box>

					{/* Mobile: title, grows to push avatar right */}
					<Typography
						variant="h6"
						noWrap
						sx={{
							flexGrow: 1,
							display: { xs: 'flex', md: 'none' },
							color: 'inherit',
						}}
					>
						{props.guildSelected?.name ?? 'Sakiot'}
					</Typography>

					{/* Desktop */}
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
						{visiblePages.map((page) => (
							<Button
								key={page}
								onClick={() => handleDesktopNavClick(page)}
								sx={{ my: 2, color: 'white', display: 'block' }}
							>
								{page}
							</Button>
						))}
						{props.guildSelected ? (
							<MenuItem>
								Select Server:
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

					{/* Desktop-only login buttons (mobile has login inside drawer) */}
					<Box sx={{ display: { xs: 'none', md: 'flex' } }}>
						<Login isLoggedIn={props.isLoggedIn} setIsLoggedIn={props.setIsLoggedIn} />
					</Box>

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
							anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
							keepMounted
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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

			<Drawer
				anchor="left"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				sx={{ display: { xs: 'block', md: 'none' } }}
			>
				{drawer}
			</Drawer>
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
		const newGuild = props.userGuilds![index];
		props.setGuildSelected(newGuild);

		if (props.guildSelected && location.pathname.includes(props.guildSelected.id)) {
			const result = location.pathname.split(props.guildSelected.id);
			navigate(result[0] + newGuild.id);
		}
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
