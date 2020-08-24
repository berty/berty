import GoBridge from '@berty-tech/go-bridge'
import {
	serializeToBase64,
	deserializeFromBase64,
	ErrorStreamNotImplemented,
	getServiceName,
} from './utils'

// native rpc implem
const unary = async (method, request, metadata) => {
	const methodName = `/${getServiceName(method)}/${method.name}`
	const req64 = serializeToBase64(request)
	return GoBridge.invokeBridgeMethod(methodName, req64).then((res64) =>
		deserializeFromBase64(res64),
	)
}

const stream = async (method, request, metadata) => {
	throw ErrorStreamNotImplemented
}

export default {
	unaryCall: unary,
	streamCall: stream,
}
