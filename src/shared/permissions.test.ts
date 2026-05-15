import { describe, expect, it } from "bun:test";
import type { UserGuilds } from "../Constants";
import { isGuildAdmin } from "./permissions";

function guild(overrides: Partial<UserGuilds>): UserGuilds {
	return {
		id: "guild",
		name: "Guild",
		icon: null,
		owner: false,
		permissions: "0",
		...overrides,
	} as UserGuilds;
}

describe("isGuildAdmin", () => {
	it("accepts owners", () => {
		expect(isGuildAdmin(guild({ owner: true }))).toBe(true);
	});

	it("accepts administrator and manage guild permission bits", () => {
		expect(isGuildAdmin(guild({ permissions: "8" }))).toBe(true);
		expect(isGuildAdmin(guild({ permissions: "32" }))).toBe(true);
	});

	it("rejects missing, invalid, or unrelated permissions", () => {
		expect(isGuildAdmin(null)).toBe(false);
		expect(isGuildAdmin(guild({ permissions: "16" }))).toBe(false);
		expect(isGuildAdmin(guild({ permissions: "not-a-number" }))).toBe(false);
	});
});
