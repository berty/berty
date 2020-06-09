import * as api from '@berty-tech/api'
import { PayloadAction, CaseReducer } from '@reduxjs/toolkit'

export type Commands<State> = {
	instanceShareableBertyID: CaseReducer<
		State,
		PayloadAction<{
			id: string
			reset: boolean
			displayName: string
		}>
	>
	devShareInstanceBertyID: CaseReducer<
		State,
		PayloadAction<{
			id: string
			reset: boolean
			displayName: string
		}>
	>
	parseDeepLink: CaseReducer<
		State,
		PayloadAction<{
			id: string
			link: string
		}>
	>
	sendContactRequest: CaseReducer<
		State,
		PayloadAction<{
			id: string
			bertyId: api.berty.messenger.IBertyID
			metadata: Uint8Array
			ownMetadata: Uint8Array
		}>
	>
}

export enum Methods {
	instanceShareableBertyID = 'instanceShareableBertyID',
	devShareInstanceBertyID = 'devShareInstanceBertyID',
	parseDeepLink = 'parseDeepLink',
	sendContactRequest = 'sendContactRequest',
}
