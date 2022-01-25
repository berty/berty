import { Dispatch } from 'react'

import beapi from '@berty-tech/api'

// returns true if the notification should be inhibited
export type NotificationsInhibitor = (
	ctx: MessengerState,
	evt: beapi.messenger.StreamEvent.INotified,
) => boolean | 'sound-only'

export type StreamInProgress = {
	msg: beapi.protocol.IProgress
	stream: string
}

export type MessengerState = {
	daemonAddress: string
	streamError: any
	addNotificationListener: (cb: (evt: any) => void) => void
	removeNotificationListener: (cb: (...args: any[]) => void) => void
	notificationsInhibitors: NotificationsInhibitor[]
	persistentOptions: PersistentOptions
	accounts: beapi.account.IAccountMetadata[]
	dispatch: Dispatch<{
		type: MessengerActions
		payload?: any
	}>
	setPersistentOption: (arg0: PersistentOptionsUpdate) => Promise<void>
	createNewAccount: (arg0?: beapi.account.INetworkConfig) => Promise<void>
	importAccount: (arg0: string) => Promise<void>
	switchAccount: (arg0: string) => Promise<void>
	updateAccount: (arg0: any) => Promise<void>
	deleteAccount: () => Promise<void>
	getUsername: () => Promise<beapi.account.GetUsername.Reply | null>
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
	networkConfig: beapi.account.INetworkConfig
	setNetworkConfig: (value: beapi.account.INetworkConfig) => void
	handledLink: boolean
	setHandledLink: (value: boolean) => void
}

export enum PersistentOptionsKeys {
	Notifications = 'notifications',
	Suggestions = 'suggestions',
	Debug = 'debug',
	Log = 'log',
	Configurations = 'configurations',
	LogFilters = 'logFilters',
	TyberHost = 'tyberHost',
	OnBoardingFinished = 'onBoardingFinished',
	ProfileNotification = 'profileNotification',
}

export enum GlobalPersistentOptionsKeys {
	TyberHost = 'global-storage_tyber-host',
	DisplayName = 'displayName',
	IsNewAccount = 'isNewAccount',
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

export type PersistentOptionsLog = {
	format: string
}

export type Configuration = {
	key: 'network' | 'notification' | 'replicate'
	displayName: string
	desc: string
	icon: string
	state: 'added' | 'skipped' | 'unread'
	color: string
}

export type PersistentOptionsConfigurations = { [key: string]: Configuration }

export type PersistentOptionsPreset = {
	value: 'performance' | 'fullAnonymity'
}

export type PersistentOptionsLogFilters = {
	format: string
}

export type PersistentOptionsTyberHost = {
	address: string
}

export type PersistentOptionsOnBoardingFinished = {
	isFinished: boolean
}

export type CheckListItem = {
	title: string
	done?: boolean
	desc?: string
}

export const UpdatesProfileNotification = 'updates'
export type PersistentOptionsProfileNotification = {
	[UpdatesProfileNotification]: number
}

export type PersistentOptionsUpdate =
	| {
			type: typeof PersistentOptionsKeys.Notifications
			payload: Partial<PersistentOptionsNotifications>
	  }
	| {
			type: typeof PersistentOptionsKeys.Suggestions
			payload: Partial<PersistentOptionsSuggestions>
	  }
	| {
			type: typeof PersistentOptionsKeys.Debug
			payload: Partial<PersistentOptionsDebug>
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
			type: typeof PersistentOptionsKeys.LogFilters
			payload: PersistentOptionsLogFilters
	  }
	| {
			type: typeof PersistentOptionsKeys.TyberHost
			payload: PersistentOptionsTyberHost
	  }
	| {
			type: typeof PersistentOptionsKeys.OnBoardingFinished
			payload: PersistentOptionsOnBoardingFinished
	  }
	| {
			type: typeof PersistentOptionsKeys.ProfileNotification
			payload: PersistentOptionsProfileNotification
	  }

export type PersistentOptions = {
	[PersistentOptionsKeys.Notifications]: PersistentOptionsNotifications
	[PersistentOptionsKeys.Suggestions]: PersistentOptionsSuggestions
	[PersistentOptionsKeys.Debug]: PersistentOptionsDebug
	[PersistentOptionsKeys.Log]: PersistentOptionsLog
	[PersistentOptionsKeys.Configurations]: PersistentOptionsConfigurations
	[PersistentOptionsKeys.LogFilters]: PersistentOptionsLogFilters
	[PersistentOptionsKeys.TyberHost]: PersistentOptionsTyberHost
	[PersistentOptionsKeys.OnBoardingFinished]: PersistentOptionsOnBoardingFinished
	[PersistentOptionsKeys.ProfileNotification]: PersistentOptionsProfileNotification
}

export enum MessengerActions {
	SetStreamError = 'SET_STREAM_ERROR',
	AddFakeData = 'ADD_FAKE_DATA',
	DeleteFakeData = 'DELETE_FAKE_DATA',
	SetDaemonAddress = 'SET_DAEMON_ADDRESS',
	SetPersistentOption = 'SET_PERSISTENT_OPTION',
	SetNextAccount = 'SET_NEXT_ACCOUNT',
	SetStateClosed = 'SET_STATE_CLOSED',
	SetCreatedAccount = 'SET_STATE_CREATED_ACCOUNT',
	SetStateOpening = 'SET_STATE_OPENING',
	SetStateOpeningClients = 'SET_STATE_OPENING_CLIENTS',
	SetStateOpeningListingEvents = 'SET_STATE_LISTING_EVENTS',
	SetStateOpeningGettingLocalSettings = 'SET_STATE_OPENING_GETTING_LOCAL_SETTINGS',
	SetStateOpeningMarkConversationsClosed = 'SET_STATE_OPENING_MARK_CONVERSATION_CLOSED',
	SetStateStreamInProgress = 'SET_STATE_STREAM_IN_PROGRESS',
	SetStateStreamDone = 'SET_STATE_STREAM_DONE',
	SetStatePreReady = 'SET_STATE_PRE_READY',
	SetStateReady = 'SET_STATE_READY',
	SetStateOnBoardingReady = 'SET_ON_BOARDING_READY',
	SetAccounts = 'SET_ACCOUNTS',
	BridgeClosed = 'BRIDGE_CLOSED',
	AddNotificationInhibitor = 'ADD_NOTIFICATION_INHIBITOR',
	RemoveNotificationInhibitor = 'REMOVE_NOTIFICATION_INHIBITOR',
}

export declare type reducerAction = {
	type: MessengerActions
	payload?: any
	name?: string
}

export const soundsMap = {
	messageReceived: 'message_received.mp3',
	messageSent: 'message_sent.mp3',
	contactRequestSent: 'contact_request_sent.mp3',
	contactRequestReceived: 'contact_request_received.mp3',
	contactRequestAccepted: 'contact_request_accepted.mp3',
	groupCreated: 'group_created.mp3',
}

export type SoundKey = keyof typeof soundsMap
