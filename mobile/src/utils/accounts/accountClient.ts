import { grpc } from '@improbable-eng/grpc-web'
import { Buffer } from 'buffer'
import { Platform } from 'react-native'

import beapi from '@berty/api'
import { createServiceClient } from '@berty/grpc-bridge'
import { logger } from '@berty/grpc-bridge/middleware'
import { grpcweb as rpcWeb } from '@berty/grpc-bridge/rpc'
import rpcBridge from '@berty/grpc-bridge/rpc/rpc.bridge'
import { rpcMock } from '@berty/grpc-bridge/rpc/rpc.mocked'
import { AccountServiceMock } from '@berty/mock-services/static/accountServiceMock'

import { convertMAddr } from '../ipfs/convertMAddr'

const createAccountClient = () => {
	const middleware = logger.create('ACCOUNT')

	const isRunningStorybook = __DEV__ && process.env.STORYBOOK
	if (isRunningStorybook) {
		return createServiceClient(
			beapi.account.AccountService,
			rpcMock(new AccountServiceMock()),
			middleware,
		)
	}

	if (Platform.OS === 'web') {
		if (window.location.hash) {
			const defaultMAddr =
				Platform.OS === 'web' && convertMAddr([window.location.hash.substring(1) || ''])
			const opts: grpc.ClientRpcOptions = {
				transport: grpc.CrossBrowserHttpTransport({ withCredentials: false }),
				host: defaultMAddr || '',
			}
			return createServiceClient(beapi.account.AccountService, rpcWeb(opts), middleware)
		}

		return createServiceClient(
			beapi.account.AccountService,
			rpcMock(new AccountServiceMock()),
			middleware,
		)
	}

	return createServiceClient(beapi.account.AccountService, rpcBridge, middleware)
}

export const accountClient = createAccountClient()

export const storageSet = async (key: string, value: string) => {
	await accountClient.appStoragePut({ key, value: Buffer.from(value, 'utf-8'), global: true })
}

export const storageRemove = async (key: string) => {
	await accountClient.appStorageRemove({ key, global: true })
}

export const storageGet = async (key: string) => {
	try {
		const reply = await accountClient.appStorageGet({ key, global: true })
		return Buffer.from(reply.value).toString('utf-8')
	} catch (e) {
		if ((e as Error).message.includes('datastore: key not found')) {
			return ''
		}
		throw e
	}
}
