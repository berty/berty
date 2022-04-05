import { Dispatch } from 'react'

import beapi from '@berty/api'

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
	accounts: beapi.account.IAccountMetadata[]
	dispatch: Dispatch<{
		type: MessengerActions
		payload?: any
	}>
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
	handledLink: boolean
	setHandledLink: (value: boolean) => void
}

export enum GlobalPersistentOptionsKeys {
	TyberHost = 'global-storage_tyber-host',
	DisplayName = 'displayName',
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
