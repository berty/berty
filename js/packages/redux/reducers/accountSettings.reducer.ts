import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 *
 * State
 *
 */

export const sliceName = 'accountSettings'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

type AccountSettingsState = {
	language?: string
}

const newAccountSettingsState = (): AccountSettingsState => ({})

const initialState = newAccountSettingsState()

type LocalState = typeof initialState
const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState

/**
 *
 * Selectors
 *
 */

const selectSlice = (state: LocalRootState) => state[sliceName]

export const selectAccountLanguage = (state: LocalRootState) => selectSlice(state).language

/**
 *
 * Actions
 *
 */

const slice = createSlice({
	name: 'accountSettings',
	initialState,
	reducers: {
		setAccountLanguage(state: LocalState, { payload }: PayloadAction<string | undefined>) {
			state.language = payload
		},
	},
})

export const { setAccountLanguage } = slice.actions

export default makeRoot(slice.reducer)
