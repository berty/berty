import { Buffer } from 'buffer'

import { accountService } from '@berty/store/accountService'

const setItem = async (key: string, value: string) => {
	await accountService.appStoragePut({ key, value: Buffer.from(value, 'utf-8') })
}

const removeItem = async (key: string) => {
	await accountService.appStorageRemove({ key })
}

const getItem = async (key: string) => {
	try {
		const reply = await accountService.appStorageGet({ key })
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
