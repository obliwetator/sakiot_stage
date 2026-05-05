import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGetAuthDetailsQuery } from "../../app/apiSlice";
import { isLoggedIn as hasLoggedInCookie } from "../../app/authedFetch";
import { useAppSelector } from "../../app/hooks";
import { AudioInterface } from "./AudioInterface";
import CustomizedTreeView from "./TreeView";

export function YearSelection() {
	const params = useParams();
	const location = useLocation();

	const guildSelected = useAppSelector((state) => state.app.guildSelected);
	const { data: authData } = useGetAuthDetailsQuery(undefined, {
		skip: !hasLoggedInCookie(),
	});
	const userGuilds = authData?.guilds || null;

	const theme = useTheme();
	const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
	const [treeOpen, setTreeOpen] = React.useState(false);

	React.useEffect(() => {
		if (!isDesktop) setTreeOpen(false);
	}, [isDesktop]);

	const tree = <CustomizedTreeView guildSelected={guildSelected} />;

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: { xs: "column", md: "row" },
				width: "100%",
			}}
		>
			{isDesktop ? (
				<Box
					sx={{
						flex: "0 0 20%",
						minWidth: 220,
						maxWidth: 320,
						overflow: "auto",
					}}
				>
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
					<Drawer
						anchor="left"
						open={treeOpen}
						onClose={() => setTreeOpen(false)}
					>
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
