import { default as pb } from './root.pb'

export default {
	account: pb.lookup('berty.account.v1'),
	bridge: pb.lookup('berty.bridge.v1'),
	messenger: pb.lookup('.berty.messenger.v1'),
	protocol: pb.lookup('.berty.protocol.v1'),
	errcode: pb.lookup('.berty.errcode'),
}
