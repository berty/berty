import beapi from '@berty/api'

// returns true if the notification should be inhibited
export type NotificationsInhibitor = (
	evt: beapi.messenger.StreamEvent.INotified,
) => boolean | 'sound-only'

export type StreamInProgress = {
	msg: beapi.protocol.IProgress
	stream: string
}

export enum GlobalPersistentOptionsKeys {
	TyberHost = 'global-storage_tyber-host',
	DisplayName = 'displayName',
	IsNewAccount = 'isNewAccount',
	IsHidden = 'isHidden',
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
