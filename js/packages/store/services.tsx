import { Alert, Platform, PermissionsAndroid } from 'react-native'
import Share from 'react-native-share'
import { Buffer } from 'buffer'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import RNFS from 'react-native-fs'

import beapi from '@berty-tech/api'
import * as middleware from '@berty-tech/grpc-bridge/middleware'
import { bridge as rpcBridge } from '@berty-tech/grpc-bridge/rpc'
import { Service } from '@berty-tech/grpc-bridge'

import { MessengerState } from './types'
import { useAccount } from './hooks'

export enum serviceTypes {
	Replication = 'rpl',
}

export const serviceNames: { [key: string]: string } = {
	[serviceTypes.Replication]: 'Replication service', // TODO: i18n
}

export const bertyOperatedServer = 'https://services.berty.tech/'

export const useAccountServices = (): Array<beapi.messenger.IServiceToken> => {
	const account = useAccount()
	if (!account?.serviceTokens) {
		return []
	}

	return Object.values(
		account.serviceTokens.reduce(
			(tokens, t) => ({ ...tokens, [`${t.authenticationUrl}-${t.serviceType}`]: t }),
			{},
		),
	)
}

export const servicesAuthViaDefault = async (ctx: MessengerState): Promise<void> => {
	return servicesAuthViaURL(ctx, bertyOperatedServer)
}

export const servicesAuthViaURL = async (ctx: MessengerState, url: string): Promise<void> => {
	if (!ctx.protocolClient) {
		return
	}

	let authURL = ''
	try {
		// PKCE OAuth flow
		const resp = await ctx.protocolClient?.authServiceInitFlow({
			authUrl: url,
		})

		authURL = resp.url

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
				return
			}
		}
	} catch {
		Alert.alert('The provided URL is not supported')
		return
	}

	if (await InAppBrowser.isAvailable()) {
		try {
			const response: any = await InAppBrowser.openAuth(authURL, 'berty://', {
				dismissButtonStyle: 'cancel',
				readerMode: false,
				modalPresentationStyle: 'pageSheet',
				modalEnabled: true,
				showTitle: true,
				enableDefaultShare: false,
				ephemeralWebSession: true,
				// forceCloseOnRedirection: false,
			})

			if (!response.url) {
				return
			}

			const responseURL = response.url
			await ctx.protocolClient?.authServiceCompleteFlow({
				callbackUrl: responseURL,
			})
		} catch (e) {
			console.warn(e)
		}
	}
}

export const replicateGroup = async (
	ctx: MessengerState,
	conversationPublicKey: string,
	tokenID: string,
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

	if (!ctx.client) {
		return
	}

	try {
		await ctx.client?.replicationServiceRegisterGroup({
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
