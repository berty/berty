import { berty, weshnet } from './root.pb'

import account = berty.account.v1
import bridge = berty.bridge.v1
import push = weshnet.push.v1
import messenger = berty.messenger.v1
import protocol = weshnet.protocol.v1
import errcode = berty.errcode
import weshnet_errcode = weshnet.errcode

export { account, messenger, push, protocol, errcode, bridge, weshnet_errcode }
