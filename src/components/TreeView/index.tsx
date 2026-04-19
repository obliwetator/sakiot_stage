import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import * as React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetCurrentGuildDirsQuery } from "../../app/apiSlice";
import type { Dirs, UserGuilds } from "../../Constants";
import { transform_to_months } from "../../data";
import { TreeViewYears } from "./TreeViewYears";

export default function CustomizedTreeView(_props: {
	guildSelected: UserGuilds | null;
}) {
	const [data, setData] = useState<Dirs[] | null>(null);
	const params = useParams();
	const {
		data: channelsData,
		isError,
		isSuccess,
	} = useGetCurrentGuildDirsQuery(params.guild_id ?? "", {
		skip: !params.guild_id,
		refetchOnMountOrArgChange: true,
	});

	React.useEffect(() => {
		if (isSuccess && channelsData) {
			const res = transform_to_months(channelsData);
			setData(res);
		}
	}, [channelsData, isSuccess]);

	if (!data) return <div className="w-full p-3">Loading</div>;

	const years = data.map((el, index) => (
		<TreeViewYears el={el} index={index} key={index} />
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
