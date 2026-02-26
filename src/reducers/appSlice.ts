import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { UserGuilds } from '../Constants';

interface AppState {
	guildSelected: UserGuilds | null;
}

const initialState: AppState = {
	guildSelected: null,
};

export const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		setGuildSelected: (state, action: PayloadAction<UserGuilds | null>) => {
			state.guildSelected = action.payload;
		},
	},
});

export const { setGuildSelected } = appSlice.actions;

export default appSlice.reducer;
