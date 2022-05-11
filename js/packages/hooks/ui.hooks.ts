import { useCallback } from 'react'

import { useNavigation } from '@berty/navigation'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { switchAccountAfterClosing } from '@berty/utils/accounts'
import { SoundKey } from '@berty/utils/sound/sound.types'
import { playSound } from '@berty/utils/sound/sounds'

import { useAppDispatch, useAppSelector } from './core.hooks'

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
	const { navigate } = useNavigation()
	const dispatch = useAppDispatch()
	const selectedAccount = useAppSelector(selectSelectedAccount)
	return useCallback(
		() =>
			navigate('Account.Closing', {
				callback: () => {
					switchAccountAfterClosing(dispatch, selectedAccount)
				},
			}),
		[navigate, selectedAccount, dispatch],
	)
}
