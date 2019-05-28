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
export class IDServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.id
  }
}

@withContext
export class CommitLogStreamServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.commitLogStream
  }
}

@withContext
export class EventStreamServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.eventStream
  }
}

@withContext
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
export class GetEventServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.getEvent
  }
}

@withContext
export class EventSeenServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.eventSeen
  }
}

@withContext
export class EventRetryServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.eventRetry
  }
}

@withContext
export class ConfigPublicServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.configPublic
  }
}

@withContext
export class ConfigUpdateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.configUpdate
  }
}

@withContext
export class ContactRequestServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactRequest
  }
}

@withContext
export class ContactAcceptRequestServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactAcceptRequest
  }
}

@withContext
export class ContactRemoveServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactRemove
  }
}

@withContext
export class ContactUpdateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactUpdate
  }
}

@withContext
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
export class ContactServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contact
  }
}

@withContext
export class ContactCheckPublicKeyServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.contactCheckPublicKey
  }
}

@withContext
export class ConversationCreateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationCreate
  }
}

@withContext
export class ConversationUpdateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationUpdate
  }
}

@withContext
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
export class ConversationInviteServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationInvite
  }
}

@withContext
export class ConversationExcludeServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationExclude
  }
}

@withContext
export class ConversationAddMessageServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationAddMessage
  }
}

@withContext
export class ConversationServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversation
  }
}

@withContext
export class ConversationMemberServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationMember
  }
}

@withContext
export class ConversationReadServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationRead
  }
}

@withContext
export class ConversationRemoveServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationRemove
  }
}

@withContext
export class ConversationLastEventServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.conversationLastEvent
  }
}

@withContext
export class DevicePushConfigListServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigList
  }
}

@withContext
export class DevicePushConfigCreateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigCreate
  }
}

@withContext
export class DevicePushConfigNativeRegisterServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigNativeRegister
  }
}

@withContext
export class DevicePushConfigNativeUnregisterServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigNativeUnregister
  }
}

@withContext
export class DevicePushConfigRemoveServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigRemove
  }
}

@withContext
export class DevicePushConfigUpdateServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.devicePushConfigUpdate
  }
}

@withContext
export class HandleEventServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.handleEvent
  }
}

@withContext
export class GenerateFakeDataServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.generateFakeData
  }
}

@withContext
export class RunIntegrationTestsServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.runIntegrationTests
  }
}

@withContext
export class DebugPingServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.debugPing
  }
}

@withContext
export class DebugRequeueEventServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.debugRequeueEvent
  }
}

@withContext
export class DebugRequeueAllServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.debugRequeueAll
  }
}

@withContext
export class DeviceInfosServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.deviceInfos
  }
}

@withContext
export class AppVersionServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.appVersion
  }
}

@withContext
export class PeersServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.peers
  }
}

@withContext
export class ProtocolsServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.protocols
  }
}

@withContext
export class LogStreamServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.logStream
  }
}

@withContext
export class LogfileListServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.logfileList
  }
}

@withContext
export class LogfileReadServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.logfileRead
  }
}

@withContext
export class TestLogBackgroundErrorServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testLogBackgroundError
  }
}

@withContext
export class TestLogBackgroundWarnServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testLogBackgroundWarn
  }
}

@withContext
export class TestLogBackgroundDebugServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testLogBackgroundDebug
  }
}

@withContext
export class TestPanicServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testPanic
  }
}

@withContext
export class TestErrorServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.testError
  }
}

@withContext
export class MonitorBandwidthServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.monitorBandwidth
  }
}

@withContext
export class MonitorPeersServiceNodeContainer extends Stream {
  get service () {
    return this.props.context.node.service.monitorPeers
  }
}

@withContext
export class GetListenAddrsServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.getListenAddrs
  }
}

@withContext
export class GetListenInterfaceAddrsServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.getListenInterfaceAddrs
  }
}

@withContext
export class Libp2PPingServiceNodeContainer extends Unary {
  get service () {
    return this.props.context.node.service.libp2PPing
  }
}

@withContext
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
