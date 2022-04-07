import base64 from 'base64-js'
import { Buffer } from 'buffer'
import { Alert, PermissionsAndroid, NativeModules, Platform } from 'react-native'
import InAppBrowser, { RedirectResult } from 'react-native-inappbrowser-reborn'
import Share from 'react-native-share'

import beapi from '@berty/api'
import { Service } from '@berty/grpc-bridge'
import * as middleware from '@berty/grpc-bridge/middleware'
import { bridge as rpcBridge } from '@berty/grpc-bridge/rpc'
import {
	ServiceClientType,
	WelshMessengerServiceClient,
} from '@berty/grpc-bridge/welsh-clients.gen'
import { useAccount } from '@berty/hooks'
import RNFS from 'react-native-fs'
import { berty } from '@berty/api/root.pb'

const { PushTokenRequester } = NativeModules

export enum serviceTypes {
	Replication = 'rpl',
	Push = 'psh',
}

export const serviceNames: { [key: string]: string } = {
	[serviceTypes.Replication]: 'Replication service', // TODO: i18n
	[serviceTypes.Push]: 'Push notifications', // TODO: i18n
}

const bertyOperatedServer = 'https://services.berty.tech/'

export const useAccountServices = (): Array<beapi.messenger.IServiceToken> => {
	const account = useAccount()
	if (!account.serviceTokens) {
		return []
	}

	return Object.values(
		account.serviceTokens.reduce(
			(tokens, t) => ({
				...tokens,
				[`${t.authenticationUrl}-${t.serviceType}`]: t,
			}),
			{},
		),
	)
}

export const servicesAuthViaDefault = async (
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null,
): Promise<void> => {
	return servicesAuthViaURL(protocolClient, bertyOperatedServer)
}

export const servicesAuthViaURL = async (
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null,
	url: string,
): Promise<void> => {
	if (!protocolClient) {
		throw new Error('missing protocol client')
	}

	// PKCE OAuth flow
	const resp = await protocolClient
		?.authServiceInitFlow({
			authUrl: url,
		})
		.catch(e => {
			Alert.alert('The provided URL is not supported')
			throw e
		})

	if (!resp.secureUrl) {
		let allowNonSecure = false
		await new Promise<void>(resolve => {
			Alert.alert(
				'Security warning',
				'The provided URL is using a non secure connection, do you want to continue?',
				[
					{
						text: 'Access page',
						onPress: () => {
							allowNonSecure = true
							resolve()
						},
					},
					{ text: 'Go back', onPress: () => resolve() },
				],
			)
		})

		if (!allowNonSecure) {
			throw new Error('missing protocol client')
		}
	}

	if (!(await InAppBrowser.isAvailable())) {
		throw new Error('no browser available')
	}

	const response = await InAppBrowser.openAuth(resp.url, 'berty://', {
		dismissButtonStyle: 'cancel',
		readerMode: false,
		modalPresentationStyle: 'pageSheet',
		modalEnabled: true,
		showTitle: true,
		enableDefaultShare: false,
		ephemeralWebSession: true,
		// forceCloseOnRedirection: false,
	})

	if ((response as RedirectResult).url) {
		if (!(response as RedirectResult).url) {
			throw new Error('invalid response from auth server')
		}
	}

	const responseURL = (response as RedirectResult).url
	await protocolClient?.authServiceCompleteFlow({
		callbackUrl: responseURL,
	})
}

export const replicateGroup = async (
	conversationPublicKey: string,
	tokenID: string,
	client: WelshMessengerServiceClient | null,
): Promise<void> => {
	if (
		!(await new Promise(resolve => {
			Alert.alert(
				'Privacy warning',
				"The data for this conversation will be replicated on the selected server, while the messages and their metadata won't be readable by anyone outside the conversation this will lead to a decreased privacy protection for all the members' activity, do you want to proceed?",
				[
					{
						text: 'Replicate conversation contents',
						onPress: () => {
							resolve(true)
						},
					},
					{ text: 'Cancel', onPress: () => resolve(false) },
				],
			)
		}))
	) {
		return
	}

	if (!client) {
		return
	}

	try {
		await client?.replicationServiceRegisterGroup({
			tokenId: tokenID,
			conversationPublicKey: conversationPublicKey,
		})

		Alert.alert(
			'Conversation registered on server',
			'The conversation contents will be replicated from now on',
		)
	} catch (e) {
		console.warn(e)
		Alert.alert(
			'Conversation not registered',
			'An error occurred while registering the conversation on the server',
		)
	}
}

export const createAndSaveFile = async (
	outFile: string,
	fileName: string,
	extension?: string,
): Promise<void> => {
	try {
		const granted = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
			{
				title: "Save file in your download's directory",
				message: "Save backup account's file",
				buttonNeutral: 'Ask Me Later',
				buttonNegative: 'Cancel',
				buttonPositive: 'OK',
			},
		)
		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			const dest = `${RNFS.DownloadDirectoryPath}/${fileName}.${extension || 'tar'}`
			await RNFS.copyFile(outFile, dest)
				.then(() => {
					console.log('file copied')
				})
				.catch(err => {
					console.log('file copied failed', err)
				})
		} else {
			console.log('Camera permission denied')
		}
	} catch (err) {
		console.warn(err)
	}
}

export const exportAccountToFile = async (accountId: string | null) => {
	const messengerMiddlewares = middleware.chain(
		__DEV__ ? middleware.logger.create('MESSENGER') : null,
	)

	const messengerClient = Service(beapi.messenger.MessengerService, rpcBridge, messengerMiddlewares)

	const fileName = `berty-backup-${accountId}`
	const outFile = RNFS.TemporaryDirectoryPath + `/${fileName}` + '.tar'

	// delete file if already exist
	await RNFS.unlink(outFile).catch(() => {})

	await messengerClient
		.instanceExportData({})
		.then(stream => {
			stream.onMessage(async res => {
				if (!res || !res.exportedData) {
					return
				}
				const buff = Buffer.from(res.exportedData).toString('base64')
				await RNFS.write(outFile, buff, -1, 'base64')
			})
			return stream.start()
		})
		.then(async () => {
			Platform.OS === 'android'
				? await createAndSaveFile(outFile, fileName)
				: await Share.open({
						title: 'Berty backup',
						url: `file://${outFile}`,
						type: 'application/x-tar',
				  })
		})
		.catch(async err => {
			if (err?.EOF) {
			} else {
				console.warn(err)
			}
		})
}

export const getDevicesForConversationAndMember = (
	client: ServiceClientType<beapi.messenger.MessengerService>,
	conversationPk: string | undefined | null,
	memberPk: string | undefined | null,
) => {
	if (!conversationPk || !memberPk) {
		return new Promise<berty.messenger.v1.IDevice[]>(resolve => {
			resolve([])
		})
	}

	return new Promise<berty.messenger.v1.IDevice[]>(resolve => {
		let devices = [] as berty.messenger.v1.IDevice[]
		let subStream: { stop: () => void } | null

		client
			?.listMemberDevices({ memberPk: memberPk, conversationPk: conversationPk })
			.then(async stream => {
				stream.onMessage((msg, err) => {
					if (err) {
						return
					}

					if (!msg) {
						return
					}

					devices.push(msg.device!)
				})

				await stream.start()
			})
			.then(() => resolve(devices))

		return () => {
			if (subStream !== null) {
				subStream.stop()
			}
		}
	})
}

export const getSharedPushTokensForConversation = (
	client: ServiceClientType<beapi.messenger.MessengerService>,
	conversationPk: string | undefined | null,
) => {
	if (!conversationPk) {
		return new Promise<berty.messenger.v1.ISharedPushToken[]>(resolve => {
			resolve([])
		})
	}

	return new Promise<berty.messenger.v1.ISharedPushToken[]>(resolve => {
		let tokens = [] as berty.messenger.v1.ISharedPushToken[]
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
