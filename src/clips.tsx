import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button/Button';

import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AudioInterface } from './AudioInterface';
import { BASE_URL, PATH_PREFIX_FOR_LOGGED_USERS, UserGuilds } from './Constants';

function SimpleAccordion(props: { data: Clips[] }) {
	const navigate = useNavigate();
	const [expanded, setExpanded] = useState<string | false>(false);

	const handleClickAccordion = (guild_id: string, clip_name: string) => {
		console.log('here');
		if (
			location.pathname === `${PATH_PREFIX_FOR_LOGGED_USERS}/clips/${guild_id}/${encodeURIComponent(clip_name)}`
		) {
			// do nothing
		} else {
			navigate(`${PATH_PREFIX_FOR_LOGGED_USERS}/clips/${guild_id}/${encodeURIComponent(clip_name)}`);
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

	const handleYes = () => {
		fetch(`${BASE_URL + 'api/audio/clips/delete/' + params.guild_id}`, {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain',
			},
			body: props.name,
		});
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

interface Clips {
	// big int
	user_id: string;
	clip_name: string;
	file_name: string;
	clip_start: number;
	clip_end: number;
	// big int
	guild_id: string;
	// big int
	id: string;
}

export default function Clips(props: { guildSelected: UserGuilds | null; userGuilds: UserGuilds[] | null }) {
	const params = useParams();
	const [data, setData] = useState<Clips[] | null>(null);

	useEffect(() => {
		fetch(`https://dev.patrykstyla.com/audio/clips/${props.guildSelected?.id}`, { credentials: 'include' }).then(
			(response) => {
				if (!response.ok) {
					console.log('cannot get clip data');
				} else {
					response.json().then((result: Clips[]) => {
						setData(result);
					});
				}
			}
		);
	}, [props.guildSelected]);

	if (data) {
		return (
			<div className="flex">
				<SimpleAccordion data={data} />
				{params.file_name && <AudioInterface isClip={true} userGuilds={props.userGuilds} />}
			</div>
		);
	} else {
		return <div>No clip data</div>;
	}
}
