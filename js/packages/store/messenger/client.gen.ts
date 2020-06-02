import * as api from '@berty-tech/api'

export type Commands<State> = {
	instanceShareableBertyID: (
		state: State,
		action: {
			payload: {
				id: string
				reset: boolean
				displayName: string
			}
		},
	) => State
	devShareInstanceBertyID: (
		state: State,
		action: {
			payload: {
				id: string
				reset: boolean
				displayName: string
			}
		},
	) => State
	parseDeepLink: (
		state: State,
		action: {
			payload: {
				id: string
				link: string
			}
		},
	) => State
	sendContactRequest: (
		state: State,
		action: {
			payload: {
				id: string
				bertyId: api.berty.messenger.IBertyID
				Metadata: Uint8Array
			}
		},
	) => State
}

export enum Methods {
	instanceShareableBertyID = 'instanceShareableBertyID',
	devShareInstanceBertyID = 'devShareInstanceBertyID',
	parseDeepLink = 'parseDeepLink',
	sendContactRequest = 'sendContactRequest',
}
