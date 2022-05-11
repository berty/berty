import { useCallback } from 'react'

import beapi from '@berty/api'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { createAccount, deleteAccount, updateAccount } from '@berty/utils/accounts'

import { useAppDispatch, useAppSelector } from './core.hooks'
import { useAccount } from './messenger.hooks'

export const useDeleteAccount = () => {
	const dispatch = useAppDispatch()
	const selectedAccount = useAppSelector(selectSelectedAccount)
	return useCallback(() => deleteAccount(selectedAccount, dispatch), [selectedAccount, dispatch])
}

export const useCreateNewAccount = () => {
	const dispatch = useAppDispatch()
	return useCallback(
		(newConfig?: beapi.account.INetworkConfig) => createAccount(dispatch, newConfig),
		[dispatch],
	)
}

/**
 * Returns a function to update the AccountService account
 */
export const useUpdateAccount = () => {
	return useCallback((payload: any) => updateAccount(payload), [])
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
