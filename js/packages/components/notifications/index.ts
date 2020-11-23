import beapi from '@berty-tech/api'

import Basic from './Basic'
import ContactRequestReceived from './ContactRequestReceived'
import ContactRequestSent from './ContactRequestSent'
import MessageReceived from './MessageReceived'

const T = beapi.messenger.StreamEvent.Notified.Type

const notifications = {
	[T.Unknown]: Basic,
	[T.TypeBasic]: Basic,
	[T.TypeContactRequestReceived]: ContactRequestReceived,
	[T.TypeContactRequestSent]: ContactRequestSent,
	[T.TypeMessageReceived]: MessageReceived,
}

export default notifications

export { Basic as DefaultNotification }

export type NotificationKey = keyof typeof notifications
