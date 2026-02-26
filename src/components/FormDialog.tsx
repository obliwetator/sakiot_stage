import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

export function FormDialog(props: {
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
	const [formText, setFormText] = useState('');

	const handleClose = () => {
		props.setContextMenu(null);
		props.setOpen(false);
	};

	const handleAddNote = () => {
		console.log('FIXME');
		// DB Integration goes here
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
