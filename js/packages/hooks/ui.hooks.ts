import { useCallback } from 'react'

import {
	PersistentOptionsKeys,
	selectPersistentOptions,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { selectEmbedded, selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { playSound, SoundKey, restart } from '@berty/store'

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
