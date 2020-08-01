import { Platform } from 'react-native'
import base64 from 'base64-js'

// methods
export const serializeToBase64 = (req) => base64.fromByteArray(req)
export const deserializeFromBase64 = (b64) => new Uint8Array(base64.toByteArray(b64))
export const getServiceName = (method) => {
	const fullName = method.parent.fullName
	if (fullName.startsWith('.')) {
		return fullName.substring(1)
	}
	return fullName
}

// CONST
export const isWeb = Platform.OS === 'web'
export const isElectron =
	isWeb &&
	window.navigator &&
	window.navigator.userAgent &&
	window.navigator.userAgent.toLowerCase().indexOf('electron') !== -1

// Error
export const ErrorStreamNotImplemented = new Error('stream service not implemented')
export const ErrorUnaryNotImplemented = new Error('unary service not implemented')
