import { mockBridge } from '../mock'
import { ProtocolServiceHandler } from './handler'
import { ProtocolServiceClient } from './client.gen'

const protocolInstance = new ProtocolServiceClient(mockBridge(ProtocolServiceHandler))

protocolInstance.accountSubscribe({}, (error, response) => {
	if (error) {
		console.error('protocol instance error')
	}
	console.log('response', response)
})
