import { Alert, Platform, PermissionsAndroid } from 'react-native'
import Share from 'react-native-share'
import { Buffer } from 'buffer'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'

import beapi from '@berty-tech/api'
import * as middleware from '@berty-tech/grpc-bridge/middleware'
import { bridge as rpcBridge } from '@berty-tech/grpc-bridge/rpc'
import { Service } from '@berty-tech/grpc-bridge'

import { MsgrState } from './context'
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

export const servicesAuthViaDefault = async (ctx: MsgrState): Promise<void> => {
	return servicesAuthViaURL(ctx, bertyOperatedServer)
}

export const servicesAuthViaURL = async (ctx: MsgrState, url: string): Promise<void> => {
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
			await new Promise((resolve) => {
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
						{ text: 'Go back', onPress: resolve },
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
			const response: any = await InAppBrowser.openAuth(
				authURL,
				Platform.OS == 'ios' ? 'berty' : 'berty://',
				{
					dismissButtonStyle: 'cancel',
					readerMode: false,
					modalPresentationStyle: 'pageSheet',
					modalEnabled: true,
					showTitle: true,
					enableDefaultShare: false,
					ephemeralWebSession: true,
					// forceCloseOnRedirection: false,
				},
			)

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
	ctx: MsgrState,
	conversationPublicKey: string,
	tokenID: string,
): Promise<void> => {
	if (
		!(await new Promise((resolve) => {
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

const createAndSaveFile = async (outFile: string, fileName: string) => {
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
			await RNFetchBlob.fs
				.cp(`file://${outFile}`, `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}.tar`)
				.then(() => {
					console.log('file copied')
				})
				.catch((err) => {
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

	const outputStream = await RNFetchBlob.fs.writeStream(outFile, 'base64')
	await messengerClient
		.instanceExportData({})
		.then((stream) => {
			stream.onMessage(async (res) => {
				if (!res || !res.exportedData) {
					return
				}
				await outputStream.write(Buffer.from(res.exportedData).toString('base64'))
			})
			return stream.start()
		})
		.then(async () => {
			Platform.OS === 'android'
				? await createAndSaveFile(outFile, fileName)
				: await Share.open({
						url: `file://${outFile}`,
						type: 'application/x-tar',
				  })
			await outputStream.close()
		})
		.catch(async (err) => {
			if (err?.EOF) {
			} else {
				console.warn(err)
			}
		})
}
