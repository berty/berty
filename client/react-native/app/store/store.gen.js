import { observable, action, computed } from 'mobx'
import EntityStore from './entity'
import hash from 'object-hash'

export class ConfigEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @computed get myself () {
    return this.store.entity.contact.get(this.myselfId)
  }
  set myself (myself) {
    this.store.entity.contact.set(this.myselfId, myself)
  }
  @observable myselfId = null
  @computed get currentDevice () {
    return this.store.entity.device.get(this.currentDeviceId)
  }
  set currentDevice (currentDevice) {
    this.store.entity.device.set(this.currentDeviceId, currentDevice)
  }
  @observable currentDeviceId = null
  @observable cryptoParams = null
  @observable pushRelayPubkeyApns = null
  @observable pushRelayPubkeyFcm = null
  @observable notificationsEnabled = null
  @observable notificationsPreviews = null
  @observable debugNotificationVerbosity = null
}
export class ContactEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable sigchain = null
  @observable status = null
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
  @observable displayName = null
  @observable displayStatus = null
  @observable overrideDisplayName = null
  @observable overrideDisplayStatus = null
}
export class DeviceEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable name = null
  @observable status = null
  @observable apiVersion = null
  @observable contactId = null
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

  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable readAt = null
  @observable wroteAt = null
  @observable title = null
  @observable topic = null
  @observable infos = null
  @observable kind = null
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

  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable readAt = null
  @observable wroteAt = null
  @observable status = null
  @computed get contact () {
    return this.store.entity.contact.get(this.contactId)
  }
  set contact (contact) {
    this.store.entity.contact.set(this.contactId, contact)
  }
  @observable conversationId = null
  @observable contactId = null
}
export class EventEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  @observable id = null
  @observable sourceDeviceId = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable sentAt = null
  @observable receivedAt = null
  @observable ackedAt = null
  @observable direction = null
  @observable apiVersion = null
  @observable kind = null
  @observable attributes = null
  @observable seenAt = null
  @observable ackStatus = null
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
  @observable sourceContactId = null
  @observable targetType = null
  @observable targetAddr = null
  @observable errProxy = null
  @observable metadata = []
}
export class DevicePushConfigEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable deviceId = null
  @observable pushType = null
  @observable pushId = null
  @observable relayPubkey = null
}
export class DevicePushIdentifierEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable pushInfo = null
  @observable relayPubkey = null
  @observable deviceId = null
}
export class EventDispatchEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  @observable eventId = null
  @observable deviceId = null
  @observable contactId = null
  @observable sentAt = null
  @observable ackedAt = null
  @observable seenAt = null
  @observable ackMedium = null
  @observable seenMedium = null
  @observable retryBackoff = null
  @observable sendErrorMessage = null
  @observable sendErrorDetail = null
}
export class SenderAliasEntityStore {
  store = null

  constructor (store, data) {
    this.store = store
    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable status = null
  @observable originDeviceId = null
  @observable contactId = null
  @observable conversationId = null
  @observable aliasIdentifier = null
  @observable used = null
}

export class NodeServiceStore {
  constructor (store, bridge) {
    this.store = store
    this.bridge = bridge
    this.commitLogStream({})
  }

  id = async input => {
    let output = await this.bridge.id(input)

    return this.store.entity.peer.get(output.id)
  }

  commitLogStream = async function * (input) {
    for await (let output of await this.bridge.commitLogStream(input)) {
      Object.keys(output.entity).forEach(key => {
        if (output.entity[key] == null) {
          return
        }
        switch (key) {
          case 'config': {
            output.entity[key] = new ConfigEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.config.set(
                  output.entity[key].id,
                  output.entity[key]
                )
              case 2:
                if (this.store.entity.config.has(output.entity[key].id)) {
                  this.store.entity.config.delete(output.entity[key].id)
                }
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
          case 'contact': {
            output.entity[key] = new ContactEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.contact.set(
                  output.entity[key].id,
                  output.entity[key]
                )
              case 2:
                if (this.store.entity.contact.has(output.entity[key].id)) {
                  this.store.entity.contact.delete(output.entity[key].id)
                }
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
          case 'device': {
            output.entity[key] = new DeviceEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.device.set(
                  output.entity[key].id,
                  output.entity[key]
                )
              case 2:
                if (this.store.entity.device.has(output.entity[key].id)) {
                  this.store.entity.device.delete(output.entity[key].id)
                }
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
          case 'conversation': {
            output.entity[key] = new ConversationEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.conversation.set(
                  output.entity[key].id,
                  output.entity[key]
                )
              case 2:
                if (this.store.entity.conversation.has(output.entity[key].id)) {
                  this.store.entity.conversation.delete(output.entity[key].id)
                }
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
          case 'conversationMember': {
            output.entity[key] = new ConversationMemberEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.conversationMember.set(
                  output.entity[key].id,
                  output.entity[key]
                )
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
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
          case 'event': {
            output.entity[key] = new EventEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.event.set(
                  output.entity[key].id,
                  output.entity[key]
                )
              case 2:
                if (this.store.entity.event.has(output.entity[key].id)) {
                  this.store.entity.event.delete(output.entity[key].id)
                }
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
          case 'devicePushConfig': {
            output.entity[key] = new DevicePushConfigEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.devicePushConfig.set(
                  output.entity[key].id,
                  output.entity[key]
                )
              case 2:
                if (
                  this.store.entity.devicePushConfig.has(output.entity[key].id)
                ) {
                  this.store.entity.devicePushConfig.delete(
                    output.entity[key].id
                  )
                }
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
          case 'devicePushIdentifier': {
            output.entity[key] = new DevicePushIdentifierEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.devicePushIdentifier.set(
                  output.entity[key].id,
                  output.entity[key]
                )
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
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
          case 'eventDispatch': {
            output.entity[key] = new EventDispatchEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.eventDispatch.set(
                  output.entity[key].id,
                  output.entity[key]
                )
              case 2:
                if (
                  this.store.entity.eventDispatch.has(output.entity[key].id)
                ) {
                  this.store.entity.eventDispatch.delete(output.entity[key].id)
                }
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
          case 'senderAlias': {
            output.entity[key] = new SenderAliasEntityStore(
              this.store,
              output.entity[key]
            )
            switch (output.operation) {
              case 0:
              case 1:
                this.store.entity.senderAlias.set(
                  output.entity[key].id,
                  output.entity[key]
                )
              case 2:
                if (this.store.entity.senderAlias.has(output.entity[key].id)) {
                  this.store.entity.senderAlias.delete(output.entity[key].id)
                }
              default:
                console.error('commitLog: operation not defined for entity')
            }
          }
        }
      })

      yield this.store.entity.commitLog.get(output.id)
    }
  }.bind(this)

  eventStream = async function * (input) {
    for await (let output of await this.bridge.eventStream(input)) {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)

      yield this.store.entity.event.get(output.id)
    }
  }.bind(this)

  eventList = async function * (input) {
    for await (let output of await this.bridge.eventList(input)) {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)

      yield this.store.entity.event.get(output.id)
    }
  }.bind(this)

  eventUnseen = async function * (input) {
    for await (let output of await this.bridge.eventUnseen(input)) {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)

      yield this.store.entity.event.get(output.id)
    }
  }.bind(this)

  getEvent = async input => {
    let output = await this.bridge.getEvent(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return this.store.entity.event.get(output.id)
  }

  eventSeen = async input => {
    let output = await this.bridge.eventSeen(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return this.store.entity.event.get(output.id)
  }

  eventRetry = async input => {
    let output = await this.bridge.eventRetry(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return this.store.entity.event.get(output.id)
  }

  configPublic = async input => {
    let output = await this.bridge.configPublic(input)

    output = new ConfigEntityStore(this.store, output)
    this.store.entity.config.set(output.id, output)

    return this.store.entity.config.get(output.id)
  }

  configUpdate = async input => {
    let output = await this.bridge.configUpdate(input)

    output = new ConfigEntityStore(this.store, output)
    this.store.entity.config.set(output.id, output)

    return this.store.entity.config.get(output.id)
  }

  contactRequest = async input => {
    let output = await this.bridge.contactRequest(input)

    output = new ContactEntityStore(this.store, output)
    this.store.entity.contact.set(output.id, output)

    return this.store.entity.contact.get(output.id)
  }

  contactAcceptRequest = async input => {
    let output = await this.bridge.contactAcceptRequest(input)

    output = new ContactEntityStore(this.store, output)
    this.store.entity.contact.set(output.id, output)

    return this.store.entity.contact.get(output.id)
  }

  contactRemove = async input => {
    let output = await this.bridge.contactRemove(input)

    if (this.store.entity.contact.has(output.id)) {
      this.store.entity.contact.delete(output.id)
    }

    return this.store.entity.contact.get(output.id)
  }

  contactUpdate = async input => {
    let output = await this.bridge.contactUpdate(input)

    output = new ContactEntityStore(this.store, output)
    this.store.entity.contact.set(output.id, output)

    return this.store.entity.contact.get(output.id)
  }

  contactList = async function * (input) {
    for await (let output of await this.bridge.contactList(input)) {
      output = new ContactEntityStore(this.store, output)
      this.store.entity.contact.set(output.id, output)

      yield this.store.entity.contact.get(output.id)
    }
  }.bind(this)

  contact = async input => {
    let output = await this.bridge.contact(input)

    output = new ContactEntityStore(this.store, output)
    this.store.entity.contact.set(output.id, output)

    return this.store.entity.contact.get(output.id)
  }

  contactCheckPublicKey = async input => {
    let output = await this.bridge.contactCheckPublicKey(input)

    return this.store.entity.bool.get(output.id)
  }

  conversationCreate = async input => {
    let output = await this.bridge.conversationCreate(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return this.store.entity.conversation.get(output.id)
  }

  conversationUpdate = async input => {
    let output = await this.bridge.conversationUpdate(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return this.store.entity.conversation.get(output.id)
  }

  conversationList = async function * (input) {
    for await (let output of await this.bridge.conversationList(input)) {
      output = new ConversationEntityStore(this.store, output)
      this.store.entity.conversation.set(output.id, output)

      yield this.store.entity.conversation.get(output.id)
    }
  }.bind(this)

  conversationInvite = async input => {
    let output = await this.bridge.conversationInvite(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return this.store.entity.conversation.get(output.id)
  }

  conversationExclude = async input => {
    let output = await this.bridge.conversationExclude(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return this.store.entity.conversation.get(output.id)
  }

  conversationAddMessage = async input => {
    let output = await this.bridge.conversationAddMessage(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return this.store.entity.event.get(output.id)
  }

  conversation = async input => {
    let output = await this.bridge.conversation(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return this.store.entity.conversation.get(output.id)
  }

  conversationMember = async input => {
    let output = await this.bridge.conversationMember(input)

    output = new ConversationMemberEntityStore(this.store, output)
    this.store.entity.conversationMember.set(output.id, output)

    return this.store.entity.conversationMember.get(output.id)
  }

  conversationRead = async input => {
    let output = await this.bridge.conversationRead(input)

    output = new ConversationEntityStore(this.store, output)
    this.store.entity.conversation.set(output.id, output)

    return this.store.entity.conversation.get(output.id)
  }

  conversationRemove = async input => {
    let output = await this.bridge.conversationRemove(input)

    if (this.store.entity.conversation.has(output.id)) {
      this.store.entity.conversation.delete(output.id)
    }

    return this.store.entity.conversation.get(output.id)
  }

  conversationLastEvent = async input => {
    let output = await this.bridge.conversationLastEvent(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return this.store.entity.event.get(output.id)
  }

  devicePushConfigList = async input => {
    let output = await this.bridge.devicePushConfigList(input)

    return this.store.entity.devicePushConfigListOutput.get(output.id)
  }

  devicePushConfigCreate = async input => {
    let output = await this.bridge.devicePushConfigCreate(input)

    output = new DevicePushConfigEntityStore(this.store, output)
    this.store.entity.devicePushConfig.set(output.id, output)

    return this.store.entity.devicePushConfig.get(output.id)
  }

  devicePushConfigNativeRegister = async input => {
    let output = await this.bridge.devicePushConfigNativeRegister(input)

    return this.store.entity.void.get(output.id)
  }

  devicePushConfigNativeUnregister = async input => {
    let output = await this.bridge.devicePushConfigNativeUnregister(input)

    return this.store.entity.void.get(output.id)
  }

  devicePushConfigRemove = async input => {
    let output = await this.bridge.devicePushConfigRemove(input)

    if (this.store.entity.devicePushConfig.has(output.id)) {
      this.store.entity.devicePushConfig.delete(output.id)
    }

    return this.store.entity.devicePushConfig.get(output.id)
  }

  devicePushConfigUpdate = async input => {
    let output = await this.bridge.devicePushConfigUpdate(input)

    output = new DevicePushConfigEntityStore(this.store, output)
    this.store.entity.devicePushConfig.set(output.id, output)

    return this.store.entity.devicePushConfig.get(output.id)
  }

  handleEvent = async input => {
    let output = await this.bridge.handleEvent(input)

    return this.store.entity.void.get(output.id)
  }

  generateFakeData = async input => {
    let output = await this.bridge.generateFakeData(input)

    return this.store.entity.void.get(output.id)
  }

  runIntegrationTests = async input => {
    let output = await this.bridge.runIntegrationTests(input)

    return this.store.entity.integrationTestOutput.get(output.id)
  }

  debugPing = async input => {
    let output = await this.bridge.debugPing(input)

    return this.store.entity.void.get(output.id)
  }

  debugRequeueEvent = async input => {
    let output = await this.bridge.debugRequeueEvent(input)

    output = new EventEntityStore(this.store, output)
    this.store.entity.event.set(output.id, output)

    return this.store.entity.event.get(output.id)
  }

  debugRequeueAll = async input => {
    let output = await this.bridge.debugRequeueAll(input)

    return this.store.entity.void.get(output.id)
  }

  deviceInfos = async input => {
    let output = await this.bridge.deviceInfos(input)

    return this.store.entity.deviceInfos.get(output.id)
  }

  appVersion = async input => {
    let output = await this.bridge.appVersion(input)

    return this.store.entity.appVersionOutput.get(output.id)
  }

  peers = async input => {
    let output = await this.bridge.peers(input)

    return this.store.entity.peers.get(output.id)
  }

  protocols = async input => {
    let output = await this.bridge.protocols(input)

    return this.store.entity.protocolsOutput.get(output.id)
  }

  logStream = async function * (input) {
    for await (let output of await this.bridge.logStream(input)) {
      yield this.store.entity.logEntry.get(output.id)
    }
  }.bind(this)

  logfileList = async function * (input) {
    for await (let output of await this.bridge.logfileList(input)) {
      yield this.store.entity.logfileEntry.get(output.id)
    }
  }.bind(this)

  logfileRead = async function * (input) {
    for await (let output of await this.bridge.logfileRead(input)) {
      yield this.store.entity.logEntry.get(output.id)
    }
  }.bind(this)

  testLogBackgroundError = async input => {
    let output = await this.bridge.testLogBackgroundError(input)

    return this.store.entity.void.get(output.id)
  }

  testLogBackgroundWarn = async input => {
    let output = await this.bridge.testLogBackgroundWarn(input)

    return this.store.entity.void.get(output.id)
  }

  testLogBackgroundDebug = async input => {
    let output = await this.bridge.testLogBackgroundDebug(input)

    return this.store.entity.void.get(output.id)
  }

  testPanic = async input => {
    let output = await this.bridge.testPanic(input)

    return this.store.entity.void.get(output.id)
  }

  testError = async input => {
    let output = await this.bridge.testError(input)

    return this.store.entity.void.get(output.id)
  }

  monitorBandwidth = async function * (input) {
    for await (let output of await this.bridge.monitorBandwidth(input)) {
      yield this.store.entity.bandwidthStats.get(output.id)
    }
  }.bind(this)

  monitorPeers = async function * (input) {
    for await (let output of await this.bridge.monitorPeers(input)) {
      yield this.store.entity.peer.get(output.id)
    }
  }.bind(this)

  getListenAddrs = async input => {
    let output = await this.bridge.getListenAddrs(input)

    return this.store.entity.listAddrs.get(output.id)
  }

  getListenInterfaceAddrs = async input => {
    let output = await this.bridge.getListenInterfaceAddrs(input)

    return this.store.entity.listAddrs.get(output.id)
  }

  libp2PPing = async input => {
    let output = await this.bridge.libp2PPing(input)

    return this.store.entity.bool.get(output.id)
  }
}

export class Store {
  constructor (bridge) {
    this.bridge = bridge

    this.entity = {
      config: observable.map({}, { deep: true }),
      contact: observable.map({}, { deep: true }),
      device: observable.map({}, { deep: true }),
      conversation: observable.map({}, { deep: true }),
      conversationMember: observable.map({}, { deep: true }),
      event: observable.map({}, { deep: true }),
      devicePushConfig: observable.map({}, { deep: true }),
      devicePushIdentifier: observable.map({}, { deep: true }),
      eventDispatch: observable.map({}, { deep: true }),
      senderAlias: observable.map({}, { deep: true }),
    }

    this.node = {
      service:
        this.bridge.node.service &&
        new NodeServiceStore(this, this.bridge.node.service),
    }
  }
}
