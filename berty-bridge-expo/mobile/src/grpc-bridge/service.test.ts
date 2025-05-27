import 'react-native'
import beapi from '@berty/api'

import rpcNoop from './rpc/rpc.noop'
import { createServiceClient } from './service'

it('can create a client from a berty api object', async () => {
	await createServiceClient(beapi.account.AccountService, rpcNoop)
})
