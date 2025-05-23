import { EffectCallback, useCallback, useEffect, useState } from 'react'
import { Keyboard } from 'react-native'

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (effect: EffectCallback) => useEffect(effect, [])

export enum KeyboardStatus {
	KEYBOARD_SHOWN,
	KEYBOARD_HIDDEN,
}

export const useKeyboardStatus = (): KeyboardStatus => {
	const [keyboardStatus, setKeyboardStatus] = useState<KeyboardStatus>(
		KeyboardStatus.KEYBOARD_HIDDEN,
	)

	const handleKeyboardDidShow = useCallback(async () => {
		// keyboard shown
		setKeyboardStatus(KeyboardStatus.KEYBOARD_SHOWN)
	}, [])

	const handleKeyboardDidHide = useCallback(async () => {
		// keyboard hidden
		setKeyboardStatus(KeyboardStatus.KEYBOARD_HIDDEN)
	}, [])

	useMountEffect(() => {
		const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow)
		const hideSubscription = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide)

		return () => {
			showSubscription.remove()
			hideSubscription.remove()
		}
	})

	return keyboardStatus
}
