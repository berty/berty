import { Alert } from 'react-native'

import beapi from '@berty/api'
import {
	ServiceClientType,
	WelshMessengerServiceClient,
} from '@berty/grpc-bridge/welsh-clients.gen'

export enum serviceTypes {
	Replication = 'rpl',
	Push = 'psh',
}

export const serviceNames: { [key: string]: string } = {
	[serviceTypes.Replication]: 'Replication service', // TODO: i18n
	[serviceTypes.Push]: 'Push notifications', // TODO: i18n
}

const bertyOperatedServer = 'https://services-v1.berty.tech/'

export const servicesAuthViaDefault = async (
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null,
	services?: string[],
): Promise<void> => {
	return servicesAuthViaURL(protocolClient, bertyOperatedServer, services)
}

export const servicesAuthViaURL = async (
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null,
	url: string,
	services?: string[],
): Promise<void> => {
	if (!protocolClient) {
		throw new Error('missing protocol client')
	}

	// PKCE OAuth flow
	const resp = await protocolClient
		?.authServiceInitFlow({
			authUrl: url,
			services: services || [],
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

	// TODO remove &scope=psh suffix when we want to propose more berty services
	const response = await fetch(`${resp.url}&scope=psh`)

	const responseURL = response.headers.get('x-auth-redirect')
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
