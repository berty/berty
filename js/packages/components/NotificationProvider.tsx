import React from 'react'
import { InAppNotificationProvider, withInAppNotification } from 'react-native-in-app-notification'

import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { useMsgrContext } from '@berty-tech/store/hooks'

import NotificationBody from './NotificationBody'

const NotificationBridge: React.FC = withInAppNotification(({ showNotification }: any) => {
	const {
		addNotificationListener,
		removeNotificationListener,
		contacts,
		persistentOptions,
	} = useMsgrContext()

	React.useEffect(() => {
		const listener = (evt: any) => {
			const contact = Object.values(contacts).find(
				(c: any) => c.conversationPublicKey === evt.payload.publicKey,
			)
			const isValid =
				contact.state !== messengerpb.Contact.State.IncomingRequest &&
				contact.state !== messengerpb.Contact.State.Undefined
			// check if message comes from valid contact
			if (isValid && persistentOptions && persistentOptions.convPk !== evt.payload.publicKey) {
				showNotification({
					title: evt.payload.title,
					message: evt.payload.body,
					additionalProps: evt,
				})
				addNotificationListener(listener)
			}
		}
		return () => removeNotificationListener(listener)
	}, [
		showNotification,
		addNotificationListener,
		removeNotificationListener,
		contacts,
		persistentOptions,
	])
	return null
})

const NotificationProvider: React.FC = ({ children }) => (
	<InAppNotificationProvider
		notificationBodyComponent={NotificationBody}
		backgroundColour='transparent'
		closeInterval={5000}
	>
		<>
			<NotificationBridge />
			{children}
		</>
	</InAppNotificationProvider>
)

export default NotificationProvider
