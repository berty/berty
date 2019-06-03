import { observable, computed } from 'mobx'
import Stream from 'stream'

export class ConfigEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  id = null
  createdAt = null
  updatedAt = null
  @computed get myself () {
    return this.store.entity.contact.get(this.myselfId)
  }
  set myself (myself) {
    this.store.entity.contact.set(this.myselfId, myself)
  }
  myselfId = null
  @computed get currentDevice () {
    return this.store.entity.device.get(this.currentDeviceId)
  }
  set currentDevice (currentDevice) {
    this.store.entity.device.set(this.currentDeviceId, currentDevice)
  }
  currentDeviceId = null
  cryptoParams = null
  pushRelayPubkeyApns = null
  pushRelayPubkeyFcm = null
  notificationsEnabled = null
  notificationsPreviews = null
  debugNotificationVerbosity = null
}
export class ContactEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  id = null
  createdAt = null
  updatedAt = null
  sigchain = null
  status = null
  @computed get devices () {
    return this.store.entity.device
      .values()
      .filter(_ => _.contactId === this.id)
  }
  set devices (devices) {
    devices.forEach(_ =>
      this.store.entity.device.set(_.id, new DeviceEntityStore(this.store, _))
    )
  }
  displayName = null
  displayStatus = null
  overrideDisplayName = null
  overrideDisplayStatus = null
}
export class DeviceEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  id = null
  createdAt = null
  updatedAt = null
  name = null
  status = null
  apiVersion = null
  contactId = null
  @computed get pushIdentifiers () {
    return this.store.entity.devicePushIdentifier
      .values()
      .filter(_ => _.deviceId === this.id)
  }
  set pushIdentifiers (pushIdentifiers) {
    pushIdentifiers.forEach(_ =>
      this.store.entity.devicePushIdentifier.set(
        _.id,
        new DevicePushIdentifierEntityStore(this.store, _)
      )
    )
  }
}
export class ConversationEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  id = null
  createdAt = null
  updatedAt = null
  readAt = null
  wroteAt = null
  title = null
  topic = null
  infos = null
  kind = null
  @computed get members () {
    return this.store.entity.conversationMember
      .values()
      .filter(_ => _.conversationId === this.id)
  }
  set members (members) {
    members.forEach(_ =>
      this.store.entity.conversationMember.set(
        _.id,
        new ConversationMemberEntityStore(this.store, _)
      )
    )
  }
}
export class ConversationMemberEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  id = null
  createdAt = null
  updatedAt = null
  readAt = null
  wroteAt = null
  status = null
  @computed get contact () {
    return this.store.entity.contact.get(this.contactId)
  }
  set contact (contact) {
    this.store.entity.contact.set(this.contactId, contact)
  }
  conversationId = null
  contactId = null
}
export class EventEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  id = null
  sourceDeviceId = null
  createdAt = null
  updatedAt = null
  sentAt = null
  receivedAt = null
  ackedAt = null
  direction = null
  apiVersion = null
  kind = null
  attributes = null
  seenAt = null
  ackStatus = null
  @computed get dispatches () {
    return this.store.entity.eventDispatch
      .values()
      .filter(_ => _.eventId === this.id)
  }
  set dispatches (dispatches) {
    dispatches.forEach(_ =>
      this.store.entity.eventDispatch.set(
        _.id,
        new EventDispatchEntityStore(this.store, _)
      )
    )
  }
  sourceContactId = null
  targetType = null
  targetAddr = null
  errProxy = null
  metadata = []
}
export class DevicePushConfigEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  id = null
  createdAt = null
  updatedAt = null
  deviceId = null
  pushType = null
  pushId = null
  relayPubkey = null
}
export class DevicePushIdentifierEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  id = null
  createdAt = null
  updatedAt = null
  pushInfo = null
  relayPubkey = null
  deviceId = null
}
export class EventDispatchEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  eventId = null
  deviceId = null
  contactId = null
  sentAt = null
  ackedAt = null
  seenAt = null
  ackMedium = null
  seenMedium = null
  retryBackoff = null
  sendErrorMessage = null
  sendErrorDetail = null
}
export class SenderAliasEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  id = null
  createdAt = null
  updatedAt = null
  status = null
  originDeviceId = null
  contactId = null
  conversationId = null
  aliasIdentifier = null
  used = null
}

export class NodeServiceStore {
  constructor (store, bridge) {
    this.store = store
    this.bridge = bridge
    this.commitLogStream({})
  }

  pages = {}

  id = async input => {
    let output = await this.bridge.id(input)

    return output
  }

  commitLogStream = async input => {
    const stream = await this.bridge.commitLogStream(input)
    stream.on('data', output => {
      Object.keys(output.entity).forEach(key => {
        if (output.entity[key] == null) {
          return
        }
        switch (key) {
          default:
            break
          case 'config':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.config.set(
                  output.entity[key].id,
                  new ConfigEntityStore(this.store, output.entity[key])
                )
                break
              case 2:
                if (this.store.entity.config.has(output.entity[key].id)) {
                  this.store.entity.config.delete(output.entity[key].id)
                }
                break
            }
            break
          case 'contact':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.contact.set(
                  output.entity[key].id,
                  new ContactEntityStore(this.store, output.entity[key])
                )
                break
              case 2:
                if (this.store.entity.contact.has(output.entity[key].id)) {
                  this.store.entity.contact.delete(output.entity[key].id)
                }
                break
            }
            break
          case 'device':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.device.set(
                  output.entity[key].id,
                  new DeviceEntityStore(this.store, output.entity[key])
                )
                break
              case 2:
                if (this.store.entity.device.has(output.entity[key].id)) {
                  this.store.entity.device.delete(output.entity[key].id)
                }
                break
            }
            break
          case 'conversation':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.conversation.set(
                  output.entity[key].id,
                  new ConversationEntityStore(this.store, output.entity[key])
                )
                break
              case 2:
                if (this.store.entity.conversation.has(output.entity[key].id)) {
                  this.store.entity.conversation.delete(output.entity[key].id)
                }
                break
            }
            break
          case 'conversationMember':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.conversationMember.set(
                  output.entity[key].id,
                  new ConversationMemberEntityStore(
                    this.store,
                    output.entity[key]
                  )
                )
                break
              case 2:
                if (
                  this.store.entity.conversationMember.has(
                    output.entity[key].id
                  )
                ) {
                  this.store.entity.conversationMember.delete(
                    output.entity[key].id
                  )
                }
                break
            }
            break
          case 'event':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.event.set(
                  output.entity[key].id,
                  new EventEntityStore(this.store, output.entity[key])
                )
                break
              case 2:
                if (this.store.entity.event.has(output.entity[key].id)) {
                  this.store.entity.event.delete(output.entity[key].id)
                }
                break
            }
            break
          case 'devicePushConfig':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.devicePushConfig.set(
                  output.entity[key].id,
                  new DevicePushConfigEntityStore(
                    this.store,
                    output.entity[key]
                  )
                )
                break
              case 2:
                if (
                  this.store.entity.devicePushConfig.has(output.entity[key].id)
                ) {
                  this.store.entity.devicePushConfig.delete(
                    output.entity[key].id
                  )
                }
                break
            }
            break
          case 'devicePushIdentifier':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.devicePushIdentifier.set(
                  output.entity[key].id,
                  new DevicePushIdentifierEntityStore(
                    this.store,
                    output.entity[key]
                  )
                )
                break
              case 2:
                if (
                  this.store.entity.devicePushIdentifier.has(
                    output.entity[key].id
                  )
                ) {
                  this.store.entity.devicePushIdentifier.delete(
                    output.entity[key].id
                  )
                }
                break
            }
            break
          case 'eventDispatch':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.eventDispatch.set(
                  output.entity[key].id,
                  new EventDispatchEntityStore(this.store, output.entity[key])
                )
                break
              case 2:
                if (
                  this.store.entity.eventDispatch.has(output.entity[key].id)
                ) {
                  this.store.entity.eventDispatch.delete(output.entity[key].id)
                }
                break
            }
            break
          case 'senderAlias':
            switch (output.operation) {
              default:
              case 0:
              case 1:
                this.store.entity.senderAlias.set(
                  output.entity[key].id,
                  new SenderAliasEntityStore(this.store, output.entity[key])
                )
                break
              case 2:
                if (this.store.entity.senderAlias.has(output.entity[key].id)) {
                  this.store.entity.senderAlias.delete(output.entity[key].id)
                }
                break
            }
            break
        }
      })
    })
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  eventStream = async input => {
    const stream = await this.bridge.eventStream(input)
    stream.on('data', output => {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)
    })
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  eventList = async input => {
    const stream = await this.bridge.eventList(input)
    stream.on('data', output => {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)
    })
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  eventUnseen = async input => {
    const stream = await this.bridge.eventUnseen(input)
    stream.on('data', output => {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)
    })
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  getEvent = async input => {
    let output = await this.bridge.getEvent(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return output
  }

  eventSeen = async input => {
    let output = await this.bridge.eventSeen(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return output
  }

  eventRetry = async input => {
    let output = await this.bridge.eventRetry(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return output
  }

  configPublic = async input => {
    let output = await this.bridge.configPublic(input)

    output = new ConfigEntityStore(this.store, output)
    this.store.entity.config.set(output.id, output)

    return output
  }

  configUpdate = async input => {
    let output = await this.bridge.configUpdate(input)

    output = new ConfigEntityStore(this.store, output)
    this.store.entity.config.set(output.id, output)

    return output
  }

  contactRequest = async input => {
    let output = await this.bridge.contactRequest(input)

    output = new ContactEntityStore(this.store, output)
    this.store.entity.contact.set(output.id, output)

    return output
  }

  contactAcceptRequest = async input => {
    let output = await this.bridge.contactAcceptRequest(input)

    output = new ContactEntityStore(this.store, output)
    this.store.entity.contact.set(output.id, output)

    return output
  }

  contactRemove = async input => {
    let output = await this.bridge.contactRemove(input)

    if (this.store.entity.contact.has(output.id)) {
      this.store.entity.contact.delete(output.id)
    }

    return output
  }

  contactUpdate = async input => {
    let output = await this.bridge.contactUpdate(input)

    output = new ContactEntityStore(this.store, output)
    this.store.entity.contact.set(output.id, output)

    return output
  }

  contactList = async input => {
    const stream = await this.bridge.contactList(input)
    stream.on('data', output => {
      output = new ContactEntityStore(this.store, output)
      this.store.entity.contact.set(output.id, output)
    })
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  contact = async input => {
    let output = await this.bridge.contact(input)

    output = new ContactEntityStore(this.store, output)
    this.store.entity.contact.set(output.id, output)

    return output
  }

  contactCheckPublicKey = async input => {
    let output = await this.bridge.contactCheckPublicKey(input)

    return output
  }

  conversationCreate = async input => {
    let output = await this.bridge.conversationCreate(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return output
  }

  conversationUpdate = async input => {
    let output = await this.bridge.conversationUpdate(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return output
  }

  conversationList = async input => {
    const stream = await this.bridge.conversationList(input)
    stream.on('data', output => {
      output = new ConversationEntityStore(this.store, output)
      this.store.entity.conversation.set(output.id, output)
    })
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  conversationInvite = async input => {
    let output = await this.bridge.conversationInvite(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return output
  }

  conversationExclude = async input => {
    let output = await this.bridge.conversationExclude(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return output
  }

  conversationAddMessage = async input => {
    let output = await this.bridge.conversationAddMessage(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return output
  }

  conversation = async input => {
    let output = await this.bridge.conversation(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return output
  }

  conversationMember = async input => {
    let output = await this.bridge.conversationMember(input)

    output = new ConversationMemberEntityStore(this.store, output)
    this.store.entity.conversationMember.set(output.id, output)

    return output
  }

  conversationRead = async input => {
    let output = await this.bridge.conversationRead(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return output
  }

  conversationRemove = async input => {
    let output = await this.bridge.conversationRemove(input)

    if (this.store.entity.conversation.has(output.id)) {
      this.store.entity.conversation.delete(output.id)
    }

    return output
  }

  conversationLastEvent = async input => {
    let output = await this.bridge.conversationLastEvent(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return output
  }

  devicePushConfigList = async input => {
    let output = await this.bridge.devicePushConfigList(input)

    return output
  }

  devicePushConfigCreate = async input => {
    let output = await this.bridge.devicePushConfigCreate(input)

    output = new DevicePushConfigEntityStore(this.store, output)
    this.store.entity.devicePushConfig.set(output.id, output)

    return output
  }

  devicePushConfigNativeRegister = async input => {
    let output = await this.bridge.devicePushConfigNativeRegister(input)

    return output
  }

  devicePushConfigNativeUnregister = async input => {
    let output = await this.bridge.devicePushConfigNativeUnregister(input)

    return output
  }

  devicePushConfigRemove = async input => {
    let output = await this.bridge.devicePushConfigRemove(input)

    if (this.store.entity.devicePushConfig.has(output.id)) {
      this.store.entity.devicePushConfig.delete(output.id)
    }

    return output
  }

  devicePushConfigUpdate = async input => {
    let output = await this.bridge.devicePushConfigUpdate(input)

    output = new DevicePushConfigEntityStore(this.store, output)
    this.store.entity.devicePushConfig.set(output.id, output)

    return output
  }

  handleEvent = async input => {
    let output = await this.bridge.handleEvent(input)

    return output
  }

  generateFakeData = async input => {
    let output = await this.bridge.generateFakeData(input)

    return output
  }

  runIntegrationTests = async input => {
    let output = await this.bridge.runIntegrationTests(input)

    return output
  }

  debugPing = async input => {
    let output = await this.bridge.debugPing(input)

    return output
  }

  debugRequeueEvent = async input => {
    let output = await this.bridge.debugRequeueEvent(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return output
  }

  debugRequeueAll = async input => {
    let output = await this.bridge.debugRequeueAll(input)

    return output
  }

  deviceInfos = async input => {
    let output = await this.bridge.deviceInfos(input)

    return output
  }

  appVersion = async input => {
    let output = await this.bridge.appVersion(input)

    return output
  }

  peers = async input => {
    let output = await this.bridge.peers(input)

    return output
  }

  protocols = async input => {
    let output = await this.bridge.protocols(input)

    return output
  }

  logStream = async input => {
    const stream = await this.bridge.logStream(input)
    stream.on('data', output => {})
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  logfileList = async input => {
    const stream = await this.bridge.logfileList(input)
    stream.on('data', output => {})
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  logfileRead = async input => {
    const stream = await this.bridge.logfileRead(input)
    stream.on('data', output => {})
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  testLogBackgroundError = async input => {
    let output = await this.bridge.testLogBackgroundError(input)

    return output
  }

  testLogBackgroundWarn = async input => {
    let output = await this.bridge.testLogBackgroundWarn(input)

    return output
  }

  testLogBackgroundDebug = async input => {
    let output = await this.bridge.testLogBackgroundDebug(input)

    return output
  }

  testPanic = async input => {
    let output = await this.bridge.testPanic(input)

    return output
  }

  testError = async input => {
    let output = await this.bridge.testError(input)

    return output
  }

  monitorBandwidth = async input => {
    const stream = await this.bridge.monitorBandwidth(input)
    stream.on('data', output => {})
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  monitorPeers = async input => {
    const stream = await this.bridge.monitorPeers(input)
    stream.on('data', output => {})
    const copyStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    stream.pipe(copyStream)
    return copyStream
  }

  getListenAddrs = async input => {
    let output = await this.bridge.getListenAddrs(input)

    return output
  }

  getListenInterfaceAddrs = async input => {
    let output = await this.bridge.getListenInterfaceAddrs(input)

    return output
  }

  libp2PPing = async input => {
    let output = await this.bridge.libp2PPing(input)

    return output
  }
}

export class Store {
  constructor (bridge) {
    this.bridge = bridge

    this.entity = {
      config: observable.map({}, { deep: false }),
      contact: observable.map({}, { deep: false }),
      device: observable.map({}, { deep: false }),
      conversation: observable.map({}, { deep: false }),
      conversationMember: observable.map({}, { deep: false }),
      event: observable.map({}, { deep: false }),
      devicePushConfig: observable.map({}, { deep: false }),
      devicePushIdentifier: observable.map({}, { deep: false }),
      eventDispatch: observable.map({}, { deep: false }),
      senderAlias: observable.map({}, { deep: false }),
    }

    this.node = {
      service:
        this.bridge.node.service &&
        new NodeServiceStore(this, this.bridge.node.service),
    }
  }
}
