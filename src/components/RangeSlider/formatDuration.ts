export function formatDuration(value: number) {
	if (!isFinite(value) || isNaN(value)) return "00:00:00";
	return new Date(value * 1000).toISOString().slice(11, 19);
}
