import InAppBrowser from 'react-native-inappbrowser-reborn'
import { MsgrState } from './context'
import { Alert } from 'react-native'
import { useAccount } from './hooks'
import { berty } from '@berty-tech/api/index.pb'

export enum serviceTypes {
	Replication = 'rpl',
}

export const serviceNames: { [key: string]: string } = {
	[serviceTypes.Replication]: 'Replication service', // TODO: i18n
}

export const bertyOperatedServer = 'https://services.berty.tech/'

export const useAccountServices = (): Array<berty.messenger.v1.IServiceToken> => {
	const account: berty.messenger.v1.IAccount = useAccount()
	if (!account || account.serviceTokens === undefined || account.serviceTokens === null) {
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
		await ctx.client.replicationServiceRegisterGroup({
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
