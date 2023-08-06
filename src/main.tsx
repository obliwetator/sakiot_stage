// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { useAppSelector } from './app/hooks';
import './index.css';
import { store } from './store';

// const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	// <React.StrictMode>
	<Provider store={store}>
		<App />
	</Provider>
	// {/* </React.StrictMode> */}
);
