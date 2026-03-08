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

	const handleClickAccordion = (guild_id: string, clip_name: string) => {
		console.log('here', `${PATH_PREFIX_FOR_LOGGED_USERS}/${guild_id}/clips/${encodeURIComponent(clip_name)}`);
		if (
			location.pathname === `${PATH_PREFIX_FOR_LOGGED_USERS}/${guild_id}/clips/${encodeURIComponent(clip_name)}`
		) {
			// do nothing
		} else {
			navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}/${guild_id}/clips/${encodeURIComponent(clip_name)}`);
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
					handleClickAccordion(el.guild_id, el.clip_name);
				}}
				onChange={handleChange(`panel${index}`)}
				expanded={expanded === `panel${index}`}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
					<Typography>CLIP_NAME: {el.clip_name}</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>SOME BS</Typography>
					<Typography>BY(not working): {el.user_id}</Typography>
					<Typography>start: {el.clip_start}</Typography>
					<Typography>end: {el.clip_end}</Typography>
					<Typography>OG file: {el.file_name}</Typography>
					<div>
						<AlertDialog name={el.file_name} />
					</div>
				</AccordionDetails>
			</Accordion>
		);
	});
	return <div>{elements}</div>;
}

function AlertDialog(props: { name: string }) {
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
			await deleteClip({ guild_id: params.guild_id, file_name: props.name }).unwrap();
			// Optionally trigger refetch or cache invalidation for clips here
		}
		setOpen(false);
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
				<DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
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
