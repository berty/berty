import { useCallback } from 'react'

import beapi from '@berty/api'
import { selectEmbedded, selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import {
	createNewAccount,
	deleteAccount,
	updateAccount,
	switchAccount,
} from '@berty/utils/accounts/accountUtils'

import { useAppDispatch, useAppSelector } from './core.hooks'
import { useAccount } from './messenger.hooks'

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

export const useAccountServices = (): Array<beapi.messenger.IServiceToken> => {
	const account = useAccount()
	if (!account.serviceTokens) {
		return []
	}

	return Object.values(
		account.serviceTokens.reduce(
			(tokens, t) => ({
				...tokens,
				[`${t.authenticationUrl}-${t.serviceType}`]: t,
			}),
			{},
		),
	)
}
