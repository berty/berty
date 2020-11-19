import { createService } from './service'
import beapi from '@berty-tech/api'
import rpcNoop from '@berty-tech/grpc-bridge/rpc/rpc.noop'

it('can create a client from a berty api object', () => {
	createService(beapi.account.AccountService, rpcNoop)
})
