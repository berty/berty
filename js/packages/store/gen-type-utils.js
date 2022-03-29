import pb from '@berty/api/root.pb'

const enumMapping = (name, enumType, prefix, resolvedPrefix = '') => {
	const enumTypeParts = enumType.split('.')
	if (enumTypeParts.length < 2) {
		throw new Error('invalid enumType')
	}
	const enumName = enumTypeParts[enumTypeParts.length - 1]
	console.log(`\nexport type ${name}<T> =`)
	Object.entries(pb.lookup(enumType).values).forEach(([key, val]) => {
		let t = 'undefined'
		if (val !== 0) {
			t = `${prefix}.I${resolvedPrefix}${key.substr(enumName.length)}`
		}
		console.log(`T extends ${prefix}.${enumName}.${key} ? ${t} :`)
	})
	console.log('never')
}

console.log("import beapi from '@berty/api'")

enumMapping(
	'StreamEventPayloadType',
	'berty.messenger.v1.StreamEvent.Type',
	'beapi.messenger.StreamEvent',
)
enumMapping(
	'StreamEventNotifiedPayloadType',
	'berty.messenger.v1.StreamEvent.Notified.Type',
	'beapi.messenger.StreamEvent.Notified',
)
enumMapping(
	'AppMessagePayloadType',
	'berty.messenger.v1.AppMessage.Type',
	'beapi.messenger.AppMessage',
)
enumMapping(
	'MonitorGroupPayloadType',
	'berty.protocol.v1.MonitorGroup.TypeEventMonitor',
	'beapi.protocol.MonitorGroup',
	'EventMonitor',
)

console.log('')

Object.entries(pb.lookup('berty.messenger.v1.AppMessage.Type').values).forEach(([key, val]) => {
	if (val === 0) {
		console.log(`export type Interaction${key} =`)
		console.log(`{ type: beapi.messenger.AppMessage.Type.${key},`)
		console.log(`payload?: undefined,`)
	} else {
		console.log(`export type Interaction${key.substr('Type'.length)} =`)
		console.log(`{ type: beapi.messenger.AppMessage.Type.${key},`)
		console.log(`payload?: beapi.messenger.AppMessage.I${key.substr('Type'.length)},`)
	}
	console.log("} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>")
})

console.log('\nexport type ParsedInteraction =')
Object.entries(pb.lookup('berty.messenger.v1.AppMessage.Type').values).forEach(([key, val]) => {
	if (val === 0) {
		console.log(`| Interaction${key}`)
	} else {
		console.log(`| Interaction${key.substr('Type'.length)}`)
	}
})

const methodsHooks = (name, svcType, prefix) => {
	const svc = pb.lookup(svcType)
	console.log(`export type ${name} = {`)
	Object.values(svc.methods).forEach(method => {
		if (method.requestStream || method.responseStream) return
		console.log(`use${method.name}: () => {
			error: any
			call: (req?: ${prefix}.${method.name}.IRequest) => void
			reply: ${prefix}.${method.name}.IReply | null
			done: boolean
			called: boolean
			loading: boolean
		},`)
	})
	console.log('}')
}

methodsHooks('MessengerMethodsHooks', 'berty.messenger.v1.MessengerService', 'beapi.messenger')
methodsHooks('ProtocolMethodsHooks', 'berty.protocol.v1.ProtocolService', 'beapi.protocol')
