import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define a type for the slice state
interface TokenState {
	value: string;
}

let date = new Date().toISOString();
// Define the initial state using that type
const initialState: TokenState = {
	value: date,
};

const token = createSlice({
	name: 'token',
	// `createSlice` will infer the state type from the `initialState` argument
	initialState,
	reducers: {
		// Use the PayloadAction type to declare the contents of `action.payload`
		setToken: (state, action: PayloadAction<string>) => {
			state.value = action.payload;
		},
	},
});

export const { setToken } = token.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectToken = (state: RootState) => state.token.value;

export default token.reducer;
