import { configureStore } from '@reduxjs/toolkit';
// import counterSliceReducer from './reducers/Test';
import TokenReducer from './reducers/Token';

export const store = configureStore({
	reducer: {
		token: TokenReducer,
	},
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
