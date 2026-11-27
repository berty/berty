import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSyncExternalStore } from 'react'

// How the app picks its colors:
// - system: follows the dark/light setting of the phone
// - light: the regular Berty theme (or the theme picked in the theme editor)
// - dark: dark theme, not fully black
// - black: pure black background (saves battery on AMOLED screens)
export type ThemeMode = 'system' | 'light' | 'dark' | 'black'

const STORAGE_KEY = 'berty-theme-mode'
const VALID_MODES: ThemeMode[] = ['system', 'light', 'dark', 'black']

// The theme mode is a setting of the device, not of an account: the redux theme state is only
// loaded once an account is opened, but the screens shown before that (loading, account
// selection) must already use the chosen theme. So it lives in its own small store.
let currentMode: ThemeMode = 'light'
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}

const getSnapshot = () => currentMode

const update = (mode: ThemeMode) => {
	if (mode === currentMode) {
		return
	}
	currentMode = mode
	listeners.forEach(listener => listener())
}

export const useThemeMode = (): ThemeMode => useSyncExternalStore(subscribe, getSnapshot)

export const setThemeMode = async (mode: ThemeMode): Promise<void> => {
	update(mode)
	try {
		await AsyncStorage.setItem(STORAGE_KEY, mode)
	} catch (e) {
		console.warn('unable to save the theme mode: ', e)
	}
}

export const loadThemeMode = async (): Promise<void> => {
	try {
		const stored = await AsyncStorage.getItem(STORAGE_KEY)
		if (stored && (VALID_MODES as string[]).includes(stored)) {
			update(stored as ThemeMode)
		}
	} catch (e) {
		console.warn('unable to load the theme mode: ', e)
	}
}
