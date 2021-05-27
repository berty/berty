import { Dispatch, createContext, useContext } from 'react'

import beapi from '@berty-tech/api'
import { ServiceClientType } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import { globals } from '@berty-tech/config'
import { Service } from '@berty-tech/grpc-bridge'
import rpcBridge from '@berty-tech/grpc-bridge/rpc/rpc.bridge'

import { ParsedInteraction } from './types.gen'
import { SoundKey } from './sounds'
import { Platform } from 'react-native'

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
	StreamDone,
}

export enum MessengerActions {
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
	SetStateStreamInProgress = 'SET_STATE_STREAM_IN_PROGRESS',
	SetStateStreamDone = 'SET_STATE_STREAM_DONE',
	SetStateReady = 'SET_STATE_READY',
	SetAccounts = 'SET_ACCOUNTS',
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
	state === MessengerAppState.OpeningGettingLocalSettings ||
	state === MessengerAppState.Closed ||
	state === MessengerAppState.OpeningMarkConversationsAsClosed ||
	state === MessengerAppState.StreamDone ||
	state === MessengerAppState.Init

const expectedAppStateChanges: any = {
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
	[MessengerAppState.OpeningWaitingForClients]: [
		MessengerAppState.OpeningListingEvents,
		MessengerAppState.OpeningMarkConversationsAsClosed,
	],
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
		MessengerAppState.OpeningWaitingForClients,
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
	Suggestions = 'suggestions',
	BLE = 'ble',
	MC = 'mc',
	Nearby = 'nearby',
	Debug = 'debug',
	Tor = 'tor',
	Log = 'log',
	Configurations = 'configurations',
	WelcomeModal = 'welcomeModal',
	Preset = 'preset',
	LogFilters = 'logFilters',
	TyberHost = 'tyberHost',
}

export type PersistentOptionsI18N = {
	language: string
}

export type PersistentOptionsNotifications = {
	enable: boolean
}

export type Suggestion = {
	link: string
	displayName: string
	// added | skipped | unread
	state: string
	pk: string
	icon: string
}

export type PersistentOptionsSuggestions = {
	[key: string]: Suggestion
}

export type PersistentOptionsBLE = {
	enable: boolean
}

export type PersistentOptionsMC = {
	enable: boolean
}

export type PersistentOptionsNearby = {
	enable: boolean
}

export type PersistentOptionsDebug = {
	enable: boolean
}

export type PersistentOptionsTor = {
	flag: string
}

export type PersistentOptionsLog = {
	format: string
}

export type Configuration = {
	key: 'network' | 'notification'
	displayName: string
	desc: string
	icon: string
	state: 'added' | 'skipped' | 'unread'
	color: string
}

export type PersistentOptionsWelcomeModal = {
	enable: boolean
}
export type PersistentOptionsConfigurations = { [key: string]: Configuration }

export type PersistentOptionsPreset = {
	value: 'performance' | 'full-anonymity'
}

export type PersistentOptionsLogFilters = {
	format: string
}

export type PersistentOptionsTyberHost = {
	address: string
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
			type: typeof PersistentOptionsKeys.Suggestions
			payload: Partial<PersistentOptionsSuggestions>
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
			type: typeof PersistentOptionsKeys.Nearby
			payload: Partial<PersistentOptionsNearby>
	  }
	| {
			type: typeof PersistentOptionsKeys.Debug
			payload: Partial<PersistentOptionsDebug>
	  }
	| {
			type: typeof PersistentOptionsKeys.Tor
			payload: Partial<PersistentOptionsTor>
	  }
	| {
			type: typeof PersistentOptionsKeys.Log
			payload: Partial<PersistentOptionsLog>
	  }
	| {
			type: typeof PersistentOptionsKeys.Configurations
			payload: Partial<PersistentOptionsConfigurations>
	  }
	| {
			type: typeof PersistentOptionsKeys.WelcomeModal
			payload: PersistentOptionsWelcomeModal
	  }
	| {
			type: typeof PersistentOptionsKeys.Preset
			payload: PersistentOptionsPreset
	  }
	| {
			type: typeof PersistentOptionsKeys.LogFilters
			payload: PersistentOptionsLogFilters
	  }
	| {
			type: typeof PersistentOptionsKeys.TyberHost
			payload: PersistentOptionsTyberHost
	  }

export type PersistentOptions = {
	[PersistentOptionsKeys.I18N]: PersistentOptionsI18N
	[PersistentOptionsKeys.Notifications]: PersistentOptionsNotifications
	[PersistentOptionsKeys.Suggestions]: PersistentOptionsSuggestions
	[PersistentOptionsKeys.BLE]: PersistentOptionsBLE
	[PersistentOptionsKeys.MC]: PersistentOptionsMC
	[PersistentOptionsKeys.Nearby]: PersistentOptionsNearby
	[PersistentOptionsKeys.Debug]: PersistentOptionsDebug
	[PersistentOptionsKeys.Tor]: PersistentOptionsTor
	[PersistentOptionsKeys.Log]: PersistentOptionsLog
	[PersistentOptionsKeys.Configurations]: PersistentOptionsConfigurations
	[PersistentOptionsKeys.WelcomeModal]: PersistentOptionsWelcomeModal
	[PersistentOptionsKeys.Preset]: PersistentOptionsPreset
	[PersistentOptionsKeys.LogFilters]: PersistentOptionsLogFilters
	[PersistentOptionsKeys.TyberHost]: PersistentOptionsTyberHost
}

export const defaultPersistentOptions = (): PersistentOptions => {
	let suggestions: PersistentOptionsSuggestions = {}
	Object.values(globals.berty.contacts).forEach(async (value) => {
		if (value.suggestion) {
			suggestions = {
				...suggestions,
				[value.name]: {
					link: value.link,
					displayName: value.name,
					state: 'unread',
					pk: '',
					icon: value.icon,
				},
			}
		}
	})
	return {
		[PersistentOptionsKeys.I18N]: {
			language: 'en-US',
		},
		[PersistentOptionsKeys.Notifications]: {
			enable: true,
		},
		[PersistentOptionsKeys.Suggestions]: suggestions,
		[PersistentOptionsKeys.BLE]: {
			enable: true,
		},
		[PersistentOptionsKeys.MC]: {
			enable: true,
		},
		[PersistentOptionsKeys.Nearby]: {
			enable: true,
		},
		[PersistentOptionsKeys.Debug]: {
			enable: false,
		},
		[PersistentOptionsKeys.Tor]: {
			flag: 'disabled',
		},
		[PersistentOptionsKeys.Log]: {
			format: 'json',
		},
		[PersistentOptionsKeys.Configurations]: {
			network: {
				key: 'network',
				displayName: 'main.configurations.network.display-name',
				desc: 'main.configurations.network.desc',
				icon: 'berty_dev_blue_bg',
				state: 'unread',
				color: '#EBECFD',
			},
			notification: {
				key: 'notification',
				displayName: 'main.configurations.notification.display-name',
				desc: 'main.configurations.notification.desc',
				icon: 'berty_bot_orange_bg',
				state: 'unread',
				color: '#FDE9EF',
			},
		},
		[PersistentOptionsKeys.WelcomeModal]: {
			enable: true,
		},
		[PersistentOptionsKeys.Preset]: {
			value: 'performance',
		},
		[PersistentOptionsKeys.LogFilters]: {
			format: '*:bty*',
		},
		[PersistentOptionsKeys.TyberHost]: {
			address: Platform.OS === 'android' ? '10.0.2.2:4242' : '127.0.0.1:4242',
		},
	}
}

// returns true if the notification should be inhibited
export type NotificationsInhibitor = (
	ctx: MsgrState,
	evt: beapi.messenger.StreamEvent.INotified,
) => boolean | 'sound-only'

export type StreamInProgress = {
	msg: beapi.protocol.Progress
	stream: string
}

export type MsgrState = {
	selectedAccount: string | null
	nextSelectedAccount: string | null
	daemonAddress: string
	streamInProgress: StreamInProgress | null
	isNewAccount: boolean | null

	appState: MessengerAppState
	account?: beapi.messenger.IAccount | null
	conversations: { [key: string]: beapi.messenger.IConversation | undefined }
	contacts: { [key: string]: beapi.messenger.IContact | undefined }
	interactions: {
		[key: string]: ParsedInteraction[]
	}
	members: {
		[key: string]: { [key: string]: beapi.messenger.IMember | undefined } | undefined
	}
	medias: {
		[key: string]: beapi.messenger.IMedia | undefined
	}
	client: ServiceClientType<beapi.messenger.MessengerService> | null
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null
	streamError: any

	addNotificationListener: (cb: (evt: any) => void) => void
	removeNotificationListener: (cb: (...args: any[]) => void) => void
	notificationsInhibitors: NotificationsInhibitor[]

	persistentOptions: PersistentOptions
	accounts: beapi.account.IAccountMetadata[]
	initialListComplete: boolean
	clearClients: (() => Promise<void>) | null

	embedded: boolean
	dispatch: Dispatch<{
		type: beapi.messenger.StreamEvent.Type | MessengerActions
		payload?: any
	}>

	setPersistentOption: (arg0: PersistentOptionsUpdate) => Promise<void>
	createNewAccount: () => Promise<void>
	importAccount: (arg0: string) => Promise<void>
	switchAccount: (arg0: string) => Promise<void>
	updateAccount: (arg0: any) => Promise<void>
	deleteAccount: () => Promise<void>
	restart: () => Promise<void>
	playSound: (arg0: SoundKey) => void
	addReaction: (
		convPK: string,
		targetCID: string,
		emoji: string,
	) => Promise<beapi.messenger.Interact.Reply> | undefined
	removeReaction: (
		convPK: string,
		targetCID: string,
		emoji: string,
	) => Promise<beapi.messenger.Interact.Reply> | undefined

	debugMode: boolean
	setDebugMode: (value: boolean) => void
}

export const initialState = {
	appState: MessengerAppState.Init,
	selectedAccount: null,
	nextSelectedAccount: null,
	conversations: {},
	contacts: {},
	interactions: {},
	members: {},
	medias: {},
	client: null,
	protocolClient: null,
	streamError: null,
	streamInProgress: null,
	isNewAccount: null,

	addNotificationListener: () => {},
	removeNotificationListener: () => {},
	notificationsInhibitors: [],

	persistentOptions: defaultPersistentOptions(),
	daemonAddress: '',
	initialListComplete: false,
	clearClients: null,

	embedded: true,
	dispatch: () => {},

	setPersistentOption: async () => {},
	createNewAccount: async () => {},
	importAccount: async () => {},
	switchAccount: async () => {},
	updateAccount: async () => {},
	deleteAccount: async () => {},
	restart: async () => {},
	setDebugMode: () => {},
	playSound: () => {},
	debugMode: true,
	accounts: [],
	addReaction: () => undefined,
	removeReaction: () => undefined,
}

export const MsgrContext = createContext<MsgrState>(initialState)

export default MsgrContext

export const useMsgrContext = (): MsgrState => useContext(MsgrContext)

export declare type reducerAction = {
	type: beapi.messenger.StreamEvent.Type | MessengerActions
	payload?: any
	name?: string
}

export const accountService = Service(beapi.account.AccountService, rpcBridge, null)
