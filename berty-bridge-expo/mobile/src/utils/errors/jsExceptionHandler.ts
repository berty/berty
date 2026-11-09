import type { ErrorUtils } from 'react-native'

// Replaces react-native-exception-handler's setJSExceptionHandler (the only API we used),
// which only wraps React Native's built-in ErrorUtils. The package is unmaintained and its
// native module no longer builds with Gradle 9.
const { ErrorUtils: errorUtils } = globalThis as unknown as { ErrorUtils: ErrorUtils }

export const setJSExceptionHandler = (
	handler: (error: Error, isFatal: boolean) => void,
	allowedInDevMode = false,
) => {
	if (__DEV__ && !allowedInDevMode) {
		console.log('Skipping setJSExceptionHandler: Reason: In DEV mode and allowedInDevMode = false')
		return
	}
	errorUtils.setGlobalHandler((error, isFatal) => handler(error as Error, isFatal))
	const consoleError = console.error
	console.error = (...args: unknown[]) => {
		errorUtils.reportError(args[0])
		consoleError(...args)
	}
}
