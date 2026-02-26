import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './app/apiSlice';
import TokenReducer from './reducers/Token';
import appReducer from './reducers/appSlice';
import hasSilenceReducer from './reducers/silence';

export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		app: appReducer,
		token: TokenReducer,
		hasSilence: hasSilenceReducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
