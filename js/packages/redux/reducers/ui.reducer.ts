import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import beapi from '@berty/api'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { NotificationsInhibitor } from '@berty/utils/notification/notif-in-app'
import { StreamWithProgressType } from '@berty/utils/protocol/progress.types'

/**
 *
 * Types
 *
 */

export type UiState = {
	appState: MessengerAppState
	// variable to know (at the opening step) if the user create a new account or not
	isNewAccount: boolean
	selectedAccount: string | null
	accounts: beapi.account.IAccountMetadata[]
	// clients
	messengerClient: ServiceClientType<beapi.messenger.MessengerService> | null
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null
	clearClients: () => Promise<void>
	// variable to have more infos on streams
	streamError: any
	streamInProgress: StreamWithProgressType | null
	// notifications inhibitors to know if in the current screen an in-app notification has to be shown or not
	notificationsInhibitors: NotificationsInhibitor[]
	// address of the berty daemon (now static, but changeable in devtools)
	daemonAddress: string
	// variable for AppInspector
	debugMode: boolean
	// TODO: fix the way to handle deeplink, this variable is needed to know the handle status of the link
	handledLink: boolean
}

export enum MessengerAppState {
	INIT = 'init',
	OPENING = 'opening',
	ONBOARDING = 'onBoarding',
	READY = 'ready',
}

const expectedAppStateChanges: {
	[key: string]: MessengerAppState[]
} = {
	[MessengerAppState.INIT]: [MessengerAppState.OPENING, MessengerAppState.ONBOARDING],
	[MessengerAppState.OPENING]: [MessengerAppState.READY],
	[MessengerAppState.ONBOARDING]: [MessengerAppState.OPENING],
	[MessengerAppState.READY]: [MessengerAppState.INIT, MessengerAppState.ONBOARDING],
}

// function to see expected changes from a state to an other
const isExpectedAppStateChange = (former: MessengerAppState, next: MessengerAppState): boolean => {
	console.log({ former, next })
	if (former === next) {
		return true
	}
	return (expectedAppStateChanges[former as string] || []).indexOf(next) !== -1
}

/**
 *
 * State
 *
 */

const sliceName = 'ui'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

export const initialState: UiState = {
	appState: MessengerAppState.INIT,
	isNewAccount: false,
	selectedAccount: null,
	accounts: [],
	messengerClient: null,
	protocolClient: null,
	clearClients: async () => {},
	streamError: null,
	streamInProgress: null,
	notificationsInhibitors: [],
	daemonAddress: 'http://localhost:1337', // daemonAddress is the mobile discrete (not embedded) daemon address
	debugMode: false,
	handledLink: false,
}

const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState

/**
 *
 * Actions
 *
 */

const changeAppState = (state: UiState, newAppState: MessengerAppState) => {
	if (!isExpectedAppStateChange(state.appState, newAppState)) {
		console.warn(`unexpected app state change from ${state.appState} to ${newAppState}`)
	}
	state.appState = newAppState
}

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		// addFakeData(_: UiState, { payload: { interactions } }: PayloadAction<{ interactions: any }>) {
		// 	// useless code
		// 	let fakeInteractions: { [key: string]: unknown[] } = {}
		// 	for (const inte of interactions || []) {
		// 		if (!fakeInteractions[inte.conversationPublicKey]) {
		// 			fakeInteractions[inte.conversationPublicKey] = []
		// 			fakeInteractions[inte.conversationPublicKey].push(inte)
		// 		}
		// 	}
		// },
		deleteFakeData() {},
		setDaemonAddress(state: UiState, { payload: { value } }: PayloadAction<{ value: string }>) {
			state.daemonAddress = value
		},
		setClients(
			state: UiState,
			{
				payload,
			}: PayloadAction<{
				messengerClient?: ServiceClientType<beapi.messenger.MessengerService> | null
				protocolClient?: ServiceClientType<beapi.protocol.ProtocolService> | null
			}>,
		) {
			state.messengerClient = payload.messengerClient || state.messengerClient
			state.protocolClient = payload.protocolClient || state.protocolClient
		},
		setClearClients(state: UiState, { payload }: PayloadAction<() => Promise<void>>) {
			state.clearClients = payload
		},
		setSelectedAccount(state: UiState, { payload }: PayloadAction<string | null | undefined>) {
			state.selectedAccount = payload || state.selectedAccount
		},
		resetStateBeforeOpening(state: UiState) {
			// reset state to initialState except accounts
			Object.keys(initialState).map(k => {
				if (k !== 'accounts' && k !== 'isNewAccount' && k !== 'selectedAccount') {
					// @ts-ignore
					state[k] = initialState[k]
				}
			})
		},
		setStateOpening(state: UiState) {
			changeAppState(state, MessengerAppState.OPENING)
		},
		setStateReady(state: UiState) {
			changeAppState(state, MessengerAppState.READY)
		},
		setIsNewAccount(state: UiState, { payload }: PayloadAction<boolean>) {
			state.isNewAccount = payload
		},
		setAccounts(state: UiState, { payload }: PayloadAction<beapi.account.IAccountMetadata[]>) {
			state.accounts = payload
		},
		addNotificationInhibitor(
			state: UiState,
			{ payload: { inhibitor } }: PayloadAction<{ inhibitor: NotificationsInhibitor }>,
		) {
			if (state.notificationsInhibitors.includes(inhibitor)) {
				return
			}
			state.notificationsInhibitors = [...state.notificationsInhibitors, inhibitor]
		},
		removeNotificationInhibitor(
			state: UiState,
			{ payload: { inhibitor } }: PayloadAction<{ inhibitor: NotificationsInhibitor }>,
		) {
			if (!state.notificationsInhibitors.includes(inhibitor)) {
				return
			}

			state.notificationsInhibitors = state.notificationsInhibitors.filter(
				(inh: any) => inh !== inhibitor,
			)
		},
		setCreatedAccount(state: UiState, { payload }: PayloadAction<{ accountId: string | null }>) {
			state.isNewAccount = true
			state.selectedAccount = payload?.accountId
		},
		setStateStreamInProgress(
			state: UiState,
			{ payload }: PayloadAction<StreamWithProgressType | null>,
		) {
			// state.appState = MessengerAppState.STREAM
			state.streamInProgress = payload
		},
		setStreamDone(state) {
			state.streamInProgress = null
		},
		setStreamError(state: UiState, { payload: { error } }: PayloadAction<{ error: unknown }>) {
			state.streamError = error
		},
		setStateOnBoarding(state: UiState) {
			state.appState = MessengerAppState.ONBOARDING
		},
		setDebugMode(state: UiState, { payload }: PayloadAction<boolean>) {
			state.debugMode = payload
		},
		setHandledLink(state: UiState, { payload }: PayloadAction<boolean>) {
			state.handledLink = payload
		},
	},
})

/**
 *
 * Selectors
 *
 */

const selectSlice = (state: LocalRootState) => state[sliceName]

export const selectMessengerIsNotReady = (state: LocalRootState): boolean =>
	selectSlice(state).appState === MessengerAppState.INIT

export const selectAppState = (state: LocalRootState) => selectSlice(state).appState

export const selectSelectedAccount = (state: LocalRootState) => selectSlice(state).selectedAccount

export const selectMessengerClient = (state: LocalRootState) => selectSlice(state).messengerClient

export const selectProtocolClient = (state: LocalRootState) => selectSlice(state).protocolClient

export const selectClearClients = (state: LocalRootState) => selectSlice(state).clearClients

export const selectDaemonAddress = (state: LocalRootState) => selectSlice(state).daemonAddress

export const selectDebugMode = (state: LocalRootState) => selectSlice(state).debugMode

export const selectStreamInProgress = (state: LocalRootState) => selectSlice(state).streamInProgress

export const selectStreamError = (state: LocalRootState) => selectSlice(state).streamError

export const selectNotificationsInhibitors = (state: LocalRootState) =>
	selectSlice(state).notificationsInhibitors

export const selectAccounts = (state: LocalRootState) => selectSlice(state).accounts

export const selectHandledLink = (state: LocalRootState) => selectSlice(state).handledLink

export const selectIsNewAccount = (state: LocalRootState) => selectSlice(state).isNewAccount

export const {
	setClients,
	setClearClients,
	setSelectedAccount,
	resetStateBeforeOpening,
	setIsNewAccount,
	setCreatedAccount,
	setStateStreamInProgress,
	setStreamDone,
	setStateOnBoarding,
	setStateOpening,
	setStateReady,
	setDebugMode,
	setStreamError,
	setAccounts,
	setDaemonAddress,
	setHandledLink,
	addNotificationInhibitor,
	removeNotificationInhibitor,
} = slice.actions

export default makeRoot(slice.reducer)
