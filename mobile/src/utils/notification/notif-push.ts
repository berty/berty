import base64 from 'base64-js'
import * as Application from 'expo-application'
import { Alert, Platform } from 'react-native'
import { RESULTS } from 'react-native-permissions'

import beapi from '@berty/api'
import { GRPCError } from '@berty/grpc-bridge'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { PushTokenRequester } from '@berty/native-modules/PushTokenRequester'
import { hasKnownPushServer } from '@berty/utils/accounts/accountUtils'
import { checkPermission } from '@berty/utils/permissions/checkPermissions'
import { getPermissions, PermissionType } from '@berty/utils/permissions/permissions'

import { numberifyLong } from '../convert/long'
import { asyncAlert } from '../react-native/asyncAlert'
import { servicesAuthViaDefault, serviceTypes } from '../remote-services/remote-services'

export const pushAvailable = Platform.OS !== 'web'
export const pushFilteringAvailable =
	Platform.OS === 'android' ||
	(Platform.OS === 'ios' && Application.applicationId === 'tech.berty.ios')

export enum PushNotificationStatus {
	EnabledJustNow = 'enabled-just-now',
	EnabledBefore = 'enabled-before',
	PermDenied = 'perm-denied',
	GoFailed = 'go-failed',
	FetchFailed = 'fetch-failed',
}
const isPushNotificationFailed = (pushStatus: PushNotificationStatus) =>
	pushStatus === PushNotificationStatus.PermDenied ||
	pushStatus === PushNotificationStatus.FetchFailed ||
	pushStatus === PushNotificationStatus.GoFailed

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
	if (
		!hasKnownPushServer(account) ||
		numberifyLong(account.mutedUntil) > Date.now() ||
		!(permissions.notification === RESULTS.GRANTED || permissions.notification === RESULTS.LIMITED)
	) {
		if (!enable && enable !== undefined) {
			console.warn('no need to disable, already disabled')
			return
		}

		const pushStatus = await enablePushPermission(messengerClient, navigate)

		// if something went wrong during onboarding enable push notification process
		// prevent the user that he can be enable it manually in settings
		if (isPushNotificationFailed(pushStatus)) {
			/* Ignore check for i18n missing keys
				account.opening.alert-push-go-failed
				account.opening.alert-push-fetch-failed
				account.opening.alert-push-perm-denied
			*/
			await asyncAlert(
				t('account.opening.alert-push-title'),
				`${t(`account.opening.alert-push-${pushStatus}`)}\n${t('account.opening.alert-push-desc')}`,
				t('account.opening.alert-push-button'),
			)
		}

		await messengerClient.accountPushConfigure({
			unmute: true,
		})

		if (pushStatus === PushNotificationStatus.EnabledJustNow) {
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
	navigate: any,
): Promise<PushNotificationStatus> => {
	const account = await messengerClient.accountGet({})

	try {
		// Get or ask for permission
		await new Promise((resolve, reject) =>
			checkPermission({
				permissionType: PermissionType.notification,
				navigate,
				accept: () =>
					new Promise<void>(subResolve => {
						subResolve()
						setTimeout(resolve, 800)
					}),
				deny: () =>
					new Promise<void>(subResolve => {
						subResolve()
						setTimeout(reject, 800)
					}),
			}),
		)
	} catch (e) {
		console.log('Permission push deny', e)
		return PushNotificationStatus.PermDenied
	}

	// Persist push token if needed
	try {
		// When we don't have network connection the requestAndPersistPushToken function hang so we manually set a timeout
		const timeout = new Promise(resolve => setTimeout(() => resolve('timeout'), 7000))
		const result = await Promise.race([timeout, requestAndPersistPushToken(messengerClient)])
		if (result === 'timeout') {
			console.warn('Fail on request and persist push token: timeout')
			return PushNotificationStatus.FetchFailed
		}
	} catch (e) {
		console.warn('Fail on request and persist push token', e)
		return PushNotificationStatus.FetchFailed
	}

	// Register push server secrets if needed
	if (!hasKnownPushServer(account.account)) {
		// When we don't have network connection the servicesAuthViaDefault function hang so we manually set a timeout
		const timeout = new Promise(resolve => setTimeout(() => resolve('timeout'), 7000))
		const pushStatus = await Promise.race([
			timeout,
			servicesAuthViaDefault(messengerClient, [serviceTypes.Push]),
		])
		if (pushStatus === 'timeout') {
			console.warn('Fail on register server push token: timeout')
			return PushNotificationStatus.FetchFailed
		} else if (pushStatus === PushNotificationStatus.EnabledJustNow) {
			await new Promise(r => setTimeout(r, 300))
		}
		return pushStatus as PushNotificationStatus
	}

	return PushNotificationStatus.EnabledBefore
}

export const askAndSharePushTokenOnAllConversations = async (
	t: (k: string) => string,
	messengerClient: ServiceClientType<beapi.messenger.MessengerService>,
	options?: {
		forceEnable?: boolean
	},
) => {
	if (!pushAvailable) {
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
		const pushTokenShared = () =>
			Array.isArray(conversation?.pushLocalDeviceSharedTokens) &&
			conversation?.pushLocalDeviceSharedTokens.length > 0

		if (
			!pushTokenShared ||
			numberifyLong(conversation.mutedUntil) > Date.now() ||
			(permissions.notification !== RESULTS.GRANTED && permissions.notification !== RESULTS.LIMITED)
		) {
			const pushStatus = await enablePushPermission(messengerClient, navigate)

			// Share push token
			await enableNotificationsForConversation(t, messengerClient!, conversation.publicKey)

			if (pushStatus === PushNotificationStatus.EnabledJustNow && pushFilteringAvailable) {
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
		return new Promise<beapi.messenger.IPushMemberToken[]>(resolve => {
			resolve([])
		})
	}

	return new Promise<beapi.messenger.IPushMemberToken[]>(resolve => {
		let tokens = [] as beapi.messenger.IPushMemberToken[]
		let subStream: { stop: () => void } | null

		client
			?.pushTokenSharedForConversation({ conversationPk: conversationPk })
			.then(async stream => {
				stream.onMessage((msg, err) => {
					if (err) {
						return
					}

					if (!msg || !msg.token) {
						return
					}

					tokens.push(msg.token)
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

export const requestAndPersistPushToken = async (
	messengerClient: ServiceClientType<beapi.messenger.MessengerService> | null,
) => {
	if (!messengerClient) {
		throw new Error('missing messenger client')
	}
	try {
		let responseJSON = await PushTokenRequester.request()
		let response = JSON.parse(responseJSON)

		await messengerClient?.pushSetDeviceToken({
			receiver: beapi.push.PushServiceReceiver.create({
				tokenType:
					Platform.OS === 'ios'
						? beapi.push.PushServiceTokenType.PushTokenApplePushNotificationService
						: beapi.push.PushServiceTokenType.PushTokenFirebaseCloudMessaging,
				bundleId: response.bundleId,
				token: new Uint8Array(base64.toByteArray(response.token)),
			}),
		})
	} catch (e) {
		console.warn(`Push token registration failed: ${e}`)
	}
}
