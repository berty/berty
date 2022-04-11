import React from 'react'
import { EmitterSubscription, NativeEventEmitter, NativeModules, Platform } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import { useMessengerContext } from '@berty/store/context'
import { accountService } from '@berty/store'
import beapi from '@berty/api'
import { useNavigation } from '@berty/navigation'
import { useConversationsDict } from '@berty/react-redux'
import { InAppNotificationProvider, withInAppNotification } from 'react-native-in-app-notification'

import NotificationBody from '../NotificationBody'

export const PushNotificationBridge: React.FC = withInAppNotification(
	({ showNotification }: any) => {
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
											{ name: 'Main.Home' },
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
	},
)

const NotificationBridge: React.FC = withInAppNotification(({ showNotification }: any) => {
	const { addNotificationListener, removeNotificationListener } = useMessengerContext()

	React.useEffect(() => {
		const inAppNotifListener = (evt: any) => {
			showNotification({
				title: evt.payload.title,
				message: evt.payload.body,
				onPress: evt.payload.onPress,
				additionalProps: evt,
			})
		}

		try {
			addNotificationListener(inAppNotifListener)
		} catch (e) {
			console.log('Error: Push notif add listener failed: ' + e)
		}

		return () => {
			removeNotificationListener(() => console.log('DELETE inAppNotifListener'))
		}
	}, [showNotification, addNotificationListener, removeNotificationListener])
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
