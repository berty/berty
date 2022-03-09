import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PermissionStatus } from 'react-native-permissions'

import beapi from '@berty-tech/api'
/**
 *
 * State
 *
 */

export const sliceName = 'networkConfig'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

export type NetworkConfigState = {
	currentConfig: beapi.account.INetworkConfig
	blePerm: PermissionStatus
}

const newNetworkConfigState = (): NetworkConfigState => ({
	currentConfig: {},
	blePerm: 'unavailable',
})

const initialState = newNetworkConfigState()

type LocalState = typeof initialState
const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState

/**
 *
 * Selectors
 *
 */

const selectSlice = (state: LocalRootState) => state[sliceName]

export const selectBlePerm = (state: LocalRootState) => selectSlice(state).blePerm
export const selectCurrentNetworkConfig = (state: LocalRootState) =>
	selectSlice(state).currentConfig

/**
 *
 * Actions
 *
 */

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setBlePerm(state: LocalState, { payload }: PayloadAction<PermissionStatus>) {
			state.blePerm = payload
		},
		setCurrentNetworkConfig(
			state: LocalState,
			{ payload }: PayloadAction<beapi.account.INetworkConfig>,
		) {
			state.currentConfig = payload
		},
	},
})

export const { setBlePerm, setCurrentNetworkConfig } = slice.actions

export default makeRoot(slice.reducer)
