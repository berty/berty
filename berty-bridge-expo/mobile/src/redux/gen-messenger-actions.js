import pb from '@berty/api/root.pb'

console.log("import { createAction } from '@reduxjs/toolkit'")

console.log("\nimport beapi from '@berty/api'")

const enumType = 'berty.messenger.v1.StreamEvent.Type'
const prefix = 'beapi.messenger.StreamEvent'
const resolvedPrefix = ''
const enumTypeParts = enumType.split('.')
if (enumTypeParts.length < 2) {
	throw new Error('invalid enumType:', enumType)
}
const enumName = enumTypeParts[enumTypeParts.length - 1]
console.log(`\nexport const messengerActions = {`)
Object.entries(pb.lookup(enumType).values).forEach(([key, val]) => {
	let t = 'undefined'
	if (val !== 0) {
		t = `${prefix}.I${resolvedPrefix}${key.substr(enumName.length)}`
	} else {
		return
	}
	const typeName = `${prefix}.${enumName}.${key}`
	console.log(
		`  [${typeName}]: createAction<${t}, 'messenger/${key.substr(4)}'>('messenger/${key.substr(
			4,
		)}'),`,
	)
})
console.log('}')
