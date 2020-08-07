import { default as pb } from './index.pb'

export const bridge = pb.lookup('berty.bridge.v1')
export const protocol = pb.lookup('berty.protocol.v1')
export const messenger = pb.lookup('berty.messenger.v1')
export const errcode = pb.lookup('berty.errcode')
