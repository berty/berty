import { Buffer } from 'buffer'
import { ServiceClientType } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import beapi from '@berty-tech/api'

const setItem = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	key: string,
	value: string,
) => {
	await accountClient.appStoragePut({ key, value: Buffer.from(value, 'utf-8') })
}

const removeItem = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	key: string,
) => {
	await accountClient.appStorageRemove({ key })
}

const getItem = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	key: string,
) => {
	try {
		const reply = await accountClient.appStorageGet({ key })
		return Buffer.from(reply.value).toString('utf-8')
	} catch (e) {
		if ((e as Error).message.includes('datastore: key not found')) {
			return ''
		}
		throw e
	}
}

const persistStorage = {
	setItem,
	removeItem,
	getItem,
}

export default persistStorage
