import { EventEmitter } from 'events'

import store from '@berty/redux/store'

import { openClients } from '../messenger/clients'

export const mockServices = async () => {
	store.dispatch({ type: 'FULL_RESET' })
	await openClients(new EventEmitter(), store.dispatch, true)
}

export const randomValueFromEnum = <T>(anEnum: T): T[keyof T] => {
	const enumValues = Object.values(anEnum) as unknown as T[keyof T][]
	const randomIndex = Math.floor(Math.random() * enumValues.length)
	return enumValues[randomIndex]
}
