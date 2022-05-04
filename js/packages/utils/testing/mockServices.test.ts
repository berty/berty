import { EventEmitter } from 'events'

import store from '@berty/redux/store'

import { openClients } from '../messenger/clients'

export const mockServices = async () => {
	store.dispatch({ type: 'FULL_RESET' })
	await openClients(new EventEmitter(), store.dispatch, true)
}
