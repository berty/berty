import { useCallback } from 'react'

import {
	PersistentOptionsKeys,
	selectPersistentOptions,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { selectMessengerClient, selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { SoundKey } from '@berty/utils/sound/sound.types'
import { playSound } from '@berty/utils/sound/sounds'

import { useAppSelector } from './core.hooks'

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

export const useMessengerClient = () => {
	return useAppSelector(selectMessengerClient)
}

export const useProtocolClient = () => {
	return useAppSelector(selectProtocolClient)
}
