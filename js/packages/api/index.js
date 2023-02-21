import { default as pb } from './root.pb'

const account = pb.lookup('berty.account.v1')
const bridge = pb.lookup('berty.bridge.v1')
const messenger = pb.lookup('.berty.messenger.v1')
const protocol = pb.lookup('.weshnet.protocol.v1')
const push = pb.lookup('.weshnet.push.v1')
const errcode = pb.lookup('.berty.errcode')
const weshnet_errcode = pb.lookup('.weshnet.errcode')

export { account, bridge, messenger, protocol, push, errcode, weshnet_errcode }

export default {
	account,
	bridge,
	messenger,
	protocol,
	push,
	errcode,
	weshnet_errcode,
}
