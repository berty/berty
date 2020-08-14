import React, { useEffect, useRef } from 'react'
// import { useSelector } from 'react-redux'
import { withInAppNotification, InAppNotificationProvider } from 'react-native-in-app-notification'
import NotificationBody from './NotificationBody'
// import { Messenger } from '@berty-tech/hooks'

// Selector for notif
// const useLastNotification = () => {
// 	return useSelector((state) => query)
// }

// function usePrevious(value) {
// 	const ref = useRef()
// 	useEffect(() => {
// 		ref.current = value
// 	})
// 	return ref.current
// }

const NotificationBasicType = 'Basic'
const NotificationMessageType = 'Message'

// This should transform the store notifications (redux) into react notifications
const Bridge = withInAppNotification((props) => {
	const { showNotification } = props
	const notif = {
		type: NotificationBasicType,
		title: 'Test',
		message: 'Contact request sent',
	}
	const messageNotif = {
		type: NotificationMessageType,
		convTitle: 'Test',
		convId: '',
		body: 'Je suis une message notif',
	}
	// const notif = useLastNotification()
	// const previousNotif = usePrevious(notif)
	// Get conv if it's message notif
	// const conv = Messenger.useGetConversation(notif.convId || '')
	useEffect(() => {
		// if (notif && notif !== previousNotif) {
		// 	switch (notif.type) {
		// 		case NotificationBasicType:
		// 			showNotification({
		// 				title: notif.title,
		// 				message: notif.message,
		// 			})
		// 			break
		// 		case NotificationMessageType:
		// 			if (conv) {
		// 				showNotification({
		// 					title: notif.title,
		// 					message: notif.message,
		// 					onPress: () => {
		// 						TODO navigate to the conv
		// 					}
		// 				})
		// 			}
		// 			break
		// 	}
		// }
		showNotification({
			title: notif.title,
			message: notif.message,
		})
	})
	// }, [conv, dispatch, notif, previousNotif, showNotification])
	return null
})

const NotificationsProviderInternal = ({ children }) => (
	<>
		<Bridge />
		{children}
	</>
)

const NotificationsProvider = ({ children }) => {
	return (
		<InAppNotificationProvider
			notificationBodyComponent={NotificationBody}
			backgroundColour='transparent'
			closeInterval={50000}
		>
			<NotificationsProviderInternal>{children}</NotificationsProviderInternal>
		</InAppNotificationProvider>
	)
}

export default NotificationsProvider
