import { useCallback, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

import beapi from '@berty/api'
import {
	selectNodeNetworkConfig,
	selectEditedNetworkConfig,
} from '@berty/redux/reducers/networkConfig.reducer'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { accountService } from '@berty/store'

import { useAppSelector } from './core'
import { useRestart } from './ui.hooks'

/**
 * Returns a function that updates the berty node network config
 * via the account service and then restarts the berty node
 */
const useSetNetworkConfig = () => {
	const selectedAccount = useAppSelector(selectSelectedAccount)
	const restart = useRestart()

	return useCallback(
		(newConfig: beapi.account.INetworkConfig) => {
			accountService
				.networkConfigSet({
					accountId: selectedAccount,
					config: newConfig,
				})
				.then(() => {
					restart()
				})
		},
		[restart, selectedAccount],
	)
}

/**
 * If the network config was changed in the UI,
 * updates the node network config when the screen is removed
 **/
export const useSyncNetworkConfigOnScreenRemoved = () => {
	const navigation = useNavigation()
	const editedNetworkConfig = useAppSelector(selectEditedNetworkConfig)
	const nodeNetworkConfig = useAppSelector(selectNodeNetworkConfig)
	const setNetworkConfig = useSetNetworkConfig()
	useEffect(() => {
		if (JSON.stringify(editedNetworkConfig) !== JSON.stringify(nodeNetworkConfig)) {
			const effect = () => setNetworkConfig(editedNetworkConfig)
			navigation.addListener('beforeRemove', effect)
			return () => {
				navigation.removeListener('beforeRemove', effect)
			}
		}
	}, [navigation, editedNetworkConfig, nodeNetworkConfig, setNetworkConfig])
}
