import fs from 'fs'

import { eventStreamReducer } from '@berty-tech/store/reducer/eventStreamReducer'
import { streamEventToAction } from '@berty-tech/store/convert'
import { MessengerState } from '@berty-tech/store/types'

if (process.argv.length < 3) {
	throw new Error('not enough args')
}

const inArg = process.argv[process.argv.length - 2]
const outArg = process.argv[process.argv.length - 1]

const eventsLines = fs.readFileSync(inArg)

const jsons = eventsLines
	.toString('utf8')
	.split('\n')
	.filter(j => !!j)

const events = jsons.map(j => {
	try {
		return JSON.parse(j)
	} catch (e) {
		console.error(j)
		throw e
	}
})

let store = {} as MessengerState

console.log(store)
let i = 0
for (const e of events) {
	console.log(`Event #${i}`)
	//console.log(e)
	let action
	try {
		action = streamEventToAction(e)
		if (!action) {
			continue
		}
	} catch (e) {
		console.warn(e)
		continue
	}
	console.log(action)
	store = eventStreamReducer(store, action)
	console.log(store)
	i++
}

console.log(store)

fs.writeFileSync(outArg, JSON.stringify(store, null, 2))
