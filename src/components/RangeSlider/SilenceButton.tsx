import Button from "@mui/material/Button";
import { useState } from "react";
import { Params } from "react-router-dom";
import { useRemoveSilenceMutation } from "../../app/apiSlice";
import { AudioParams } from "../../Constants";
import { setHasSilence } from "../../reducers/silence";
import { store } from "../../store";

export function SilenceButton(props: {
	params: Readonly<Params<AudioParams>>;
	isSilence: boolean;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [removeSilence] = useRemoveSilenceMutation();

	const handleOnClick = async () => {
		setIsLoading(true);
		try {
			const payload = {
				guild_id: props.params.guild_id!,
				channel_id: props.params.channel_id!,
				year: props.params.year!,
				month: Number(props.params.month!),
				file_name: props.params.file_name!,
				idempotency_key: store.getState().token.value as string,
			};
			const res = await removeSilence(payload).unwrap();

			if (res.message === "Success" || res.message === " Accepted") {
				const res2 = await removeSilence(payload).unwrap();
				if (res2.message === "Success") {
					console.log("Silence removed", res2.url);
					store.dispatch(setHasSilence(true));
				}
			}
		} catch (error) {
			console.error("Error removing silence:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (store.getState().hasSilence.value || props.isSilence) return null;

	return (
		<Button variant="contained" onClick={handleOnClick} disabled={isLoading}>
			{isLoading ? "Removing..." : "Remove Silence"}
		</Button>
	);
}
