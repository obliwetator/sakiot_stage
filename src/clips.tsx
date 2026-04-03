import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AudioInterface } from './AudioInterface';
import { BASE_URL, PATH_PREFIX_FOR_LOGGED_USERS } from './Constants';
import { ClipData, useDeleteClipMutation, useGetAuthDetailsQuery, useGetClipsQuery } from './app/apiSlice';
import { useAppSelector } from './app/hooks';

function SimpleAccordion(props: { data: ClipData[] }) {
	const navigate = useNavigate();
	const [expanded, setExpanded] = useState<string | false>(false);

	const handleClickAccordion = (guild_id: string, clip_id: string) => {
		console.log('here', `${PATH_PREFIX_FOR_LOGGED_USERS}/${guild_id}/clips/${encodeURIComponent(clip_id)}`);
		if (
			location.pathname === `${PATH_PREFIX_FOR_LOGGED_USERS}/${guild_id}/clips/${encodeURIComponent(clip_id)}`
		) {
			// do nothing
		} else {
			navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}/${guild_id}/clips/${encodeURIComponent(clip_id)}`);
		}
	};

	const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);
	};

	const elements = props.data.map((el, index) => {
		return (
			<Accordion
				key={index}
				onClick={() => {
					handleClickAccordion(el.guild_id, el.clip_id);
				}}
				onChange={handleChange(`panel${index}`)}
				expanded={expanded === `panel${index}`}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
					<Typography>CLIP_NAME: {el.name}</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>SOME BS</Typography>
					<Typography>BY(not working): {el.user_id}</Typography>
					<Typography>length: {el.length.toFixed(2)}</Typography>
					<Typography>size: {el.size}</Typography>
					<Typography>OG file: {el.original_file_name}</Typography>
					<div>
						<AlertDialog clip_id={el.clip_id} />
					</div>
				</AccordionDetails>
			</Accordion>
		);
	});
	return <div>{elements}</div>;
}

function AlertDialog(props: { clip_id: string }) {
	const [open, setOpen] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};
	const params = useParams();

	const [deleteClip] = useDeleteClipMutation();

	const handleYes = async () => {
		if (params.guild_id) {
			try {
				await deleteClip({ guild_id: params.guild_id, file_name: props.clip_id }).unwrap();
				setOpen(false);
			} catch (error) {
				console.error("Failed to delete clip:", error);
				alert("Failed to delete the clip.");
				setOpen(false);
			}
		} else {
			setOpen(false);
		}
	};

	return (
		<div>
			<Button variant="contained" color="error" onClick={handleClickOpen}>
				Delete
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">{"Confirm deletion?"}</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure you want to delete the clip?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>No</Button>
					<Button onClick={handleYes} autoFocus>
						YEP
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export default function Clips() {
	const params = useParams();
	const location = useLocation();

	const guildSelected = useAppSelector((state) => state.app.guildSelected);
	const { data: authData } = useGetAuthDetailsQuery(undefined, { skip: !localStorage.getItem('token') });
	const userGuilds = authData?.guilds || null;

	const { data, isError, isSuccess } = useGetClipsQuery(guildSelected?.id || '', {
		skip: !guildSelected?.id,
		refetchOnMountOrArgChange: true,
	});

	if (isError) {
		console.log('cannot get clip data');
	}

	if (isSuccess && data) {
		return (
			<div className="flex">
				<SimpleAccordion data={data} />
				{params.file_name && <AudioInterface key={location.pathname} isClip={true} userGuilds={userGuilds} isSilence={false} />}
			</div>
		);
	} else {
		return <div>No clip data</div>;
	}
}
