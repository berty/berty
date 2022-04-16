import beapi from '@berty/api'

import { storageKeyForAccount } from './utils'
import { Maybe } from './hooks'
import {
	refreshAccountList,
	closeAccountWithProgress,
	importAccountWithProgress,
} from './effectableCallbacks'
import { accountService, storageRemove } from './accountService'
import { setNextAccount, setStateOnBoardingReady } from '@berty/redux/reducers/ui.reducer'
import {
	PersistentOptionsKeys,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'
import store, { AppDispatch } from '@berty/redux/store'

export const importAccount = async (embedded: boolean, path: string) => {
	if (!embedded) {
		return
	}

	// TODO: check if bridge is running
	let resp: beapi.account.ImportAccountWithProgress.Reply | null

	try {
		await closeAccountWithProgress(store.dispatch)
		resp = await importAccountWithProgress(path, store.dispatch)
		store.dispatch(
			setPersistentOption({
				type: PersistentOptionsKeys.OnBoardingFinished,
				payload: {
					isFinished: true,
				},
			}),
		)
	} catch (e) {
		console.warn('unable to import account', e)
		return
	}

	if (!resp) {
		throw new Error('no account returned')
	}

	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(embedded)

	store.dispatch(setNextAccount(resp.accountMetadata.accountId))
}

/**
 * updates the AccountService account
 */
export const updateAccount = async (embedded: boolean, payload: any) => {
	if (!embedded) {
		return
	}

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
		await accountService.updateAccount(obj)
	} catch (e) {
		console.warn('unable to update account', e)
		return
	}

	await refreshAccountList(embedded)
}

export const switchAccount = async (
	embedded: boolean,
	accountID: string,
	dispatch: AppDispatch,
) => {
	if (!embedded) {
		return
	}

	try {
		await closeAccountWithProgress(dispatch)
	} catch (e) {
		console.warn('unable to close account', e)
		return
	}
	dispatch(setNextAccount(accountID))
}

export const deleteAccount = async (
	embedded: boolean,
	selectedAccount: string | null,
	dispatch: AppDispatch,
) => {
	if (!embedded) {
		return
	}
	// close current account service
	await closeAccountWithProgress(dispatch)
	let accounts: beapi.account.IAccountMetadata[] = []
	if (selectedAccount !== null) {
		// delete account service and account data storage
		await accountService.deleteAccount({ accountId: selectedAccount })
		await storageRemove(storageKeyForAccount(selectedAccount))
		accounts = await refreshAccountList(embedded)
	} else {
		console.warn('state.selectedAccount is null and this should not occur')
	}

	if (!Object.values(accounts).length) {
		// reset to OnBoarding
		dispatch(setStateOnBoardingReady())
	} else {
		// open the last opened if an other account exist
		let accountSelected: beapi.account.IAccountMetadata | null = null
		for (const account of accounts) {
			if (!accountSelected) {
				accountSelected = account
			} else if (
				accountSelected &&
				accountSelected.lastOpened &&
				account.lastOpened &&
				accountSelected.lastOpened < account.lastOpened
			) {
				accountSelected = account
			}
		}
		dispatch(setNextAccount(accountSelected?.accountId))
	}
}

export const restart = async (
	embedded: boolean,
	accountID: Maybe<string>,
	dispatch: AppDispatch,
) => {
	if (!embedded) {
		return
	}

	try {
		await closeAccountWithProgress(dispatch)
	} catch (e) {
		console.warn('unable to close account')
		return
	}
	dispatch(setNextAccount(accountID))
}
