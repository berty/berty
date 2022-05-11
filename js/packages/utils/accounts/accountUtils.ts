import { CommonActions } from '@react-navigation/native'

import beapi from '@berty/api'
import { setAccounts, setSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import store, { AppDispatch } from '@berty/redux/store'
import { Maybe } from '@berty/store/hooks'

import { accountClient } from './accountClient'
import { closeAccount } from './closeAccount'

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

export const restart = async (accountID: Maybe<string>, dispatch: AppDispatch) => {
	try {
		await closeAccount(dispatch)
	} catch (e) {
		console.warn('unable to close account')
		return
	}
	dispatch(setSelectedAccount(accountID))
}

export const switchAccountAfterClosing = (
	dispatch: AppDispatch,
	selectedAccount: string | null,
) => {
	dispatch(setSelectedAccount(selectedAccount))
}

export const onBoardingAfterClosing = (navDispatch: any) => {
	navDispatch(
		CommonActions.reset({
			routes: [{ name: 'Onboarding.GetStarted' }],
		}),
	)
}

export const importAccountAfterClosing = (navigate: any, filePath: string) => {
	navigate('Account.Importing', { filePath })
}

export const deleteAccountAfterClosing = (navigate: any) => {
	navigate('Account.Deleting')
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
