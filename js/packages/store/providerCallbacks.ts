import AsyncStorage from '@react-native-community/async-storage'

import beapi from '@berty-tech/api'
import {
	defaultPersistentOptions,
	MessengerActions,
	PersistentOptionsUpdate,
} from '@berty-tech/store/context'
import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'

import { storageKeyForAccount } from './providerEffects'
import { Maybe } from './hooks'
import { createAccount, refreshAccountList, closeAccountWithProgress } from './effectableCallbacks'
import { accountService, reducerAction } from './context'

export const importAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	path: string,
) => {
	if (!embedded) {
		return
	}

	// TODO: check if bridge is running
	let resp: beapi.account.CreateAccount.Reply

	try {
		await closeAccountWithProgress(dispatch)
		resp = await accountService.importAccount({
			backupPath: path,
		})
	} catch (e) {
		console.warn('unable to import account', e)
		return
	}

	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(embedded, dispatch)

	dispatch({
		type: MessengerActions.SetNextAccount,
		payload: resp.accountMetadata.accountId,
	})
}

export const updateAccount = async (
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
		await accountService.updateAccount(obj)
	} catch (e) {
		console.warn('unable to update account', e)
		return
	}

	await refreshAccountList(embedded, dispatch)
}

export const switchAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	accountID: string,
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
	dispatch({ type: MessengerActions.SetNextAccount, payload: accountID })
}

export const deleteAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	selectedAccount: string | null,
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
		await AsyncStorage.removeItem(storageKeyForAccount(selectedAccount))
		accounts = await refreshAccountList(embedded, dispatch)
	} else {
		console.warn('state.selectedAccount is null and this should not occur')
	}
	if (!Object.values(accounts).length) {
		// create new account if no more account exist
		await createAccount(embedded, dispatch)
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
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	accountID: Maybe<string>,
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
	dispatch({ type: MessengerActions.SetNextAccount, payload: accountID })
}

export const setPersistentOption = async (
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
		let persistOpts = await AsyncStorage.getItem(storageKeyForAccount(selectedAccount))

		if (persistOpts !== null) {
			opts = JSON.parse(persistOpts)
		}

		const updatedPersistOpts = {
			...defaultPersistentOptions(),
			...opts,
			[action.type]: action.payload,
		}

		await AsyncStorage.setItem(
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

export const setReaction = (
	convPK: string,
	targetCID: string,
	emoji: string,
	state: boolean,
	messengerClient: WelshMessengerServiceClient,
) =>
	messengerClient.interact({
		type: beapi.messenger.AppMessage.Type.TypeUserReaction,
		conversationPublicKey: convPK,
		targetCid: targetCID,
		payload: beapi.messenger.AppMessage.UserReaction.encode({ emoji, state }).finish(),
	})
