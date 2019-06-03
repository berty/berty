import pbjs from 'protobufjs/light'
import sigchainJson from './crypto/sigchain/sigchain.pb.json'
import keypairJson from './crypto/keypair/keypair.pb.json'
import chunkJson from './chunk/chunk.pb.json'
import senderAliasJson from './entity/sender_alias.pb.json'
import voidJson from './entity/void.pb.json'
import errJson from './entity/err.pb.json'
import eventJson from './entity/event.pb.json'
import devicePushConfigJson from './entity/device_push_config.pb.json'
import devicePushIdentifierJson from './entity/device_push_identifier.pb.json'
import messageJson from './entity/message.pb.json'
import deviceJson from './entity/device.pb.json'
import configJson from './entity/config.pb.json'
import envelopeJson from './entity/envelope.pb.json'
import contactJson from './entity/contact.pb.json'
import entityKindJson from './entity/kind.pb.json'
import conversationJson from './entity/conversation.pb.json'
import metricJson from './network/metric/metric.pb.json'
import peerJson from './network/metric/peer.pb.json'
import daemonJson from './daemon/daemon.pb.json'
import p2pServiceJson from './api/p2p/service.pb.json'
import nodeServiceJson from './api/node/service.pb.json'

const exportPbJson = (jsonDescriptor, ServiceName) => {
  const pbFromJson = pbjs.Root.fromJSON(jsonDescriptor)
  return pbFromJson.lookup(ServiceName)
}

const sigchain = exportPbJson(sigchainJson, 'sigchain')
const keypair = exportPbJson(keypairJson, 'keypair')
const chunk = exportPbJson(chunkJson, 'berty.chunk.Chunk')
const senderAlias = exportPbJson(senderAliasJson, 'berty.entity.SenderAlias')
const voidService = exportPbJson(voidJson, 'berty.entity.Void')
const err = exportPbJson(errJson, 'berty.entity.Err')
const event = exportPbJson(eventJson, 'berty.entity.Event')
const devicePushConfig = exportPbJson(
  devicePushConfigJson,
  'berty.entity.DevicePushConfig'
)
const devicePushIdentifier = exportPbJson(
  devicePushIdentifierJson,
  'berty.entity.DevicePushIdentifier'
)
const message = exportPbJson(messageJson, 'berty.entity.Message')
const device = exportPbJson(deviceJson, 'berty.entity.Device')
const config = exportPbJson(configJson, 'berty.entity.Config')
const envelope = exportPbJson(envelopeJson, 'berty.entity.Envelope')
const contact = exportPbJson(contactJson, 'berty.entity.Contact')
const entityKind = exportPbJson(entityKindJson, 'berty.entity.Kind')
const conversation = exportPbJson(conversationJson, 'berty.entity.Conversation')
const metric = exportPbJson(metricJson, 'berty.network.metric.Metric')
const peer = exportPbJson(peerJson, 'berty.network.metric.Peer')
const daemon = exportPbJson(daemonJson, 'berty.daemon.Daemon')
const p2pService = exportPbJson(p2pServiceJson, 'berty.p2p.Service')
const nodeService = exportPbJson(nodeServiceJson, 'berty.node.Service')

export { sigchain as Sigchain }
export { keypair as Keypair }
export { chunk as Chunk }
export { senderAlias as SenderAlias }
export { voidService as VoidService }
export { err as Err }
export { event as Event }
export { devicePushConfig as DevicePushConfig }
export { devicePushIdentifier as DevicePushIdentifier }
export { message as Message }
export { device as Device }
export { config as Config }
export { envelope as Envelope }
export { contact as Contact }
export { entityKind as EntityKind }
export { conversation as Conversation }
export { metric as Metric }
export { peer as Peer }
export { daemon as Daemon }
export { p2pService as P2pService }
export { nodeService as NodeService }

export { createService as create } from './service'
