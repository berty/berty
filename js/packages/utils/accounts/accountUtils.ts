import beapi from '@berty/api'
import { setAccounts } from '@berty/redux/reducers/ui.reducer'
import store from '@berty/redux/store'

import { accountClient } from './accountClient'

/**
 * updates the AccountService account
 */
export const updateAccount = async (payload: any) => {
	try {
		let obj: any = {
			accountId: payload.accountId,
		}
		if (payload.accountName) {
			obj.accountName = payload.accountName
		}
		if (payload.publicKey) {
			obj.publicKey = payload.publicKey
		}
		if (payload.avatarCid) {
			obj.avatarCid = payload.avatarCid
		}
		await accountClient.updateAccount(obj)
	} catch (e) {
		console.warn('unable to update account', e)
		return
	}

	await refreshAccountList()
}

export const refreshAccountList = async (): Promise<beapi.account.IAccountMetadata[]> => {
	try {
		const resp = await accountClient.listAccounts({})
		if (!resp.accounts) {
			return []
		}
		store.dispatch(setAccounts(resp.accounts))
		return resp.accounts
	} catch (e) {
		console.warn(e)
		return []
	}
}
