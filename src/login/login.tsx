import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type React from "react";
import { BASE_API_URL, useLogoutMutation } from "../app/apiSlice";
export default function Login(props: {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [logout] = useLogoutMutation();

	const handleLogin = () => {
		window.open(
			"https://discord.com/oauth2/authorize?client_id=877617434029350972&redirect_uri=https%3A%2F%2Fdev.patrykstyla.com%2Fapi%2Fdiscord_login&response_type=code&scope=email%20identify%20guilds",
			"popup",
			"width=500,height=800",
		);
	};

	const handleLogout = async () => {
		try {
			await logout().unwrap();
		} catch (err) {
			console.error("logout request failed", err);
		}
		localStorage.removeItem("token");
		props.setIsLoggedIn(false);
	};

	const isDevOrStaging =
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1" ||
		window.location.hostname.includes("staging") ||
		window.location.hostname.includes("dev");

	const handleDevLogin = () => {
		window.open(
			`${BASE_API_URL}dev_login?t=${Date.now()}`,
			"popup",
			"width=500,height=800",
		);
	};

	return props.isLoggedIn ? (
		<Button
			onClick={() => {
				handleLogout();
			}}
			sx={{ my: 2, color: "white", display: "block" }}
		>
			Log out
		</Button>
	) : (
		<Box sx={{ display: "flex", gap: 2 }}>
			<Button
				onClick={() => {
					handleLogin();
				}}
				sx={{ my: 2, color: "white", display: "block" }}
			>
				Login
			</Button>
			{isDevOrStaging && (
				<Button
					onClick={() => {
						handleDevLogin();
					}}
					sx={{ my: 2, color: "white", display: "block" }}
				>
					Dev Login
				</Button>
			)}
		</Box>
	);
}
