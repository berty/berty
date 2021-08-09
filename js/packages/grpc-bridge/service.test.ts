import 'react-native'
import beapi from '@berty-tech/api'

import { createService } from './service'
import rpcNoop from './rpc/rpc.noop'

it('can create a client from a berty api object', async () => {
	await createService(beapi.account.AccountService, rpcNoop)
})
