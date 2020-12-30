import { Platform } from 'react-native'
import base64 from 'base64-js'
import * as pb from 'protobufjs'

// methods
export const serializeToBase64 = (req: Uint8Array) => base64.fromByteArray(req)
export const deserializeFromBase64 = (b64: string) => new Uint8Array(base64.toByteArray(b64))

export const getServiceName = <T extends pb.Method>(method: T) => {
	const fullName = method.parent?.fullName
	if (fullName?.startsWith('.')) {
		return fullName.substring(1)
	}
	return fullName
}

// CONST
export const isWeb = Platform.OS === 'web'
export const isElectron = !!(
	isWeb &&
	window.navigator &&
	window.navigator.userAgent &&
	window.navigator.userAgent.toLowerCase().indexOf('electron') !== -1
)

// Error
export const ErrorStreamNotImplemented = new Error('stream service not implemented')
export const ErrorUnaryNotImplemented = new Error('unary service not implemented')
