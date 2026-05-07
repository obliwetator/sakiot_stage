import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import * as React from "react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
	useGetCurrentGuildDirsQuery,
	useGetLiveStemsQuery,
} from "../../../app/apiSlice";
import type { Dirs, UserGuilds } from "../../../Constants";
import { transform_to_months } from "../data";
import { TreeViewYears } from "./TreeViewYears";

function getExpansionIds(date: Date) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	return [`${year}`, `${year}-${month}`, `${year}-${month}-${day}`];
}

function getRequiredExpandedItems(params: {
	year?: string;
	month?: string;
	file_name?: string;
}) {
	const year = Number(params.year);
	const month = Number(params.month);
	const fileTimestamp = Number(params.file_name?.slice(0, 13));

	if (
		Number.isFinite(year) &&
		Number.isFinite(month) &&
		Number.isFinite(fileTimestamp)
	) {
		const day = new Date(fileTimestamp).getDate();
		return [`${year}`, `${year}-${month}`, `${year}-${month}-${day}`];
	}

	return getExpansionIds(new Date());
}

export default function CustomizedTreeView(_props: {
	guildSelected: UserGuilds | null;
}) {
	const [data, setData] = useState<Dirs[] | null>(null);
	const [userExpandedItems, setUserExpandedItems] = useState<string[]>([]);
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

	if (!data) return <div className="w-full p-3">Loading Tree</div>;

	const years = data.map((el, index) => (
		<TreeViewYears el={el} index={index} liveSet={liveSet} key={el.year} />
	));
	const requiredExpandedItems = getRequiredExpandedItems(params);
	const expandedItems = Array.from(
		new Set([...userExpandedItems, ...requiredExpandedItems]),
	);

	return (
		<SimpleTreeView
			aria-label="customized"
			expandedItems={expandedItems}
			onExpandedItemsChange={(_event, itemIds) => {
				setUserExpandedItems(
					itemIds.filter((itemId) => !requiredExpandedItems.includes(itemId)),
				);
			}}
			className="w-full p-3"
		>
			{years}
		</SimpleTreeView>
	);
}
