import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useJamItMutation } from '../../app/apiSlice';
import { UserGuilds } from '../../Constants';

enum RespStatus {
	CONNECTED,
	NOT_CONNECTED,
	UNKOWN,
	COOLDOWN,
}

export function JamIt(props: { disabled: boolean; userGuilds: UserGuilds[] | null }) {
	if (!props.disabled) return <></>;

	const [isError, setIsError] = useState<{ type: RespStatus; code: number; cooldownRemaining?: number }>({
		type: RespStatus.UNKOWN,
		code: 0,
	});
	const params = useParams();
	const [jamIt] = useJamItMutation();
	const [open, setOpen] = React.useState(false);

	const handleJamIt = async () => {
		try {
			const res = await jamIt({
				guild_id: params.guild_id as string,
				clip_name: params.file_name as string,
			}).unwrap();

			if (res.code) {
				setIsError({ type: RespStatus.CONNECTED, code: res.code as number });
				setOpen(true);
			}
		} catch (err: any) {
			if (err?.status === 429) {
				setIsError({
					type: RespStatus.COOLDOWN,
					code: err?.data?.code ?? 3,
					cooldownRemaining: err?.data?.cooldown_remaining_seconds,
				});
			} else {
				setIsError({ type: RespStatus.NOT_CONNECTED, code: 0 });
			}
			setOpen(true);
		}
	};

	const style = {
		position: 'absolute' as const,
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: { xs: '90vw', sm: 400 },
		maxWidth: 400,
		bgcolor: 'background.paper',
		border: '2px solid #000',
		boxShadow: 24,
		p: 4,
	};

	const handleClose = () => {
		setOpen(false);
		setIsError({ type: RespStatus.CONNECTED, code: 0 });
	};

	return (
		<>
			<Button onClick={handleJamIt} variant="contained">
				Jam It
			</Button>
			{(isError.code > 0 || isError.type === RespStatus.NOT_CONNECTED || isError.type === RespStatus.COOLDOWN) && (
				<div>
					<Modal
						open={open}
						onClose={handleClose}
						aria-labelledby="modal-modal-title"
						aria-describedby="modal-modal-description"
					>
						<Box sx={style}>
							<Typography id="modal-modal-title" variant="h6" component="h2">
								{isError.type === RespStatus.COOLDOWN ? 'On cooldown' : 'Error'}
							</Typography>
							<Typography id="modal-modal-description" sx={{ mt: 2 }}>
								{isError.type === RespStatus.COOLDOWN ? (
									<>Try again in {isError.cooldownRemaining ?? '?'}s.</>
								) : (
									<>
										error code: {isError.code}
										<br />
										TODO: proper messages
										<br />
										number 0 = Success
										<br />
										number 1 = bot is not in voice channel
										<br />
										number &gt;= 2 =¯\_(ツ)_/¯
									</>
								)}
							</Typography>
						</Box>
					</Modal>
				</div>
			)}
		</>
	);
}
