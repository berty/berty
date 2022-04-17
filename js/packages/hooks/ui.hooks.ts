import { useCallback } from 'react'

import beapi from '@berty/api'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { selectEmbedded, selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { setCurrentNetworkConfig } from '@berty/redux/reducers/networkConfig.reducer'
import { accountService, playSound, SoundKey, restart } from '@berty/store'

import { useAppDispatch, useAppSelector } from './core'

export const usePlaySound = () => {
	const persistentOptions = useAppSelector(selectPersistentOptions)
	return useCallback(
		(sound: SoundKey) => {
			if (persistentOptions[PersistentOptionsKeys.Notifications].enable) {
				playSound(sound)
			}
			return
		},
		[persistentOptions],
	)
}

export const useRestart = () => {
	const dispatch = useAppDispatch()
	const embedded = useAppSelector(selectEmbedded)
	const selectedAccount = useAppSelector(selectSelectedAccount)
	return useCallback(
		() => restart(embedded, selectedAccount, dispatch),
		[selectedAccount, embedded, dispatch],
	)
}

export const useSetNetworkConfig = () => {
	const selectedAccount = useAppSelector(selectSelectedAccount)
	const dispatch = useAppDispatch()
	const restart = useRestart()

	// setNewConfig function: update the state + update the network config in the account service
	return useCallback(
		(newConfig: beapi.account.INetworkConfig) => {
			accountService
				.networkConfigSet({
					accountId: selectedAccount,
					config: newConfig,
				})
				.then(() => {
					dispatch(setCurrentNetworkConfig(newConfig))
					restart()
				})
		},
		[restart, dispatch, selectedAccount],
	)
}
