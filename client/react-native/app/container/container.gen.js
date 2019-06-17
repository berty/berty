import { observer } from 'mobx-react'
import { observe } from 'mobx'
import { Stream, StreamPagination } from './stream'
import { Unary } from './unary'
import { Entity } from './entity'
import { withStoreContext } from '@berty/store/context'
import { Component } from 'react'

@withStoreContext
@observer
export class ConfigEntity extends Entity {
  fetch = () => {
    const { context, children, ...input } = this.props
    return context.node.service.config(input)
  }

  get store () {
    const { context } = this.props
    return context.entity.config
  }
}

@withStoreContext
@observer
export class ContactEntity extends Entity {
  fetch = () => {
    const { context, children, ...input } = this.props
    return context.node.service.contact(input)
  }

  get store () {
    const { context } = this.props
    return context.entity.contact
  }
}

@withStoreContext
@observer
export class DeviceEntity extends Entity {
  fetch = () => {
    const { context, children, ...input } = this.props
    return context.node.service.device(input)
  }

  get store () {
    const { context } = this.props
    return context.entity.device
  }
}

@withStoreContext
@observer
export class ConversationEntity extends Entity {
  fetch = () => {
    const { context, children, ...input } = this.props
    return context.node.service.conversation(input)
  }

  get store () {
    const { context } = this.props
    return context.entity.conversation
  }
}

@withStoreContext
@observer
export class ConversationMemberEntity extends Entity {
  fetch = () => {
    const { context, children, ...input } = this.props
    return context.node.service.conversationMember(input)
  }

  get store () {
    const { context } = this.props
    return context.entity.conversationMember
  }
}

@withStoreContext
@observer
export class EventEntity extends Entity {
  fetch = () => {
    const { context, children, ...input } = this.props
    return context.node.service.event(input)
  }

  get store () {
    const { context } = this.props
    return context.entity.event
  }
}

@withStoreContext
@observer
export class DevicePushConfigEntity extends Entity {
  fetch = () => {
    const { context, children, ...input } = this.props
    return context.node.service.devicePushConfig(input)
  }

  get store () {
    const { context } = this.props
    return context.entity.devicePushConfig
  }
}

@withStoreContext
@observer
export class DevicePushIdentifierEntity extends Entity {
  fetch = () => {
    const { context, children, ...input } = this.props
    return context.node.service.devicePushIdentifier(input)
  }

  get store () {
    const { context } = this.props
    return context.entity.devicePushIdentifier
  }
}

@withStoreContext
@observer
export class SenderAliasEntity extends Entity {
  fetch = () => {
    const { context, children, ...input } = this.props
    return context.node.service.senderAlias(input)
  }

  get store () {
    const { context } = this.props
    return context.entity.senderAlias
  }
}

@withStoreContext
export class IDServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.id
  }
}

@withStoreContext
export class CommitLogStreamServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.commitLogStream
  }
}

@withStoreContext
export class EventStreamServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.eventStream
  }
}

@withStoreContext
export class EventListServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.eventList
  }
}

@withStoreContext
class EventListServiceNodePagination extends StreamPagination {
  componentDidMount () {
    super.componentDidMount()
    this.dispose = observe(this.props.context.entity.event, this.observe)
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.dispose()
  }

  get method () {
    return this.props.context.node.service.eventList
  }
}
EventListServiceNode.Pagination = EventListServiceNodePagination

@withStoreContext
export class EventUnseenServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.eventUnseen
  }
}

@withStoreContext
class EventUnseenServiceNodePagination extends StreamPagination {
  componentDidMount () {
    super.componentDidMount()
    this.dispose = observe(this.props.context.entity.event, this.observe)
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.dispose()
  }

  get method () {
    return this.props.context.node.service.eventUnseen
  }
}
EventUnseenServiceNode.Pagination = EventUnseenServiceNodePagination

@withStoreContext
export class GetEventServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.getEvent
  }
}

@withStoreContext
export class EventSeenServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.eventSeen
  }
}

@withStoreContext
export class EventRetryServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.eventRetry
  }
}

@withStoreContext
export class ConfigServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.config
  }
}

@withStoreContext
export class ConfigPublicServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.configPublic
  }
}

@withStoreContext
export class ConfigUpdateServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.configUpdate
  }
}

@withStoreContext
export class ContactRequestServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.contactRequest
  }
}

@withStoreContext
export class ContactAcceptRequestServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.contactAcceptRequest
  }
}

@withStoreContext
export class ContactRemoveServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.contactRemove
  }
}

@withStoreContext
export class ContactUpdateServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.contactUpdate
  }
}

@withStoreContext
export class ContactListServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.contactList
  }
}

@withStoreContext
class ContactListServiceNodePagination extends StreamPagination {
  componentDidMount () {
    super.componentDidMount()
    this.dispose = observe(this.props.context.entity.contact, this.observe)
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.dispose()
  }

  get method () {
    return this.props.context.node.service.contactList
  }
}
ContactListServiceNode.Pagination = ContactListServiceNodePagination

@withStoreContext
export class ContactServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.contact
  }
}

@withStoreContext
export class ContactCheckPublicKeyServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.contactCheckPublicKey
  }
}

@withStoreContext
export class ConversationCreateServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversationCreate
  }
}

@withStoreContext
export class ConversationUpdateServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversationUpdate
  }
}

@withStoreContext
export class ConversationListServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.conversationList
  }
}

@withStoreContext
class ConversationListServiceNodePagination extends StreamPagination {
  componentDidMount () {
    super.componentDidMount()
    this.dispose = observe(this.props.context.entity.conversation, this.observe)
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.dispose()
  }

  get method () {
    return this.props.context.node.service.conversationList
  }
}
ConversationListServiceNode.Pagination = ConversationListServiceNodePagination

@withStoreContext
export class ConversationInviteServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversationInvite
  }
}

@withStoreContext
export class ConversationExcludeServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversationExclude
  }
}

@withStoreContext
export class ConversationAddMessageServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversationAddMessage
  }
}

@withStoreContext
export class ConversationServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversation
  }
}

@withStoreContext
export class ConversationMemberServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversationMember
  }
}

@withStoreContext
export class ConversationReadServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversationRead
  }
}

@withStoreContext
export class ConversationRemoveServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversationRemove
  }
}

@withStoreContext
export class ConversationLastEventServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.conversationLastEvent
  }
}

@withStoreContext
export class DevicePushConfigListServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.devicePushConfigList
  }
}

@withStoreContext
export class DevicePushConfigCreateServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.devicePushConfigCreate
  }
}

@withStoreContext
export class DevicePushConfigNativeRegisterServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.devicePushConfigNativeRegister
  }
}

@withStoreContext
export class DevicePushConfigNativeUnregisterServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.devicePushConfigNativeUnregister
  }
}

@withStoreContext
export class DevicePushConfigRemoveServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.devicePushConfigRemove
  }
}

@withStoreContext
export class DevicePushConfigUpdateServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.devicePushConfigUpdate
  }
}

@withStoreContext
export class HandleEventServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.handleEvent
  }
}

@withStoreContext
export class GenerateFakeDataServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.generateFakeData
  }
}

@withStoreContext
export class RunIntegrationTestsServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.runIntegrationTests
  }
}

@withStoreContext
export class DebugPingServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.debugPing
  }
}

@withStoreContext
export class DebugRequeueEventServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.debugRequeueEvent
  }
}

@withStoreContext
export class DebugRequeueAllServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.debugRequeueAll
  }
}

@withStoreContext
export class DeviceInfosServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.deviceInfos
  }
}

@withStoreContext
export class AppVersionServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.appVersion
  }
}

@withStoreContext
export class PeersServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.peers
  }
}

@withStoreContext
export class ProtocolsServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.protocols
  }
}

@withStoreContext
export class LogStreamServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.logStream
  }
}

@withStoreContext
export class LogfileListServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.logfileList
  }
}

@withStoreContext
export class LogfileReadServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.logfileRead
  }
}

@withStoreContext
export class TestLogBackgroundErrorServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.testLogBackgroundError
  }
}

@withStoreContext
export class TestLogBackgroundWarnServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.testLogBackgroundWarn
  }
}

@withStoreContext
export class TestLogBackgroundDebugServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.testLogBackgroundDebug
  }
}

@withStoreContext
export class TestPanicServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.testPanic
  }
}

@withStoreContext
export class TestErrorServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.testError
  }
}

@withStoreContext
export class MonitorBandwidthServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.monitorBandwidth
  }
}

@withStoreContext
export class MonitorPeersServiceNode extends Stream {
  get method () {
    return this.props.context.node.service.monitorPeers
  }
}

@withStoreContext
export class GetListenAddrsServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.getListenAddrs
  }
}

@withStoreContext
export class GetListenInterfaceAddrsServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.getListenInterfaceAddrs
  }
}

@withStoreContext
export class Libp2PPingServiceNode extends Unary {
  get method () {
    return this.props.context.node.service.libp2PPing
  }
}

@withStoreContext
export class ServiceNode extends Component {
  static CommitLogStream = CommitLogStreamServiceNode
  static EventStream = EventStreamServiceNode
  static EventList = EventListServiceNode
  static EventUnseen = EventUnseenServiceNode
  static ContactList = ContactListServiceNode
  static ConversationList = ConversationListServiceNode
  static LogStream = LogStreamServiceNode
  static LogfileList = LogfileListServiceNode
  static LogfileRead = LogfileReadServiceNode
  static MonitorBandwidth = MonitorBandwidthServiceNode
  static MonitorPeers = MonitorPeersServiceNode

  render () {
    return context => this.props.children(context.node)
  }
}

@withStoreContext
export class Store extends Component {
  static Entity = {
    Config: ConfigEntity,
    Contact: ContactEntity,
    Device: DeviceEntity,
    Conversation: ConversationEntity,
    ConversationMember: ConversationMemberEntity,
    Event: EventEntity,
    DevicePushConfig: DevicePushConfigEntity,
    DevicePushIdentifier: DevicePushIdentifierEntity,
    SenderAlias: SenderAliasEntity,
  }

  static Node = {
    Service: ServiceNode,
  }

  render () {
    const { context } = this.props
    return this.props.children(context)
  }
}

export default Store
