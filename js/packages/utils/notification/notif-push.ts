import base64 from 'base64-js'
import { Alert, Platform } from 'react-native'
import { RESULTS } from 'react-native-permissions'

import beapi from '@berty/api'
import { GRPCError } from '@berty/grpc-bridge'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { PushTokenRequester } from '@berty/native-modules/PushTokenRequester'
import rnutil from '@berty/utils/react-native'
import { PermissionType, getPermissions } from '@berty/utils/react-native/permissions'

import { numberifyLong } from '../convert/long'
import { servicesAuthViaDefault, serviceTypes } from '../remote-services/remote-services'

export const pushAvailable = Platform.OS !== 'web'
export const pushFilteringAvailable = Platform.OS === 'android'

export const accountPushToggleState = async ({
	account,
	messengerClient,
	protocolClient,
	navigate,
	t,
	enable,
}: {
	account: beapi.messenger.IAccount
	messengerClient: ServiceClientType<beapi.messenger.MessengerService> | null
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null
	navigate: any
	t: (k: string) => string
	enable?: boolean
}) => {
	if (!messengerClient || !protocolClient) {
		console.warn('missing a client')
		return
	}

	const permissions = await getPermissions()
	const hasKnownPushServer = account.serviceTokens?.some(t => t.serviceType === serviceTypes.Push)

	if (
		!hasKnownPushServer ||
		numberifyLong(account.mutedUntil) > Date.now() ||
		!(permissions.notification === RESULTS.GRANTED || permissions.notification === RESULTS.LIMITED)
	) {
		if (!enable && enable !== undefined) {
			console.warn('no need to disable, already disabled')
			return
		}

		const enabledJustNow = await enablePushPermission(messengerClient, protocolClient, navigate)
		await messengerClient.accountPushConfigure({
			unmute: true,
		})

		if (enabledJustNow && pushFilteringAvailable) {
			await askAndSharePushTokenOnAllConversations(t, messengerClient, { forceEnable: true })
		}
	} else {
		if (enable) {
			console.warn('no need to enable, already enabled')
			return
		}

		if (!pushFilteringAvailable) {
			Alert.alert(t('chat.push-notifications.why-cant-disable-account'))
			return
		}

		await messengerClient.accountPushConfigure({
			muteForever: true,
		})
	}
}

const enablePushPermission = async (
	messengerClient: ServiceClientType<beapi.messenger.MessengerService>,
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService>,
	navigate: any,
): Promise<boolean> => {
	const account = await messengerClient.accountGet({})
	const hasKnownPushServer = account.account?.serviceTokens?.some(
		t => t.serviceType === serviceTypes.Push,
	)

	// Get or ask for permission
	await new Promise(resolve =>
		rnutil.checkPermissions(PermissionType.notification, {
			navigate,
			navigateToPermScreenOnProblem: true,
			onSuccess: () => resolve(null),
			onComplete: () =>
				new Promise(subResolve => {
					subResolve()
					setTimeout(resolve, 800)
				}),
		}),
	)

	// Persist push token if needed
	await requestAndPersistPushToken(protocolClient)

	// Register push server secrets if needed
	if (!hasKnownPushServer) {
		try {
			await servicesAuthViaDefault(protocolClient, [serviceTypes.Push])
			await new Promise(r => setTimeout(r, 300))
			return true
		} catch (e) {
			console.warn('no push server known')
			throw new Error('no push server known')
		}
	}

	return false
}

export const askAndSharePushTokenOnAllConversations = async (
	t: (k: string) => string,
	messengerClient: ServiceClientType<beapi.messenger.MessengerService>,
	options?: {
		forceEnable?: boolean
	},
) => {
	if (!pushFilteringAvailable) {
		return
	}

	let enableForEveryGroup = options?.forceEnable || false

	if (!options?.forceEnable) {
		// Ask if user want to enable push notifications for all conversations
		enableForEveryGroup = await new Promise(resolve => {
			Alert.alert(
				t('chat.push-notifications.warning-enable-all.title'),
				t('chat.push-notifications.warning-enable-all.subtitle'),
				[
					{
						text: t('chat.push-notifications.warning-enable-all.refuse'),
						onPress: () => resolve(false),
						style: 'cancel',
					},
					{
						text: t('chat.push-notifications.warning-enable-all.accept'),
						onPress: () => resolve(true),
						style: 'default',
					},
				],
			)
		})
	}

	if (enableForEveryGroup) {
		await messengerClient.pushSetAutoShare({ enabled: true })
	}
}

export const enableNotificationsForConversation = async (
	t: (_: String, __?: any) => string,
	client: ServiceClientType<beapi.messenger.MessengerService>,
	conversationPk: string,
) => {
	if (!pushFilteringAvailable) {
		// Confirm push token sharing
		await new Promise((resolve, reject) => {
			Alert.alert(
				t('chat.push-notifications.warning-disable.title'),
				t('chat.push-notifications.warning-disable.subtitle'),
				[
					{
						text: t('chat.push-notifications.warning-disable.refuse'),
						onPress: () => reject(new Error('user cancelled action')),
						style: 'cancel',
					},
					{
						text: t('chat.push-notifications.warning-disable.accept'),
						onPress: () => resolve(null),
						style: 'default',
					},
				],
			)
		})
	}

	// Share push token
	await client!.pushShareTokenForConversation({ conversationPk: conversationPk })
	await client.conversationMute({
		groupPk: conversationPk,
		unmute: true,
	})
}

export const conversationPushToggleState = async ({
	t,
	messengerClient,
	protocolClient,
	conversation,
	navigate,
}: {
	t: (_: String, __?: any) => string
	messengerClient: ServiceClientType<beapi.messenger.MessengerService> | null
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null
	navigate: any
	conversation?: beapi.messenger.IConversation
}) => {
	try {
		if (!messengerClient || !protocolClient || !conversation?.publicKey) {
			return
		}

		const permissions = await getPermissions()

		if (
			!conversation?.sharedPushTokenIdentifier ||
			numberifyLong(conversation.mutedUntil) > Date.now() ||
			(permissions.notification !== RESULTS.GRANTED && permissions.notification !== RESULTS.LIMITED)
		) {
			const enabledJustNow = await enablePushPermission(messengerClient, protocolClient!, navigate)

			// Share push token
			await enableNotificationsForConversation(t, messengerClient!, conversation.publicKey)

			if (enabledJustNow && pushFilteringAvailable) {
				await askAndSharePushTokenOnAllConversations(t, messengerClient)
			}
		} else {
			if (!pushFilteringAvailable) {
				Alert.alert(t('chat.push-notifications.why-cant-disable'))
				return
			}
			await messengerClient.conversationMute({
				groupPk: conversation.publicKey,
				muteForever: true,
			})
		}
	} catch (e) {
		if ((e as GRPCError).Code === beapi.errcode.ErrCode.ErrPushUnknownDestination) {
			Alert.alert('', t('chat.push-notifications.errors.no-token'))
			throw new Error()
		} else if ((e as GRPCError).Code === beapi.errcode.ErrCode.ErrPushUnknownDestination) {
			Alert.alert('', t('chat.push-notifications.errors.no-server'))
			throw new Error()
		} else {
			console.warn(e)
		}
	}
}

export const getSharedPushTokensForConversation = (
	client: ServiceClientType<beapi.messenger.MessengerService>,
	conversationPk: string | undefined | null,
) => {
	if (!conversationPk) {
		return new Promise<beapi.messenger.ISharedPushToken[]>(resolve => {
			resolve([])
		})
	}

	return new Promise<beapi.messenger.ISharedPushToken[]>(resolve => {
		let tokens = [] as beapi.messenger.ISharedPushToken[]
		let subStream: { stop: () => void } | null

		client
			?.pushTokenSharedForConversation({ conversationPk: conversationPk })
			.then(async stream => {
				stream.onMessage((msg, err) => {
					if (err) {
						return
					}

					if (!msg || !msg.pushToken) {
						return
					}

					tokens.push(msg.pushToken)
				})

				await stream.start()
			})
			.then(() => {
				resolve(tokens)
			})

		return () => {
			if (subStream !== null) {
				subStream.stop()
			}
		}
	})
}

export const requestAndPersistPushToken = (
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService>,
) =>
	new Promise((resolve, reject) => {
		PushTokenRequester.request()
			.then((responseJSON: string) => {
				let response = JSON.parse(responseJSON)
				protocolClient
					.pushSetDeviceToken({
						receiver: beapi.protocol.PushServiceReceiver.create({
							tokenType:
								Platform.OS === 'ios'
									? beapi.push.PushServiceTokenType.PushTokenApplePushNotificationService
									: beapi.push.PushServiceTokenType.PushTokenFirebaseCloudMessaging,
							bundleId: response.bundleId,
							token: new Uint8Array(base64.toByteArray(response.token)),
						}),
					})
					.then(() => {
						console.info(`Push token registered: ${responseJSON}`)
						resolve(responseJSON)
					})
					.catch(err => {
						console.warn(`Push token registration failed: ${err}`)
						reject(err)
					})
			})
			.catch((err: Error) => {
				console.warn(`Push token request failed: ${err}`)
				reject(err)
			})
	})
