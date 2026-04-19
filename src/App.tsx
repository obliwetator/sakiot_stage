import { ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./app/AppRoutes";
import { darkTheme } from "./app/theme";
import { useAuthBootstrap } from "./app/useAuthBootstrap";
import { LayoutsWithNavbar } from "./layouts/LayoutsWithNavbar";

function App() {
	const { authData, isLoading, isLoggedIn } = useAuthBootstrap();

	if (isLoading || !isLoggedIn) {
		return (
			<ThemeProvider theme={darkTheme}>
				<BrowserRouter>
					<LayoutsWithNavbar />
					<Box p={2}>
						{!isLoggedIn && !isLoading
							? "You are not logged in or you are not authorized to view this content"
							: "Loading..."}
					</Box>
				</BrowserRouter>
			</ThemeProvider>
		);
	}

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<BrowserRouter>
				<AppRoutes />
			</BrowserRouter>
			{authData?.user?.is_dev && (
				<Box
					sx={{
						position: "fixed",
						bottom: 16,
						right: 16,
						backgroundColor: "error.main",
						color: "error.contrastText",
						padding: "4px 8px",
						borderRadius: 1,
						fontWeight: "bold",
						zIndex: 9999,
						pointerEvents: "none",
					}}
				>
					DEV ACCOUNT
				</Box>
			)}
		</ThemeProvider>
	);
}

export default App;
