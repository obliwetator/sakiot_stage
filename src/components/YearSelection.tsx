import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AudioInterface } from '../AudioInterface';
import CustomizedTreeView from '../components/TreeView';

import { useGetAuthDetailsQuery } from '../app/apiSlice';
import { useAppSelector } from '../app/hooks';

export function YearSelection(props: {
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
}) {
	const params = useParams();
	const location = useLocation();

	const guildSelected = useAppSelector((state) => state.app.guildSelected);
	const { data: authData } = useGetAuthDetailsQuery(undefined, { skip: !localStorage.getItem('token') });
	const userGuilds = authData?.guilds || null;

	const theme = useTheme();
	const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
	const [treeOpen, setTreeOpen] = React.useState(false);

	// Close mobile tree drawer when file selected
	React.useEffect(() => {
		if (!isDesktop) setTreeOpen(false);
	}, [location.pathname, isDesktop]);

	const tree = <CustomizedTreeView guildSelected={guildSelected} />;

	return (
		<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%' }}>
			{isDesktop ? (
				<Box sx={{ flex: '0 0 20%', minWidth: 220, maxWidth: 320, overflow: 'auto' }}>
					{tree}
				</Box>
			) : (
				<Box sx={{ p: 1 }}>
					<Button
						variant="outlined"
						fullWidth
						startIcon={<FolderOpenIcon />}
						onClick={() => setTreeOpen(true)}
					>
						Browse files
					</Button>
					<Drawer anchor="left" open={treeOpen} onClose={() => setTreeOpen(false)}>
						<Box sx={{ width: 280 }}>{tree}</Box>
					</Drawer>
				</Box>
			)}

			<Box sx={{ flex: 1, minWidth: 0, px: { xs: 1, md: 2 } }}>
				{params.year && (
					<AudioInterface
						key={`${location.pathname}-nosilence`}
						isClip={false}
						userGuilds={userGuilds}
						isSilence={false}
					/>
				)}
				{params.year && (
					<AudioInterface
						key={`${location.pathname}-silence`}
						isClip={false}
						userGuilds={userGuilds}
						isSilence={true}
					/>
				)}
			</Box>
		</Box>
	);
}
