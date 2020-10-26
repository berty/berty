import { berty } from '@berty-tech/api/index.pb'

declare function createService(
	service: string,
	rpcImpl: any,
	middleware: any,
): berty.messenger.v1.MessengerService | berty.protocol.v1.ProtocolService
