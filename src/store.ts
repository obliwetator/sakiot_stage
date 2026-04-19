import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./app/apiSlice";
import appReducer from "./reducers/appSlice";
import hasSilenceReducer from "./reducers/silence";
import TokenReducer from "./reducers/Token";

export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		app: appReducer,
		token: TokenReducer,
		hasSilence: hasSilenceReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [
					"api/executeQuery/fulfilled",
					"api/executeMutation/fulfilled",
					"api/executeQuery/rejected",
					"api/executeMutation/rejected",
				],
				ignoredActionPaths: [
					"meta.arg",
					"payload",
					"meta.baseQueryMeta.request",
					"meta.baseQueryMeta.response",
				],
				ignoredPaths: ["api.queries", "api.mutations"],
			},
		}).concat(apiSlice.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
