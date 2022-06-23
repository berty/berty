import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import beapi from '@berty/api'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { NotificationsInhibitor } from '@berty/utils/notification/notif-in-app'
import { StreamProgressType } from '@berty/utils/protocol/progress.types'

/**
 *
 * Types
 *
 */

type UiState = {
	selectedAccount: string | null
	accounts: beapi.account.IAccountMetadata[]
	// clients
	messengerClient: ServiceClientType<beapi.messenger.MessengerService> | null
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null
	clearClients: () => Promise<void>
	// variable to have more infos on streams
	streamError: any
	streamProgress: StreamProgressType | null
	// notifications inhibitors to know if in the current screen an in-app notification has to be shown or not
	notificationsInhibitors: NotificationsInhibitor[]
	// variable for AppInspector
	debugMode: boolean
	// show the dev mode button in settings
	devMode: boolean
	// TODO: fix the way to handle deeplink, this variable is needed to know the handle status of the link
	handledLink: boolean
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
	selectedAccount: null,
	accounts: [],
	messengerClient: null,
	protocolClient: null,
	clearClients: async () => {},
	streamError: null,
	streamProgress: null,
	notificationsInhibitors: [],
	debugMode: false,
	devMode: false,
	handledLink: false,
}

const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState

/**
 *
 * Actions
 *
 */

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
		setStreamProgress(state: UiState, { payload }: PayloadAction<StreamProgressType | null>) {
			state.streamProgress = payload
		},
		setStreamDone(state) {
			state.streamProgress = null
		},
		setStreamError(state: UiState, { payload: { error } }: PayloadAction<{ error: unknown }>) {
			state.streamError = error
		},
		setDebugMode(state: UiState, { payload }: PayloadAction<boolean>) {
			state.debugMode = payload
		},
		setDevMode(state: UiState, { payload }: PayloadAction<boolean>) {
			state.devMode = payload
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

export const selectSelectedAccount = (state: LocalRootState) => selectSlice(state).selectedAccount

export const selectMessengerClient = (state: LocalRootState) => selectSlice(state).messengerClient

export const selectProtocolClient = (state: LocalRootState) => selectSlice(state).protocolClient

export const selectDebugMode = (state: LocalRootState) => selectSlice(state).debugMode

export const selectDevMode = (state: LocalRootState) => selectSlice(state).devMode

export const selectStreamProgress = (state: LocalRootState) => selectSlice(state).streamProgress

export const selectStreamError = (state: LocalRootState) => selectSlice(state).streamError

export const selectNotificationsInhibitors = (state: LocalRootState) =>
	selectSlice(state).notificationsInhibitors

export const selectAccounts = (state: LocalRootState) => selectSlice(state).accounts

export const selectHandledLink = (state: LocalRootState) => selectSlice(state).handledLink

export const {
	setClients,
	setClearClients,
	setSelectedAccount,
	setStreamProgress,
	setStreamDone,
	setDebugMode,
	setDevMode,
	setStreamError,
	setAccounts,
	setHandledLink,
	addNotificationInhibitor,
	removeNotificationInhibitor,
} = slice.actions

export default makeRoot(slice.reducer)
