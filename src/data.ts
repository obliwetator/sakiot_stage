import { Channels, Dirs, IndividualFile, IndividualFileArray } from './App';

type months =
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

interface Super {
	channel_id: string;
	year: number;
	file: IndividualFile;
	month: months;
}

// TODO: We get the data organized by channels. The data is more easier to work with when it is organized by years and the channel_id is used as metadata of sorts
// FIXME: There should definetly be a better way to do it
export function transform_to_months(data: Channels[]) {
	let all_stuff: Super[] = [];

	// Extract all elements in a an array

	// Loops over channels
	data.forEach((channel, index) => {
		// Loops over the years in the channel
		channel.dirs.forEach((dirs, index) => {
			let months_obj = Object.keys(dirs.months);
			// Loops over the months in the year of the channel
			months_obj.map((month_name, index) => {
				let month = month_name as months;
				let files = dirs.months[month];

				let all_file: IndividualFileArray = [];

				files!.forEach((file, file_index) => {
					let indi: IndividualFile = {
						channel_id: channel.channel_id,
						comment: file.comment,
						file: file.file,
					};
					all_file.push(indi);

					all_stuff.push({
						channel_id: channel.channel_id,
						file: { file: file.file, comment: file.comment },
						year: dirs.year,
						month: month,
					});
				});
			});
		});
	});

	let hashmap3 = new Map<number, Partial<Record<months, IndividualFileArray>>>();
	let hashmap_month: Partial<Record<months, IndividualFileArray>> = {};

	let sorted_by_year: Dirs[] = [];

	// Arrannge elements by year in a Map
	all_stuff.forEach((value, el) => {
		if (!hashmap3.has(value.year)) hashmap3.set(value.year, {});

		hashmap_month[value.month]! = [];
		hashmap_month[value.month]?.push({
			comment: value.file.comment,
			channel_id: value.channel_id,
			file: value.file.file,
		});

		let dirs = hashmap3.get(value.year)!;

		if (!dirs[value.month]) dirs[value.month] = [];

		dirs[value.month]?.push({ comment: value.file.comment, channel_id: value.channel_id, file: value.file.file });
	});

	// Transform Map into object
	hashmap3.forEach((value, key) => {
		sorted_by_year.push({ year: key, months: value });
	});

	console.log(sorted_by_year);

	return sorted_by_year;
}
