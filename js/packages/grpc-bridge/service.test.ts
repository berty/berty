import 'react-native'
import beapi from '@berty-tech/api'

import rpcNoop from './rpc/rpc.noop'
import { createService } from './service'

it('can create a client from a berty api object', async () => {
	await createService(beapi.account.AccountService, rpcNoop)
})
