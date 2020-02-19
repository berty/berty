import { mockBridge } from '../mock'
import { protocolServiceHandlerFactory } from './handler'
import { ProtocolServiceClient } from './client.gen'

const main = async () => {
	const protocolInstance = new ProtocolServiceClient(
		await mockBridge(protocolServiceHandlerFactory),
	)

	protocolInstance.instanceGetConfiguration({}, (error, response) => {
		if (error) {
			console.error('protocol instance error')
		}
		console.log('response', response)
	})
}

main()
