import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
	type IndividualFile,
	PATH_PREFIX_FOR_LOGGED_USERS,
} from "../../Constants";
import { parseFileName } from "./parseFileName";

export function ItemsEl(props: {
	file: IndividualFile;
	year: number;
	month_name: number;
}) {
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams();

	const fileId = props.file.file.slice(0, -4);
	const targetPath = `${PATH_PREFIX_FOR_LOGGED_USERS}/${params.guild_id}/audio/${props.file.channel_id}/${props.year}/${props.month_name}/${fileId}`;
	const isActive = location.pathname === targetPath;

	const baseColor =
		props.file.comment !== null ? "bg-orange-600" : "bg-violet-600";
	const hoverColor =
		props.file.comment !== null ? "hover:bg-orange-500" : "hover:bg-violet-500";
	const activeRing = isActive ? "ring-2 ring-white" : "";

	const { time, username } = parseFileName(props.file.file);

	return (
		<button
			type="button"
			id={props.file.file}
			className={`${baseColor} ${hoverColor} ${activeRing} w-full text-left px-2 py-1 mb-0.5 rounded border-b border-violet-900 cursor-pointer select-none text-sm`}
			onClick={(e) => {
				e.preventDefault();
				if (!isActive) navigate(targetPath + location.search);
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					if (!isActive) navigate(targetPath + location.search);
				}
			}}
			title={props.file.file}
		>
			<span className="font-mono">{time}</span>
			{username && <span className="ml-2">{username}</span>}
			{props.file.comment && (
				<span className="ml-2 text-xs opacity-75">— {props.file.comment}</span>
			)}
		</button>
	);
}
