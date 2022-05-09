import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import beapi from '@berty/api'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { NotificationsInhibitor } from '@berty/utils/notification/notif-in-app'
import { StreamInProgress } from '@berty/utils/protocol/progress.types'

/**
 *
 * Types
 *
 */

export type UiState = {
	appState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE]
	// variable to know (at the opening step) if the user create a new account or not
	isNewAccount: boolean
	selectedAccount: string | null
	accounts: beapi.account.IAccountMetadata[]
	// clients
	messengerClient: ServiceClientType<beapi.messenger.MessengerService> | null
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null
	// variable to have more infos on streams
	streamError: any
	streamInProgress: StreamInProgress | null
	// notifications inhibitors to know if in the current screen an in-app notification has to be shown or not
	notificationsInhibitors: NotificationsInhibitor[]
	// address of the berty daemon (now static, but changeable in devtools)
	daemonAddress: string
	// variable for AppInspector
	debugMode: boolean
	// TODO: fix the way to handle deeplink, this variable is needed to know the handle status of the link
	handledLink: boolean
}

export enum MESSENGER_APP_STATE {
	INIT = 'init',
	TO_OPEN = 'toOpen',
	OPENING = 'opening',
	SETUP_FINISHED = 'setupFinished',
	ONBOARDING_READY = 'onBoardingReady',
	READY = 'ready',
	STREAM = 'stream',
}

// function to see expected changes from a state to an other
const expectedAppStateChanges: {
	[key: string]: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE][]
} = {
	[MESSENGER_APP_STATE.INIT]: [MESSENGER_APP_STATE.TO_OPEN, MESSENGER_APP_STATE.ONBOARDING_READY],
	[MESSENGER_APP_STATE.TO_OPEN]: [MESSENGER_APP_STATE.OPENING],
	[MESSENGER_APP_STATE.OPENING]: [
		MESSENGER_APP_STATE.SETUP_FINISHED,
		MESSENGER_APP_STATE.READY,
		MESSENGER_APP_STATE.STREAM,
	],
	[MESSENGER_APP_STATE.SETUP_FINISHED]: [MESSENGER_APP_STATE.READY],
	[MESSENGER_APP_STATE.ONBOARDING_READY]: [MESSENGER_APP_STATE.TO_OPEN],
	[MESSENGER_APP_STATE.READY]: [MESSENGER_APP_STATE.STREAM],
	[MESSENGER_APP_STATE.STREAM]: [MESSENGER_APP_STATE.OPENING],
}

const isExpectedAppStateChange = (
	former: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
	next: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
): boolean => {
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

const initialState: UiState = {
	appState: MESSENGER_APP_STATE.INIT,
	isNewAccount: false,
	selectedAccount: null,
	accounts: [],
	messengerClient: null,
	protocolClient: null,
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

const changeAppState = (
	state: UiState,
	newAppState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
) => {
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
		setStateClients(
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
		setNextAccount(state: UiState, { payload }: PayloadAction<string | null | undefined>) {
			Object.keys(initialState).map(k => {
				if (['accounts'].indexOf(k) === -1) {
					//@ts-ignore
					state[k as keyof UiState] = initialState[k as keyof UiState]
				}
			})
			state.selectedAccount = payload || state.selectedAccount
			changeAppState(state, MESSENGER_APP_STATE.TO_OPEN)
		},
		setStateOpening(state: UiState) {
			state.appState = MESSENGER_APP_STATE.OPENING
		},
		setStateSetupFinished(state: UiState) {
			state.appState = MESSENGER_APP_STATE.SETUP_FINISHED
		},
		setStateReady(state: UiState) {
			state.isNewAccount = false
			state.appState = MESSENGER_APP_STATE.READY
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
			state.selectedAccount = payload?.accountId
			state.isNewAccount = true
			state.appState = MESSENGER_APP_STATE.TO_OPEN
		},
		setStateStreamInProgress(state: UiState, { payload }: PayloadAction<StreamInProgress | null>) {
			state.appState = MESSENGER_APP_STATE.STREAM
			state.streamInProgress = payload
		},
		setStateStreamDone(state: UiState) {
			state.appState = MESSENGER_APP_STATE.OPENING
			state.streamInProgress = null
		},
		setStreamError(state: UiState, { payload: { error } }: PayloadAction<{ error: unknown }>) {
			state.streamError = error
		},
		setStateOnBoardingReady(state: UiState) {
			state.appState = MESSENGER_APP_STATE.ONBOARDING_READY
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
	selectSlice(state).appState === MESSENGER_APP_STATE.INIT ||
	selectSlice(state).appState === MESSENGER_APP_STATE.TO_OPEN ||
	selectSlice(state).appState === MESSENGER_APP_STATE.OPENING

export const selectAppState = (
	state: LocalRootState,
): MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE] => selectSlice(state).appState

export const selectSelectedAccount = (state: LocalRootState): string | null =>
	selectSlice(state).selectedAccount

export const selectMessengerClient = (
	state: LocalRootState,
): ServiceClientType<beapi.messenger.MessengerService> | null => selectSlice(state).messengerClient

export const selectProtocolClient = (
	state: LocalRootState,
): ServiceClientType<beapi.protocol.ProtocolService> | null => selectSlice(state).protocolClient

export const selectDaemonAddress = (state: LocalRootState): string =>
	selectSlice(state).daemonAddress

export const selectDebugMode = (state: LocalRootState): boolean => selectSlice(state).debugMode

export const selectStreamInProgress = (state: LocalRootState): StreamInProgress | null =>
	selectSlice(state).streamInProgress

export const selectStreamError = (state: LocalRootState): any => selectSlice(state).streamError

export const selectNotificationsInhibitors = (state: LocalRootState): NotificationsInhibitor[] =>
	selectSlice(state).notificationsInhibitors

export const selectAccounts = (state: LocalRootState): beapi.account.IAccountMetadata[] =>
	selectSlice(state).accounts

export const selectHandledLink = (state: LocalRootState) => selectSlice(state).handledLink

export const {
	setStateOpening,
	setStateSetupFinished,
	setStateClients,
	setNextAccount,
	setStateReady,
	setCreatedAccount,
	setStateStreamInProgress,
	setStateStreamDone,
	setStateOnBoardingReady,
	setDebugMode,
	setStreamError,
	setAccounts,
	setDaemonAddress,
	setHandledLink,
	addNotificationInhibitor,
	removeNotificationInhibitor,
} = slice.actions

export default makeRoot(slice.reducer)
