import { observer } from 'mobx-react'
import { observe } from 'mobx'
import { Stream, StreamPagination } from './stream'
import { Unary } from './unary'
import { withContext } from './context'
import React, { Component } from 'react'

@withContext
@observer
export class ConfigEntityContainer extends Component {
  render () {
    const { context, id, children } = this.props
    const entity = context.entity.config.get(id)
    if (entity) {
      return children(entity)
    }
    return null
  }
}

@withContext
@observer
export class ContactEntityContainer extends Component {
  render () {
    const { context, id, children } = this.props
    const entity = context.entity.contact.get(id)
    if (entity) {
      return children(entity)
    }
    return null
  }
}

@withContext
@observer
export class DeviceEntityContainer extends Component {
  render () {
    const { context, id, children } = this.props
    const entity = context.entity.device.get(id)
    if (entity) {
      return children(entity)
    }
    return null
  }
}

@withContext
@observer
export class ConversationEntityContainer extends Component {
  render () {
    const { context, id, children } = this.props
    const entity = context.entity.conversation.get(id)
    if (entity) {
      return children(entity)
    }
    return null
  }
}

@withContext
@observer
export class ConversationMemberEntityContainer extends Component {
  render () {
    const { context, id, children } = this.props
    const entity = context.entity.conversationMember.get(id)
    if (entity) {
      return children(entity)
    }
    return null
  }
}

@withContext
@observer
export class EventEntityContainer extends Component {
  render () {
    const { context, id, children } = this.props
    const entity = context.entity.event.get(id)
    if (entity) {
      return children(entity)
    }
    return null
  }
}

@withContext
@observer
export class DevicePushConfigEntityContainer extends Component {
  render () {
    const { context, id, children } = this.props
    const entity = context.entity.devicePushConfig.get(id)
    if (entity) {
      return children(entity)
    }
    return null
  }
}

@withContext
@observer
export class DevicePushIdentifierEntityContainer extends Component {
  render () {
    const { context, id, children } = this.props
    const entity = context.entity.devicePushIdentifier.get(id)
    if (entity) {
      return children(entity)
    }
    return null
  }
}

@withContext
@observer
export class SenderAliasEntityContainer extends Component {
  render () {
    const { context, id, children } = this.props
    const entity = context.entity.senderAlias.get(id)
    if (entity) {
      return children(entity)
    }
    return null
  }
}

@withContext
@observer
export class IDServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.id
  }
}

@withContext
@observer
export class CommitLogStreamServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.commitLogStream
  }
}

@withContext
@observer
export class EventStreamServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.eventStream
  }
}

@withContext
@observer
export class EventListServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.eventList
  }
}

@withContext
class EventListServiceNodePaginationContainer extends StreamPagination {
  constructor (props, context) {
    super(props, context)
    observe(this.props.context.entity.event, this.observe)
  }

  get service () {
    return this.props.context.node.service.eventList
  }
}
EventListServiceNodeContainer.Pagination = EventListServiceNodePaginationContainer

@withContext
@observer
export class EventUnseenServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.eventUnseen
  }
}

@withContext
class EventUnseenServiceNodePaginationContainer extends StreamPagination {
  constructor (props, context) {
    super(props, context)
    observe(this.props.context.entity.event, this.observe)
  }

  get service () {
    return this.props.context.node.service.eventUnseen
  }
}
EventUnseenServiceNodeContainer.Pagination = EventUnseenServiceNodePaginationContainer

@withContext
@observer
export class GetEventServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.getEvent
  }
}

@withContext
@observer
export class EventSeenServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.eventSeen
  }
}

@withContext
@observer
export class EventRetryServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.eventRetry
  }
}

@withContext
@observer
export class ConfigPublicServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.configPublic
  }
}

@withContext
@observer
export class ConfigUpdateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.configUpdate
  }
}

@withContext
@observer
export class ContactRequestServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactRequest
  }
}

@withContext
@observer
export class ContactAcceptRequestServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactAcceptRequest
  }
}

@withContext
@observer
export class ContactRemoveServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactRemove
  }
}

@withContext
@observer
export class ContactUpdateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactUpdate
  }
}

@withContext
@observer
export class ContactListServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.contactList
  }
}

@withContext
class ContactListServiceNodePaginationContainer extends StreamPagination {
  constructor (props, context) {
    super(props, context)
    observe(this.props.context.entity.contact, this.observe)
  }

  get service () {
    return this.props.context.node.service.contactList
  }
}
ContactListServiceNodeContainer.Pagination = ContactListServiceNodePaginationContainer

@withContext
@observer
export class ContactServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contact
  }
}

@withContext
@observer
export class ContactCheckPublicKeyServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactCheckPublicKey
  }
}

@withContext
@observer
export class ConversationCreateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationCreate
  }
}

@withContext
@observer
export class ConversationUpdateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationUpdate
  }
}

@withContext
@observer
export class ConversationListServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.conversationList
  }
}

@withContext
class ConversationListServiceNodePaginationContainer extends StreamPagination {
  constructor (props, context) {
    super(props, context)
    observe(this.props.context.entity.conversation, this.observe)
  }

  get service () {
    return this.props.context.node.service.conversationList
  }
}
ConversationListServiceNodeContainer.Pagination = ConversationListServiceNodePaginationContainer

@withContext
@observer
export class ConversationInviteServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationInvite
  }
}

@withContext
@observer
export class ConversationExcludeServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationExclude
  }
}

@withContext
@observer
export class ConversationAddMessageServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationAddMessage
  }
}

@withContext
@observer
export class ConversationServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversation
  }
}

@withContext
@observer
export class ConversationMemberServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationMember
  }
}

@withContext
@observer
export class ConversationReadServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationRead
  }
}

@withContext
@observer
export class ConversationRemoveServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationRemove
  }
}

@withContext
@observer
export class ConversationLastEventServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationLastEvent
  }
}

@withContext
@observer
export class DevicePushConfigListServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigList
  }
}

@withContext
@observer
export class DevicePushConfigCreateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigCreate
  }
}

@withContext
@observer
export class DevicePushConfigNativeRegisterServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigNativeRegister
  }
}

@withContext
@observer
export class DevicePushConfigNativeUnregisterServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigNativeUnregister
  }
}

@withContext
@observer
export class DevicePushConfigRemoveServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigRemove
  }
}

@withContext
@observer
export class DevicePushConfigUpdateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigUpdate
  }
}

@withContext
@observer
export class HandleEventServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.handleEvent
  }
}

@withContext
@observer
export class GenerateFakeDataServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.generateFakeData
  }
}

@withContext
@observer
export class RunIntegrationTestsServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.runIntegrationTests
  }
}

@withContext
@observer
export class DebugPingServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.debugPing
  }
}

@withContext
@observer
export class DebugRequeueEventServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.debugRequeueEvent
  }
}

@withContext
@observer
export class DebugRequeueAllServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.debugRequeueAll
  }
}

@withContext
@observer
export class DeviceInfosServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.deviceInfos
  }
}

@withContext
@observer
export class AppVersionServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.appVersion
  }
}

@withContext
@observer
export class PeersServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.peers
  }
}

@withContext
@observer
export class ProtocolsServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.protocols
  }
}

@withContext
@observer
export class LogStreamServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.logStream
  }
}

@withContext
@observer
export class LogfileListServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.logfileList
  }
}

@withContext
@observer
export class LogfileReadServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.logfileRead
  }
}

@withContext
@observer
export class TestLogBackgroundErrorServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testLogBackgroundError
  }
}

@withContext
@observer
export class TestLogBackgroundWarnServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testLogBackgroundWarn
  }
}

@withContext
@observer
export class TestLogBackgroundDebugServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testLogBackgroundDebug
  }
}

@withContext
@observer
export class TestPanicServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testPanic
  }
}

@withContext
@observer
export class TestErrorServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testError
  }
}

@withContext
@observer
export class MonitorBandwidthServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.monitorBandwidth
  }
}

@withContext
@observer
export class MonitorPeersServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.monitorPeers
  }
}

@withContext
@observer
export class GetListenAddrsServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.getListenAddrs
  }
}

@withContext
@observer
export class GetListenInterfaceAddrsServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.getListenInterfaceAddrs
  }
}

@withContext
@observer
export class Libp2PPingServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.libp2PPing
  }
}

@withContext
@observer
export class ServiceNodeContainer extends Component {
  static CommitLogStream = CommitLogStreamServiceNodeContainer
  static EventStream = EventStreamServiceNodeContainer
  static EventList = EventListServiceNodeContainer
  static EventUnseen = EventUnseenServiceNodeContainer
  static ContactList = ContactListServiceNodeContainer
  static ConversationList = ConversationListServiceNodeContainer
  static LogStream = LogStreamServiceNodeContainer
  static LogfileList = LogfileListServiceNodeContainer
  static LogfileRead = LogfileReadServiceNodeContainer
  static MonitorBandwidth = MonitorBandwidthServiceNodeContainer
  static MonitorPeers = MonitorPeersServiceNodeContainer

  render () {
    const { context } = this.props
    return context => this.props.children(context.node)
  }
}

@withContext
@observer
export class StoreContainer extends Component {
  static Entity = {
    Config: ConfigEntityContainer,
    Contact: ContactEntityContainer,
    Device: DeviceEntityContainer,
    Conversation: ConversationEntityContainer,
    ConversationMember: ConversationMemberEntityContainer,
    Event: EventEntityContainer,
    DevicePushConfig: DevicePushConfigEntityContainer,
    DevicePushIdentifier: DevicePushIdentifierEntityContainer,
    SenderAlias: SenderAliasEntityContainer,
  }

  static Node = {
    Service: ServiceNodeContainer,
  }

  render () {
    const { context } = this.props
    return this.props.children(context)
  }
}

export default StoreContainer
