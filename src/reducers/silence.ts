import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define a type for the slice state
interface HasSilenceState {
	value: boolean;
}

// Define the initial state using that type
const initialState: HasSilenceState = {
	value: false,
};

const hasSilence = createSlice({
	name: 'hasSilence',
	// `createSlice` will infer the state type from the `initialState` argument
	initialState,
	reducers: {
		// Use the PayloadAction type to declare the contents of `action.payload`
		setHasSilence: (state, action: PayloadAction<boolean>) => {
			state.value = action.payload;
		},
	},
});

export const { setHasSilence } = hasSilence.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectHasSilence = (state: RootState) => state.hasSilence.value;

export default hasSilence.reducer;
