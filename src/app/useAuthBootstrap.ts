import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGetAuthDetailsQuery } from './apiSlice';
import { setGuildSelected } from '../reducers/appSlice';

export function useAuthBootstrap() {
	const dispatch = useDispatch();
	const [hasToken, setHasToken] = useState(!!localStorage.getItem('token'));

	const { data: authData, isLoading, isError, refetch } = useGetAuthDetailsQuery(undefined, {
		skip: !hasToken,
	});

	const isLoggedIn = !!authData?.user && !isError;

	useEffect(() => {
		if (!authData?.guilds) return;
		const url = window.location.href;
		const split = url.split('/');
		const res = split[4];
		if (res) {
			const guild = authData.guilds.find(({ id }) => id === res) || null;
			dispatch(setGuildSelected(guild));
		}
		if (authData.token) {
			localStorage.setItem('token', authData.token);
		}
	}, [authData, dispatch]);

	useEffect(() => {
		const handler = (e: MessageEvent) => {
			if (e.origin !== 'https://dev.patrykstyla.com') return;
			if (e.data.success !== 1) {
				console.error('something failed when authenticating');
				return;
			}
			if (!localStorage.getItem('token')) {
				localStorage.setItem('token', 'logged-in');
			}
			setHasToken(true);
			refetch();
			if (e.source && (e.source as Window).close) {
				setTimeout(() => (e.source as Window).close(), 200);
			}
		};
		window.addEventListener('message', handler);
		return () => window.removeEventListener('message', handler);
	}, []);

	return { authData, isLoading, isLoggedIn };
}
