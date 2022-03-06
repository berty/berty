import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const sliceName = 'networkConfig'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

type CustomNetworkConfig = {
	value: string
	enable: boolean
}

export type NetworkConfigFront = any
	// | (Omit<beapi.account.INetworkConfig, 'bootstrap' | 'rendezvous' | 'staticRelay'> & {
	// 		bootstrap?: CustomNetworkConfig[] | null
	// 		rendezvous?: CustomNetworkConfig[] | null
	// 		staticRelay?: CustomNetworkConfig[] | null
	//   })
	// | {}

const initialState: NetworkConfigFront = {}
const rootInitialState = makeRoot<NetworkConfigFront>(initialState)
type LocalRootState = typeof rootInitialState

/**
 *
 * Selectors
 *
 */

const selectSlice = (state: LocalRootState) => state[sliceName]

export const selectNetworkConfig = (state: LocalRootState) => {
  
  const test = selectSlice(state)
  console.log('selectSlice', test?.bootstrap)
  return test
}

/**
 *
 * Actions
 *
 */

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setNetworkConfig(state: NetworkConfigFront, { payload }: PayloadAction<NetworkConfigFront>) {
			console.log('payload::', payload)
      state.dht = payload?.dht
		},
	},
})

export const { setNetworkConfig } = slice.actions

export default makeRoot(slice.reducer)
