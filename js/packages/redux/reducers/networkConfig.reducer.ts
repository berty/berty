import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PermissionStatus } from 'react-native-permissions'

import beapi from '@berty/api'
/**
 *
 * State
 *
 */

export const sliceName = 'networkConfig'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

type ConfigListType = {
	url: string
	alias: string | null
	isEnabled: boolean
	isEditable: boolean
}

type NetworkConfigState = {
	nodeConfig: beapi.account.INetworkConfig
	currentConfig: beapi.account.INetworkConfig
	blePerm: PermissionStatus
	bootstrap: ConfigListType[]
	rendezvous: ConfigListType[]
	staticRelay: ConfigListType[]
}

export const initialNode = [
	{
		url: ':default:',
		alias: 'Berty Default',
		isEnabled: true,
		isEditable: false,
	},
]

const newNetworkConfigState = (): NetworkConfigState => ({
	nodeConfig: {},
	currentConfig: {},
	blePerm: 'unavailable',
	bootstrap: initialNode,
	rendezvous: initialNode,
	staticRelay: initialNode,
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

export const selectRendezvous = (state: LocalRootState) => selectSlice(state).rendezvous

export const selectBootstrap = (state: LocalRootState) => selectSlice(state).bootstrap

export const selectStaticRelay = (state: LocalRootState) => selectSlice(state).staticRelay

export const selectNodeNetworkConfig = (state: LocalRootState) => selectSlice(state).nodeConfig

export const selectEditedNetworkConfig = (state: LocalRootState): beapi.account.INetworkConfig => {
	const currentConfig: beapi.account.INetworkConfig = beapi.account.NetworkConfig.fromObject({
		...selectSlice(state).currentConfig,
		rendezvous: selectSlice(state)
			.rendezvous.filter(obj => obj.isEnabled)
			.map(obj => obj.url),
		bootstrap: selectSlice(state)
			.bootstrap.filter(obj => obj.isEnabled)
			.map(obj => obj.url),
		staticRelay: selectSlice(state)
			.staticRelay.filter(obj => obj.isEnabled)
			.map(obj => obj.url),
	})

	return currentConfig
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
		setBlePerm(state: LocalState, { payload }: PayloadAction<PermissionStatus>) {
			state.blePerm = payload
		},
		setCurrentNetworkConfig(
			state: LocalState,
			{ payload }: PayloadAction<beapi.account.INetworkConfig>,
		) {
			state.currentConfig = payload
			state.rendezvous.forEach(val => {
				val.isEnabled = !!payload.rendezvous?.includes(val.url)
			})
			state.bootstrap.forEach(val => {
				val.isEnabled = !!payload.bootstrap?.includes(val.url)
			})
			state.staticRelay.forEach(val => {
				val.isEnabled = !!payload.staticRelay?.includes(val.url)
			})
		},
		setNodeNetworkConfig(
			state: LocalState,
			{ payload }: PayloadAction<beapi.account.INetworkConfig>,
		) {
			state.nodeConfig = payload
		},
		addToRendezvous(state, { payload }: PayloadAction<{ url: string; alias: string }>) {
			state.rendezvous.push({ ...payload, isEditable: true, isEnabled: false })
		},
		addToBootstrap(state, { payload }: PayloadAction<{ url: string; alias: string }>) {
			state.bootstrap.push({ ...payload, isEditable: true, isEnabled: false })
		},
		addToStaticRelay(state, { payload }: PayloadAction<{ url: string; alias: string }>) {
			state.staticRelay.push({ ...payload, isEditable: true, isEnabled: false })
		},
		removeFromRendezvous(state, { payload }: PayloadAction<string>) {
			state.rendezvous = state.rendezvous.filter(({ url }) => url !== payload)
		},
		removeFromBootstrap(state, { payload }: PayloadAction<string>) {
			state.bootstrap = state.bootstrap.filter(({ url }) => url !== payload)
		},
		removeFromStaticRelay(state, { payload }: PayloadAction<string>) {
			state.staticRelay = state.staticRelay.filter(({ url }) => url !== payload)
		},
		modifyFromRendezvous(
			state,
			{
				payload: { url, changes },
			}: PayloadAction<{ url: string; changes: Partial<ConfigListType> }>,
		) {
			const index = state.rendezvous.findIndex(obj => obj.url === url)
			if (index === -1) {
				return
			}
			state.rendezvous[index] = { ...state.rendezvous[index], ...changes }
		},
		modifyFromBootstrap(
			state,
			{
				payload: { url, changes },
			}: PayloadAction<{ url: string; changes: Partial<ConfigListType> }>,
		) {
			const index = state.bootstrap.findIndex(obj => obj.url === url)
			if (index === -1) {
				return
			}
			state.bootstrap[index] = { ...state.bootstrap[index], ...changes }
		},
		modifyFromStaticRelay(
			state,
			{
				payload: { url, changes },
			}: PayloadAction<{ url: string; changes: Partial<ConfigListType> }>,
		) {
			const index = state.staticRelay.findIndex(obj => obj.url === url)
			if (index === -1) {
				return
			}
			state.staticRelay[index] = { ...state.staticRelay[index], ...changes }
		},
		toggleFromRendezvous(state, { payload: url }: PayloadAction<string>) {
			const index = state.rendezvous.findIndex(obj => obj.url === url)
			if (index === -1) {
				return
			}
			state.rendezvous[index].isEnabled = !state.rendezvous[index].isEnabled
		},
		toggleFromBootstrap(state, { payload: url }: PayloadAction<string>) {
			const index = state.bootstrap.findIndex(obj => obj.url === url)
			if (index === -1) {
				return
			}
			state.bootstrap[index].isEnabled = !state.bootstrap[index].isEnabled
		},
		toggleFromStaticRelay(state, { payload: url }: PayloadAction<string>) {
			const index = state.staticRelay.findIndex(obj => obj.url === url)
			if (index === -1) {
				return
			}
			state.staticRelay[index].isEnabled = !state.staticRelay[index].isEnabled
		},
		enableEveryNodeLists(state) {
			;[...state.bootstrap, ...state.rendezvous, ...state.staticRelay].forEach(
				obj => (obj.isEnabled = true),
			)
		},
		disableEveryNodeLists(state) {
			;[...state.bootstrap, ...state.rendezvous, ...state.staticRelay].forEach(
				obj => (obj.isEnabled = false),
			)
		},
	},
})

export const {
	setBlePerm,
	setCurrentNetworkConfig,
	setNodeNetworkConfig,
	addToRendezvous,
	addToBootstrap,
	addToStaticRelay,
	modifyFromRendezvous,
	modifyFromBootstrap,
	modifyFromStaticRelay,
	removeFromRendezvous,
	removeFromBootstrap,
	removeFromStaticRelay,
	toggleFromRendezvous,
	toggleFromBootstrap,
	toggleFromStaticRelay,
	enableEveryNodeLists,
	disableEveryNodeLists,
} = slice.actions

export default makeRoot(slice.reducer)
