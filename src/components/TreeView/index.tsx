import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import * as React from "react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
	useGetCurrentGuildDirsQuery,
	useGetLiveStemsQuery,
} from "../../app/apiSlice";
import type { Dirs, UserGuilds } from "../../Constants";
import { transform_to_months } from "../../data";
import { TreeViewYears } from "./TreeViewYears";

export default function CustomizedTreeView(_props: {
	guildSelected: UserGuilds | null;
}) {
	const [data, setData] = useState<Dirs[] | null>(null);
	const params = useParams();
	const { data: channelsData, isSuccess } = useGetCurrentGuildDirsQuery(
		params.guild_id ?? "",
		{
			skip: !params.guild_id,
			refetchOnMountOrArgChange: true,
		},
	);
	const { data: liveStems } = useGetLiveStemsQuery(params.guild_id ?? "", {
		skip: !params.guild_id,
		pollingInterval: 10_000,
	});
	const liveSet = useMemo(() => new Set(liveStems ?? []), [liveStems]);

	React.useEffect(() => {
		if (isSuccess && channelsData) {
			const res = transform_to_months(channelsData);
			setData(res);
		}
	}, [channelsData, isSuccess]);

	if (!data) return <div className="w-full p-3">Loading</div>;

	const years = data.map((el, index) => (
		<TreeViewYears el={el} index={index} liveSet={liveSet} key={el.year} />
	));
	const month = new Date().toLocaleString("default", { month: "long" });

	return (
		<SimpleTreeView
			aria-label="customized"
			defaultExpandedItems={["2026", month]}
			className="w-full p-3"
		>
			{years}
		</SimpleTreeView>
	);
}
