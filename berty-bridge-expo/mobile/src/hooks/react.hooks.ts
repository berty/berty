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

/**
 * Current epoch milliseconds, held in state.
 *
 * Calling `Date.now()` while rendering is impure, so deadline checks
 * ("is this conversation still muted?") read from here instead. Keeping it in
 * state also means the UI updates by itself once a deadline passes, which the
 * render-time calls never did.
 */
export const useNow = (intervalMs: number = 30_000): number => {
	const [now, setNow] = useState(() => Date.now())

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), intervalMs)
		return () => clearInterval(id)
	}, [intervalMs])

	return now
}
