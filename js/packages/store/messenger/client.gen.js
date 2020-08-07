import * as api from '@berty-tech/api'
import { PayloadAction, CaseReducer } from '@reduxjs/toolkit'

export const Methods = {
	instanceShareableBertyID: 'instanceShareableBertyID',
	shareableBertyGroup: 'shareableBertyGroup',
	devShareInstanceBertyID: 'devShareInstanceBertyID',
	parseDeepLink: 'parseDeepLink',
	sendContactRequest: 'sendContactRequest',
	sendMessage: 'sendMessage',
	sendAck: 'sendAck',
	systemInfo: 'systemInfo',
	echoTest: 'echoTest',
	conversationStream: 'conversationStream',
	eventStream: 'eventStream',
	conversationCreate: 'conversationCreate',
	accountGet: 'accountGet',
}
