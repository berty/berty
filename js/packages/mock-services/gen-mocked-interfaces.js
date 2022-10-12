import pb from '@berty/api/root.pb'

console.log("import beapi from '@berty/api'")
console.log("import { UnaryMock, ResponseStreamMock } from './types'")

const services = [
	'berty.protocol.v1.ProtocolService',
	'berty.account.v1.AccountService',
	'berty.messenger.v1.MessengerService',
]

const fullTypeName = obj => {
	let names = []
	while (obj.parent) {
		names.push(obj.name)
		obj = obj.parent
	}
	if (obj.name) {
		names.push(obj.name)
	}
	names.reverse()
	names = names.filter(name => name !== 'v1')
	names = names.map(part => (part === 'berty' ? 'beapi' : part))
	return names.join('.')
}

const interfacize = name => {
	const parts = name.split('.')
	parts[parts.length - 1] = 'I' + parts[parts.length - 1]
	return parts.join('.')
}

for (const svcType of services) {
	const svc = pb.lookup(svcType)
	console.log(`\nexport interface I${svc.name}Mock {`)
	Object.entries(svc.methods).forEach(([key, method]) => {
		console.log(key + ': ')
		const resolved = method.resolve()
		const requestPath = interfacize(fullTypeName(resolved.resolvedRequestType))
		const responsePath = interfacize(fullTypeName(resolved.resolvedResponseType))
		if (!method.requestStream && !method.responseStream) {
			// UNARY
			console.log(`UnaryMock<${requestPath}, ${responsePath}>`)
			return
		}
		if (method.requestStream && !method.responseStream) {
			// REQUEST STREAM
			console.log(`RequestStreamMock<${requestPath}, ${responsePath}>`)
			return
		}
		if (!method.requestStream && method.responseStream) {
			// RESPONSE STREAM
			console.log(`ResponseStreamMock<${requestPath}, ${responsePath}>`)
			return
		}
		// BIDI
		console.log('never')
	})
	console.log('}')
}
