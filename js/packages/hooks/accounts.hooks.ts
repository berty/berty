import { useCallback } from 'react'

import beapi from '@berty/api'
import {
	createNewAccount,
	deleteAccount,
	updateAccount,
	switchAccount,
} from '@berty/store/accountUtils'
import { selectEmbedded, selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'

import { useAppDispatch, useAppSelector } from './core'

export const useDeleteAccount = () => {
	const dispatch = useAppDispatch()
	const embedded = useAppSelector(selectEmbedded)
	const selectedAccount = useAppSelector(selectSelectedAccount)
	return useCallback(
		() => deleteAccount(embedded, selectedAccount, dispatch),
		[embedded, selectedAccount, dispatch],
	)
}

export const useSwitchAccount = () => {
	const dispatch = useAppDispatch()
	const embedded = useAppSelector(selectEmbedded)
	return useCallback(
		(account: string) => switchAccount(embedded, account, dispatch),
		[embedded, dispatch],
	)
}

export const useCreateNewAccount = () => {
	const dispatch = useAppDispatch()
	const embedded = useAppSelector(selectEmbedded)
	return useCallback(
		(newConfig?: beapi.account.INetworkConfig) => createNewAccount(embedded, dispatch, newConfig),
		[embedded, dispatch],
	)
}

/**
 * Returns a function to update the AccountService account
 */
export const useUpdateAccount = () => {
	const embedded = useAppSelector(selectEmbedded)
	return useCallback((payload: any) => updateAccount(embedded, payload), [embedded])
}
