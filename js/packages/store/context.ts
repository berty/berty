import { Dispatch, createContext, useContext } from 'react'
import { berty } from '@berty-tech/api/index.pb'

export enum MessengerAppState {
	Init = 0,
	Closed,
	OpeningWaitingForDaemon,
	OpeningWaitingForClients,
	OpeningListingEvents,
	OpeningGettingLocalSettings,
	OpeningMarkConversationsAsClosed,
	GetStarted,
	OnBoarding,
	Ready,
	ClosingDaemon,
	DeletingClosingDaemon,
	DeletingClearingStorage,
}

export enum MessengerActions {
	SetInitDone = 'SET_INIT_DONE',
	SetStreamError = 'SET_STREAM_ERROR',
	AddFakeData = 'ADD_FAKE_DATA',
	DeleteFakeData = 'DELETE_FAKE_DATA',
	SetDaemonAddress = 'SET_DAEMON_ADDRESS',
	SetPersistentOption = 'SET_PERSISTENT_OPTION',
	SetNextAccount = 'SET_NEXT_ACCOUNT',
	SetStateClosed = 'SET_STATE_CLOSED',
	SetStateOnBoarding = 'SET_STATE_ON_BOARDING',
	SetCreatedAccount = 'SET_STATE_CREATED_ACCOUNT',
	SetStateOpening = 'SET_STATE_OPENING',
	SetStateOpeningClients = 'SET_STATE_OPENING_CLIENTS',
	SetStateOpeningListingEvents = 'SET_STATE_LISTING_EVENTS',
	SetStateOpeningGettingLocalSettings = 'SET_STATE_OPENING_GETTING_LOCAL_SETTINGS',
	SetStateOpeningMarkConversationsClosed = 'SET_STATE_OPENING_MARK_CONVERSATION_CLOSED',
	SetStateReady = 'SET_STATE_READY',
	SetStateClosing = 'SET_STATE_CLOSING',
	SetStateDeleting = 'SET_STATE_DELETING',
	SetAccounts = 'SET_ACCOUNTS',
	Restart = 'RESTART',
	BridgeClosed = 'BRIDGE_CLOSED',
	AddNotificationInhibitor = 'ADD_NOTIFICATION_INHIBITOR',
	RemoveNotificationInhibitor = 'REMOVE_NOTIFICATION_INHIBITOR',
}

export const isDeletingState = (state: MessengerAppState): boolean =>
	state === MessengerAppState.DeletingClearingStorage ||
	state === MessengerAppState.DeletingClosingDaemon

export const isClosing = (state: MessengerAppState): boolean =>
	isDeletingState(state) || state === MessengerAppState.ClosingDaemon

export const isReadyingBasics = (state: MessengerAppState): boolean =>
	state === MessengerAppState.OpeningWaitingForDaemon ||
	state === MessengerAppState.OpeningWaitingForClients ||
	state === MessengerAppState.OpeningListingEvents ||
	state === MessengerAppState.OpeningGettingLocalSettings

const expectedAppStateChanges = {
	[MessengerAppState.Init]: [
		MessengerAppState.Closed,
		MessengerAppState.OpeningWaitingForClients,
		MessengerAppState.OpeningWaitingForDaemon,
	],
	[MessengerAppState.Closed]: [
		MessengerAppState.OpeningWaitingForClients,
		MessengerAppState.OpeningWaitingForDaemon,
		MessengerAppState.ClosingDaemon,
	],
	[MessengerAppState.OpeningWaitingForDaemon]: [MessengerAppState.OpeningWaitingForClients],
	[MessengerAppState.OpeningWaitingForClients]: [MessengerAppState.OpeningListingEvents],
	[MessengerAppState.OpeningListingEvents]: [MessengerAppState.OpeningGettingLocalSettings],
	[MessengerAppState.OpeningGettingLocalSettings]: [
		MessengerAppState.OpeningMarkConversationsAsClosed,
	],
	[MessengerAppState.OpeningMarkConversationsAsClosed]: [
		MessengerAppState.Ready,
		MessengerAppState.OnBoarding,
		MessengerAppState.GetStarted,
	],
	[MessengerAppState.GetStarted]: [
		MessengerAppState.OnBoarding,
		MessengerAppState.DeletingClosingDaemon,
		MessengerAppState.Closed,
		MessengerAppState.Ready,
	],
	[MessengerAppState.OnBoarding]: [
		MessengerAppState.Closed,
		MessengerAppState.Ready,
		MessengerAppState.DeletingClosingDaemon,
	],
	[MessengerAppState.Ready]: [
		MessengerAppState.DeletingClosingDaemon,
		MessengerAppState.ClosingDaemon,
	],
	[MessengerAppState.ClosingDaemon]: [
		MessengerAppState.Closed,
		MessengerAppState.OpeningWaitingForDaemon,
		MessengerAppState.OpeningWaitingForClients,
	],
	[MessengerAppState.DeletingClosingDaemon]: [MessengerAppState.DeletingClearingStorage],
	[MessengerAppState.DeletingClearingStorage]: [
		MessengerAppState.Closed,
		MessengerAppState.OpeningWaitingForDaemon,
	],
}

export const isExpectedAppStateChange = (
	former: MessengerAppState,
	next: MessengerAppState,
): boolean => {
	if (former === next) {
		return true
	}

	return (expectedAppStateChanges[former] || []).indexOf(next) !== -1
}

export enum PersistentOptionsKeys {
	I18N = 'i18n',
	Notifications = 'notifications',
	BetaBot = 'betabot',
	BLE = 'ble',
	MC = 'mc',
	Debug = 'debug',
}

export type PersistentOptionsI18N = {
	language: string
}

export type PersistentOptionsNotifications = {
	enable: boolean
}

export type PersistentOptionsBetaBot = {
	convPk: string | null
	added: boolean
	toggledModal: boolean
}

export type PersistentOptionsBLE = {
	enable: boolean
}

export type PersistentOptionsMC = {
	enable: boolean
}

export type PersistentOptionsDebug = {
	enable: boolean
}

export type PersistentOptionsUpdate =
	| {
			type: typeof PersistentOptionsKeys.I18N
			payload: Partial<PersistentOptionsI18N>
	  }
	| {
			type: typeof PersistentOptionsKeys.Notifications
			payload: Partial<PersistentOptionsNotifications>
	  }
	| {
			type: typeof PersistentOptionsKeys.BetaBot
			payload: Partial<PersistentOptionsBetaBot>
	  }
	| {
			type: typeof PersistentOptionsKeys.BLE
			payload: Partial<PersistentOptionsBLE>
	  }
	| {
			type: typeof PersistentOptionsKeys.MC
			payload: Partial<PersistentOptionsMC>
	  }
	| {
			type: typeof PersistentOptionsKeys.Debug
			payload: Partial<PersistentOptionsDebug>
	  }

export type PersistentOptions = {
	[PersistentOptionsKeys.I18N]: PersistentOptionsI18N
	[PersistentOptionsKeys.Notifications]: PersistentOptionsNotifications
	[PersistentOptionsKeys.BetaBot]: PersistentOptionsBetaBot
	[PersistentOptionsKeys.BLE]: PersistentOptionsBLE
	[PersistentOptionsKeys.MC]: PersistentOptionsMC
	[PersistentOptionsKeys.Debug]: PersistentOptionsDebug
}

export const defaultPersistentOptions = (): PersistentOptions => ({
	[PersistentOptionsKeys.I18N]: {
		language: 'en',
	},
	[PersistentOptionsKeys.Notifications]: {
		enable: true,
	},
	[PersistentOptionsKeys.BetaBot]: {
		added: false,
		convPk: null,
		toggledModal: false,
	},
	[PersistentOptionsKeys.BLE]: {
		enable: true,
	},
	[PersistentOptionsKeys.MC]: {
		enable: true,
	},
	[PersistentOptionsKeys.Debug]: {
		enable: false,
	},
})

// returns true if the notification should be inhibited
export type NotificationsInhibitor = (
	ctx: MsgrState,
	evt: berty.messenger.v1.StreamEvent.INotified,
) => boolean | 'sound-only'

export type MsgrState = {
	selectedAccount: string | null
	nextSelectedAccount: string | null
	daemonAddress: string

	appState: MessengerAppState
	account: any
	conversations: { [key: string]: berty.messenger.v1.IConversation | undefined }
	contacts: { [key: string]: berty.messenger.v1.IContact | undefined }
	interactions: {
		[key: string]: { [key: string]: berty.messenger.v1.IInteraction | undefined } | undefined
	}
	members: {
		[key: string]: { [key: string]: berty.messenger.v1.IMember | undefined } | undefined
	}
	client: berty.messenger.v1.MessengerService | null
	protocolClient: berty.protocol.v1.ProtocolService | null
	streamError: any

	addNotificationListener: (cb: (evt: any) => void) => void
	removeNotificationListener: (cb: (...args: any[]) => void) => void
	notificationsInhibitors: NotificationsInhibitor[]

	persistentOptions: PersistentOptions
	accounts: berty.account.v1.IAccountMetadata[]
	initialListComplete: boolean
	clearDaemon: (() => Promise<void>) | null
	clearClients: (() => Promise<void>) | null

	embedded: boolean
	dispatch: Dispatch<{
		type: berty.messenger.v1.StreamEvent.Type | MessengerActions
		payload?: any
	}>
	setPersistentOption: (arg0: PersistentOptionsUpdate) => Promise<void>
	createNewAccount: () => void
	importAccount: (arg0: string) => Promise<void>
}

export const initialState = {
	appState: MessengerAppState.Init,
	selectedAccount: null,
	nextSelectedAccount: null,
	account: null,
	conversations: {},
	contacts: {},
	interactions: {},
	members: {},
	client: null,
	protocolClient: null,
	streamError: null,

	addNotificationListener: () => {},
	removeNotificationListener: () => {},
	notificationsInhibitors: [],

	persistentOptions: defaultPersistentOptions(),
	daemonAddress: '',
	initialListComplete: false,
	clearDaemon: null,
	clearClients: null,

	embedded: true,
	dispatch: () => {},
	setPersistentOption: async () => {},
	createNewAccount: () => {},
	importAccount: async () => {},
	accounts: [],
}

export const MsgrContext = createContext<MsgrState>(initialState)

export default MsgrContext

export const useMsgrContext = (): MsgrState => useContext(MsgrContext)
