import grpcBridge from './bridge'

import rpcWeb from './rpc/rpc.grpcweb'
import { logger } from './middleware'

export type { GRPCBridge } from './bridge'
export { ReactNativeTransport } from './grpc-web-react-native-transport'
export { WebsocketTransport } from './grpc-web-websocket-transport'
export { createService as Service } from './service'
export { GRPCError, EOF } from './error'

export { rpcWeb, logger }

export default grpcBridge
