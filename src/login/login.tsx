import Button from '@mui/material/Button';

export default function Login(props: {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const handleLogin = () => {
		window.open(
			'https://discord.com/oauth2/authorize?client_id=877617434029350972&redirect_uri=https%3A%2F%2Fdev.patrykstyla.com%2Fapi%2Fdiscord_login&response_type=code&scope=email%20identify%20guilds',
			'popup',
			'width=500,height=800'
		)!;
	};

	const handleLogout = () => {
		localStorage.removeItem('token');

		props.setIsLoggedIn(false);
	};

	return props.isLoggedIn ? (
		<Button
			onClick={() => {
				handleLogout();
			}}
			sx={{ my: 2, color: 'white', display: 'block' }}
		>
			Log out
		</Button>
	) : (
		<Button
			onClick={() => {
				handleLogin();
			}}
			sx={{ my: 2, color: 'white', display: 'block' }}
		>
			Login
		</Button>
	);
}
