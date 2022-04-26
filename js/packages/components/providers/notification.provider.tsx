import React, { useContext } from 'react'
import { EmitterSubscription, NativeEventEmitter, NativeModules, Platform } from 'react-native'
import { CommonActions } from '@react-navigation/native'
import { InAppNotificationProvider, withInAppNotification } from 'react-native-in-app-notification'

import { accountService } from '@berty/store'
import beapi from '@berty/api'
import { useNavigation } from '@berty/navigation'
import { useConversationsDict } from '@berty/hooks'
import { EventEmitterContext } from '@berty/contexts/eventEmitter.context'

import NotificationBody from '../NotificationBody'

const PushNotificationBridge: React.FC = withInAppNotification(({ showNotification }: any) => {
	const conversations = useConversationsDict()
	const { navigate, dispatch } = useNavigation()

	React.useEffect(() => {
		const pushNotifListener = async (data: any) => {
			const push = await accountService.pushReceive({
				payload: data,
				tokenType:
					Platform.OS === 'ios'
						? beapi.push.PushServiceTokenType.PushTokenApplePushNotificationService
						: beapi.push.PushServiceTokenType.PushTokenFirebaseCloudMessaging,
			})
			if (!push.pushData?.alreadyReceived) {
				const convPK = push.pushData?.conversationPublicKey
				if (convPK) {
					const conv = conversations[convPK]
					showNotification({
						title: push.push?.title,
						message: push.push?.body,
						onPress: () => {
							dispatch(
								CommonActions.reset({
									routes: [
										{ name: 'Chat.Home' },
										{
											name:
												conv?.type === beapi.messenger.Conversation.Type.MultiMemberType
													? 'Chat.Group'
													: 'Chat.OneToOne',
											params: {
												convId: convPK,
											},
										},
									],
								}),
							)
						},
						additionalProps: { type: 'message' },
					})
				}
			}
		}
		let eventListener: EmitterSubscription | undefined
		if (NativeModules.EventEmitter) {
			try {
				eventListener = new NativeEventEmitter(NativeModules.EventEmitter).addListener(
					'onPushReceived',
					pushNotifListener,
				)
			} catch (e) {
				console.warn('Push notif add listener failed: ' + e)
			}
		}
		return () => {
			try {
				eventListener?.remove() // Unsubscribe from native event emitter
			} catch (e) {
				console.warn('Push notif remove listener failed: ' + e)
			}
		}
	}, [conversations, dispatch, navigate, showNotification])
	return null
})

const NotificationBridge: React.FC = withInAppNotification(({ showNotification }: any) => {
	const eventEmitter = useContext(EventEmitterContext)

	React.useEffect(() => {
		const inAppNotifListener = (evt: any) => {
			showNotification({
				title: evt.payload.title,
				message: evt.payload.body,
				onPress: evt.payload.onPress,
				additionalProps: evt,
			})
		}

		let added = false
		try {
			eventEmitter.addListener('notification', inAppNotifListener)
			added = true
		} catch (e) {
			console.log('Error: Push notif add listener failed: ' + e)
		}

		return () => {
			if (added) {
				eventEmitter.removeListener('notification', inAppNotifListener)
			}
		}
	}, [showNotification, eventEmitter])
	return null
})

const NotificationProvider: React.FC = ({ children }) =>
	Platform.OS !== 'web' ? (
		<InAppNotificationProvider
			notificationBodyComponent={NotificationBody}
			backgroundColour='transparent'
			closeInterval={5000}
		>
			<>
				<NotificationBridge />
				<PushNotificationBridge />
				{children}
			</>
		</InAppNotificationProvider>
	) : (
		<>{children}</>
	)

export default NotificationProvider
