import { NavigationProp } from '@react-navigation/native'
import { useCallback } from 'react'

import beapi from '@berty/api'
import { useNavigation } from '@berty/navigation'
import { ScreensParams } from '@berty/navigation/types'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { createAccount, deleteAccount, updateAccount } from '@berty/utils/accounts'

import { useAppSelector } from './core.hooks'
import { useAccount } from './messenger.hooks'

export const useDeleteAccount = () => {
	const { reset } = useNavigation()
	return useCallback(
		(selectedAccount: string | null) => deleteAccount(reset, selectedAccount),
		[reset],
	)
}

export const useCreateNewAccount = () => {
	const { reset } = useNavigation()
	return useCallback(
		(newConfig?: beapi.account.INetworkConfig) => createAccount(reset, newConfig),
		[reset],
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

/**
 * hooks for differents actions after closing account
 */
const resetToClosing = (reset: NavigationProp<ScreensParams>['reset'], callback: () => void) => {
	reset({ routes: [{ name: 'Account.Closing', params: { callback } }] })
}

export const useSwitchAccountAfterClosing = () => {
	const { reset } = useNavigation()
	return useCallback(
		(selectedAccount: string | null) =>
			resetToClosing(reset, () =>
				reset({ routes: [{ name: 'Account.Opening', params: { selectedAccount } }] }),
			),
		[reset],
	)
}

export const useRestartAfterClosing = () => {
	const selectedAccount = useAppSelector(selectSelectedAccount)
	const switchAccount = useSwitchAccountAfterClosing()
	return useCallback(() => switchAccount(selectedAccount), [selectedAccount, switchAccount])
}

export const useOnBoardingAfterClosing = () => {
	const { reset } = useNavigation()
	return useCallback(
		() => resetToClosing(reset, () => reset({ routes: [{ name: 'Onboarding.GetStarted' }] })),
		[reset],
	)
}

export const useImportingAccountAfterClosing = () => {
	const { reset } = useNavigation()
	return useCallback(
		(filePath: string) =>
			resetToClosing(reset, () =>
				reset({ routes: [{ name: 'Account.Importing', params: { filePath } }] }),
			),
		[reset],
	)
}

export const useDeletingAccountAfterClosing = () => {
	const selectedAccount = useAppSelector(selectSelectedAccount)
	const { reset } = useNavigation()
	return useCallback(
		() =>
			resetToClosing(reset, () =>
				reset({ routes: [{ name: 'Account.Deleting', params: { selectedAccount } }] }),
			),
		[reset, selectedAccount],
	)
}
