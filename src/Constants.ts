export const BASE_URL = 'https://dev.patrykstyla.com/';

export const PATH_PREFIX_FOR_LOGGED_USERS = '/dashboard';
export function valuetext(value: number) {
	return `${value}°C`;
}

export interface Channels {
	channel_id: string;
	dirs: Dirs[];
}

export type AudioParams2 = {
	dashboard?: string;
	audio?: string;
	guild_id?: string;
	channel_id?: string;
	file_name?: string;
	month?: string;
	year?: string;
};
export type AudioParams = 'guild_id' | 'channel_id' | 'file_name' | 'month' | 'year';

export interface Dirs {
	year: number;
	months: Partial<Record<months, IndividualFileArray>>;
}

export type IndividualFileArray = IndividualFile[];
export type IndividualFile = { channel_id?: string; file: string; comment: string | null };

export enum Months {
	'January' = 0,
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
}

export type months =
	| 'January'
	| 'February'
	| 'March'
	| 'April'
	| 'May'
	| 'June'
	| 'July'
	| 'August'
	| 'September'
	| 'October'
	| 'November'
	| 'December';

export interface UserGuilds {
	id: string;
	name: string;
	icon?: string;
	owner: boolean;
	permissions: string;
}
