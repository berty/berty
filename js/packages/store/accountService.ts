import { Platform } from 'react-native'
import { Buffer } from 'buffer'
import { grpc } from '@improbable-eng/grpc-web'

import beapi from '@berty/api'
import { grpcweb as rpcWeb } from '@berty/grpc-bridge/rpc'
import { WelshAccountServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import { Service } from '@berty/grpc-bridge'
import rpcBridge from '@berty/grpc-bridge/rpc/rpc.bridge'
import { logger } from '@berty/grpc-bridge/middleware'

export const convertMAddr = (urls: String[]): string | null =>
	urls
		.map((maddr: String) => {
			const ip = maddr.match(/\/ip([46])\/([^/]+)\/tcp\/([0-9]+)\/grpcws/)
			if (ip !== null) {
				const preIP = ip[1] === '6' ? '[' : ''
				const postIP = ip[1] === '6' ? ']' : ''

				return `http://${preIP}${ip[2]}${postIP}:${ip[3]}`
			}

			const hostname = maddr.match(/\/dns[46]\/([a-z0-9-.]+)\/tcp\/([0-9]+)\/grpcws/)
			if (hostname !== null) {
				return `http://${hostname[1]}:${hostname[2]}`
			}

			// TODO: support TLS

			return null
		})
		.reduce((prev: string | null, curr: string | null) => (prev ? prev : curr), null)

const defaultMAddr =
	Platform.OS === 'web' && convertMAddr([window.location.hash.substring(1) || ''])
const opts: grpc.ClientRpcOptions = {
	transport: grpc.CrossBrowserHttpTransport({ withCredentials: false }),
	host: defaultMAddr || '',
}

export const accountService =
	Platform.OS === 'web'
		? (Service(beapi.account.AccountService, rpcWeb(opts)) as unknown as WelshAccountServiceClient)
		: Service(beapi.account.AccountService, rpcBridge, logger.create('ACCOUNT'))

export const storageSet = async (key: string, value: string) => {
	await accountService.appStoragePut({ key, value: Buffer.from(value, 'utf-8'), global: true })
}

export const storageRemove = async (key: string) => {
	await accountService.appStorageRemove({ key, global: true })
}

export const storageGet = async (key: string) => {
	try {
		const reply = await accountService.appStorageGet({ key, global: true })
		return Buffer.from(reply.value).toString('utf-8')
	} catch (e) {
		if ((e as Error).message.includes('datastore: key not found')) {
			return ''
		}
		throw e
	}
}
