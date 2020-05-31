import React, { useEffect, useRef } from 'react'
import { withInAppNotification } from 'react-native-in-app-notification'
import { Chat, Notifications } from '@berty-tech/hooks'
import { Routes } from '@berty-tech/berty-navigation'
import { chat } from '@berty-tech/store'
import { useDispatch } from 'react-redux'
import { CommonActions } from '@react-navigation/native'
import NotificationBody from './NotificationBody'
import { InAppNotificationProvider } from 'react-native-in-app-notification'

function usePrevious<T>(value: T) {
	// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
	const ref = useRef<T>()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

// This should transform the store notifications (redux) into react notifications
const Bridge: React.FC = withInAppNotification(
	(props: { showNotification: (...args: any[]) => void }) => {
		const { showNotification } = props
		const dispatch = useDispatch()
		const notif = Notifications.useLastNotification()
		const previousNotif = usePrevious(notif)
		const conv = Chat.useGetConversation(notif?.convId || '')
		useEffect(() => {
			if (notif && notif !== previousNotif) {
				switch (notif.type) {
					case Notifications.Type.Basic:
						showNotification({
							title: notif.title,
							message: notif.message,
						})
						break
					case Notifications.Type.MessageReceived:
						// TODO: make navigateToConversation(convId) function
						if (conv) {
							showNotification({
								title: notif.convTitle,
								message: notif.body,
								// FIXME
								onPress:
									conv.kind === chat.conversation.ConversationKind.MultiMember
										? () =>
												dispatch(
													CommonActions.navigate({
														name: Routes.Chat.Group,
														params: {
															convId: conv.id,
														},
													}),
												)
										: () =>
												dispatch(
													CommonActions.navigate({
														name: Routes.Chat.One2One,
														params: {
															convId: conv.id,
														},
													}),
												),
							})
						}
						break
				}
			}
		}, [conv, dispatch, notif, previousNotif, showNotification])
		return null
	},
)

const NotificationsProviderInternal: React.FC = ({ children }) => (
	<>
		<Bridge />
		{children}
	</>
)

const NotificationsProvider: React.FC = ({ children }) => {
	return (
		<InAppNotificationProvider
			notificationBodyComponent={NotificationBody}
			backgroundColour='transparent'
		>
			<NotificationsProviderInternal>{children}</NotificationsProviderInternal>
		</InAppNotificationProvider>
	)
}

export default NotificationsProvider
