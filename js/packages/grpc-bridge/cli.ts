import bridge from './bridge'
import { berty } from '@berty-tech/api'
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'

const account = berty.chat.Account.create(
	bridge({ transport: NodeHttpTransport(), debug: true, host: 'http://127.0.0.1:9091' }),
)

account.conversationGet(berty.chat.ConversationGetRequest.create(), (error, response) => {
	console.log(error, response)
})
