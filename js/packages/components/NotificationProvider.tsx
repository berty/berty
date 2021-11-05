import React from 'react'
import { InAppNotificationProvider, withInAppNotification } from 'react-native-in-app-notification'

import { useMsgrContext } from '@berty-tech/store/hooks'

import NotificationBody from './NotificationBody'
import { NativeEventEmitter, NativeModules, Platform } from 'react-native'
import { accountService } from '@berty-tech/store/context'
import beapi from '@berty-tech/api'

const NotificationBridge: React.FC = withInAppNotification(({ showNotification }: any) => {
	const { addNotificationListener, removeNotificationListener } = useMsgrContext()

	React.useEffect(() => {
		let pushNotif = new NativeEventEmitter(NativeModules.EventEmitter)
		const pushNotifListener = async (data: any) => {
			console.log('FRONT PUSH NOTIF: pushNotifListener:', data)
			try {
				const push = await accountService.pushReceive({
					payload: data,
					tokenType:
						Platform.OS === 'ios'
							? beapi.push.PushServiceTokenType.PushTokenApplePushNotificationService
							: beapi.push.PushServiceTokenType.PushTokenFirebaseCloudMessaging,
				})
				console.log('decrypted push:', push)
				// if (flag === dont received) {
				// 	showNotification({
				// 		title: data,
				// 		message: data,
				// 		onPress: () => {},
				// 	})
				// }
			} catch (e) {
				console.log('Error: accountService.pushReceive:', e)
			}
		}
		const inAppNotifListener = (evt: any) => {
			console.log('inAppNotifListener')
			showNotification({
				title: evt.payload.title,
				message: evt.payload.body,
				onPress: evt.payload.onPress,
				additionalProps: evt,
			})
		}

		try {
			pushNotif.addListener('onPushReceived', pushNotifListener)
			addNotificationListener(inAppNotifListener)
		} catch (e) {
			console.log('Error: Push notif add listener failed: ' + e)
		}

		return () => {
			pushNotif.remove()
			removeNotificationListener(() => console.log('DELETE inAppNotifListener'))
		}
	}, [showNotification, addNotificationListener, removeNotificationListener])
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
