import type { UserGuilds } from "../Constants";

const ADMIN_BIT = 0x8n;
const MANAGE_GUILD_BIT = 0x20n;

export function isGuildAdmin(g: UserGuilds | null): boolean {
	if (!g) return false;
	if (g.owner) return true;
	try {
		const bits = BigInt(g.permissions);
		return (bits & (ADMIN_BIT | MANAGE_GUILD_BIT)) !== 0n;
	} catch {
		return false;
	}
}
