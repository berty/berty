import beapi from '@berty-tech/api'
import { useAppDispatch } from '@berty-tech/react-redux'

import { storageKeyForAccount } from './utils'
import { Maybe } from './hooks'
import {
	refreshAccountList,
	closeAccountWithProgress,
	importAccountWithProgress,
} from './effectableCallbacks'
import { defaultPersistentOptions } from './context'
import { storageRemove, storageGet, storageSet } from './accountService'
import { MessengerActions, PersistentOptionsUpdate, reducerAction } from './types'
import { ServiceClientType } from '@berty-tech/grpc-bridge/welsh-clients.gen'

export const importAccount = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	path: string,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
) => {
	if (!embedded) {
		return
	}

	// TODO: check if bridge is running
	let resp: beapi.account.ImportAccountWithProgress.Reply | null

	try {
		await closeAccountWithProgress(accountClient, dispatch, reduxDispatch)
		resp = await importAccountWithProgress(accountClient, path, dispatch)
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

	await refreshAccountList(accountClient, embedded, dispatch)

	dispatch({
		type: MessengerActions.SetNextAccount,
		payload: resp.accountMetadata.accountId,
	})
}

export const updateAccount = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	payload: any,
) => {
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
		await accountClient.updateAccount(obj)
	} catch (e) {
		console.warn('unable to update account', e)
		return
	}

	await refreshAccountList(accountClient, embedded, dispatch)
}

export const switchAccount = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	accountID: string,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
) => {
	if (!embedded) {
		return
	}

	try {
		await closeAccountWithProgress(accountClient, dispatch, reduxDispatch)
	} catch (e) {
		console.warn('unable to close account', e)
		return
	}
	dispatch({ type: MessengerActions.SetNextAccount, payload: accountID })
}

export const deleteAccount = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	selectedAccount: string | null,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
) => {
	if (!embedded) {
		return
	}
	// close current account service
	await closeAccountWithProgress(accountClient, dispatch, reduxDispatch)
	let accounts: beapi.account.IAccountMetadata[] = []
	if (selectedAccount !== null) {
		// delete account service and account data storage
		await accountClient.deleteAccount({ accountId: selectedAccount })
		await storageRemove(accountClient, storageKeyForAccount(selectedAccount))
		accounts = await refreshAccountList(accountClient, embedded, dispatch)
	} else {
		console.warn('state.selectedAccount is null and this should not occur')
	}

	if (!Object.values(accounts).length) {
		// reset to OnBoarding
		dispatch({ type: MessengerActions.SetStateOnBoardingReady })
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
		dispatch({ type: MessengerActions.SetNextAccount, payload: accountSelected?.accountId })
	}
}

export const restart = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	accountID: Maybe<string>,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
) => {
	if (!embedded) {
		return
	}

	try {
		await closeAccountWithProgress(accountClient, dispatch, reduxDispatch)
	} catch (e) {
		console.warn('unable to close account')
		return
	}
	dispatch({ type: MessengerActions.SetNextAccount, payload: accountID })
}

export const setPersistentOption = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	dispatch: (arg0: reducerAction) => void,
	selectedAccount: string | null,
	action: PersistentOptionsUpdate,
) => {
	if (selectedAccount === null) {
		console.warn('no account opened')
		return
	}

	try {
		let opts = {}
		let persistOpts = await storageGet(accountClient, storageKeyForAccount(selectedAccount))

		if (persistOpts) {
			opts = JSON.parse(persistOpts)
		}

		const updatedPersistOpts = {
			...defaultPersistentOptions(),
			...opts,
			[action.type]: action.payload,
		}

		await storageSet(
			accountClient,
			storageKeyForAccount(selectedAccount),
			JSON.stringify(updatedPersistOpts),
		)

		dispatch({
			type: MessengerActions.SetPersistentOption,
			payload: updatedPersistOpts,
		})
	} catch (e) {
		console.warn('store setPersistentOption Failed:', e)
		return
	}
}
