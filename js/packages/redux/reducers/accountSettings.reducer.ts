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

export type AccountSettingsState = {
	devMode: boolean
	language?: string
}

const newAccountSettingsState = (): AccountSettingsState => ({ devMode: false })

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
export const selectDevMode = (state: LocalRootState) => selectSlice(state).devMode

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
		setDevMode(state) {
			state.devMode = true
		},
	},
})

export const { setAccountLanguage, setDevMode } = slice.actions

export default makeRoot(slice.reducer)
