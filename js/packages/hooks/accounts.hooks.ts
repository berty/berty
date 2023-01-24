import { NavigationProp } from '@react-navigation/native'
import { useCallback } from 'react'
import { Alert } from 'react-native'

import beapi from '@berty/api'
import { GoBridge } from '@berty/native-modules/GoBridge'
import { useNavigation } from '@berty/navigation'
import { ScreensParams } from '@berty/navigation/types'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { createAccount, deleteAccount, updateAccount } from '@berty/utils/accounts'
import { initBridge } from '@berty/utils/bridge/bridge'

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
const resetToClosing = async (
	reset: NavigationProp<ScreensParams>['reset'],
	callback: () => void,
) => {
	reset({ routes: [{ name: 'Account.Closing', params: { callback } }] })
}

export const closeBridgeAndNavigateToOnboarding = async (
	reset: NavigationProp<ScreensParams>['reset'],
	selectedAccount: string | null,
) => {
	await GoBridge.closeBridge()
	reset({
		routes: [
			{
				name: 'Account.SelectNode',
				params: {
					init: true,
					action: async (external: boolean, address: string, port: string) => {
						const res = await initBridge(external, address, port)
						if (!res) {
							Alert.alert('bridge: init failed')
							return false
						}

						reset({
							index: 0,
							routes: [
								{
									name: 'Account.GoToLogInOrCreate',
									params: { isCreate: false, selectedAccount },
								},
							],
						})
						return true
					},
				},
			},
		],
	})
}

export const useSwitchAccountAfterClosing = () => {
	const { reset } = useNavigation()
	return useCallback(
		(selectedAccount: string | null) =>
			resetToClosing(reset, async () => closeBridgeAndNavigateToOnboarding(reset, selectedAccount)),
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
		async () =>
			await resetToClosing(reset, async () => {
				await GoBridge.closeBridge()
				reset({
					routes: [
						{
							name: 'Account.SelectNode',
							params: {
								init: false,
								action: async (external: boolean, address: string, port: string) => {
									const res = await initBridge(external, address, port)
									if (!res) {
										Alert.alert('bridge: init failed')
										return false
									}

									reset({
										index: 0,
										routes: [{ name: 'Account.GoToLogInOrCreate', params: { isCreate: true } }],
									})
									return true
								},
							},
						},
					],
				})
			}),
		[reset],
	)
}

export const useImportingAccountAfterClosing = () => {
	const { reset } = useNavigation()
	return useCallback(
		async (filePath: string) =>
			await resetToClosing(reset, async () => {
				await GoBridge.closeBridge()
				reset({
					routes: [
						{
							name: 'Account.SelectNode',
							params: {
								init: true,
								action: async (external: boolean, address: string, port: string) => {
									const res = await initBridge(external, address, port)
									if (!res) {
										Alert.alert('bridge: init failed')
										return false
									}

									reset({ routes: [{ name: 'Account.Importing', params: { filePath } }] })
									return true
								},
							},
						},
					],
				})
			}),
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

export const useCloseBridgeAfterClosing = () => {
	const { reset } = useNavigation()
	return useCallback(
		() =>
			resetToClosing(reset, async () => {
				await GoBridge.closeBridge()
				reset({ routes: [{ name: 'Account.SelectNode' }] })
			}),

		[reset],
	)
}
