import { configureStore } from '@reduxjs/toolkit';
// import counterSliceReducer from './reducers/Test';
import TokenReducer from './reducers/Token';
import hasSilenceReducer from './reducers/silence';

export const store = configureStore({
	reducer: {
		token: TokenReducer,
		hasSilence: hasSilenceReducer
	},
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
