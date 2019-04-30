import { observable, action, computed, flow } from 'mobx'
import EntityStore from './entity'
import ServiceStore from './service'

export class Config {
  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @computed get myself () {
    return this.store.entity.contact.map[this.myselfId]
  }
  @observable myselfId = null
  @computed get currentDevice () {
    return this.store.entity.device.map[this.currentDeviceId]
  }
  @observable currentDeviceId = null
  @observable cryptoParams = null
  @observable pushRelayPubkeyApns = null
  @observable pushRelayPubkeyFcm = null
  @observable notificationsEnabled = null
  @observable notificationsPreviews = null
  @observable debugNotificationVerbosity = null
}

export class Contact {
  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable sigchain = null
  @observable status = null
  @computed get devices () {
    return Object.values(this.store.entity.device).filter(
      _ => _.contactId === this.id
    )
  }
  @observable displayName = null
  @observable displayStatus = null
  @observable overrideDisplayName = null
  @observable overrideDisplayStatus = null
}

export class Device {
  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable name = null
  @observable status = null
  @observable apiVersion = null
  @observable contactId = null
  @computed get pushIdentifiers () {
    return Object.values(this.store.entity.devicePushIdentifier).filter(
      _ => _.deviceId === this.id
    )
  }
}

export class Conversation {
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
    return Object.values(this.store.entity.conversationMember).filter(
      _ => _.conversationId === this.id
    )
  }
}

export class ConversationMember {
  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable readAt = null
  @observable wroteAt = null
  @observable status = null
  @computed get contact () {
    return this.store.entity.contact.map[this.contactId]
  }
  @observable conversationId = null
  @observable contactId = null
}

export class Event {
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
    return Object.values(this.store.entity.eventDispatch).filter(
      _ => _.eventId === this.id
    )
  }
  @observable sourceContactId = null
  @observable targetType = null
  @observable targetAddr = null
  @observable errProxy = null
  @observable metadata = []
}

export class DevicePushConfig {
  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable deviceId = null
  @observable pushType = null
  @observable pushId = null
  @observable relayPubkey = null
}

export class DevicePushIdentifier {
  @observable id = null
  @observable createdAt = null
  @observable updatedAt = null
  @observable pushInfo = null
  @observable relayPubkey = null
  @observable deviceId = null
}

export class SenderAlias {
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

export class NodeServiceStore extends ServiceStore {
  constructor (store, bridge) {
    super(store, bridge, 'NodeServiceStore')
  }

  @action async id (input) {
    return this.bridge.id(input)
  }

  commitLogStream = flow(async function * (input) {
    for await (const output of this.bridge.commitLogStream(input)) {
      Object.keys(output.entity).forEach(key => {
        if (output.entity !== null) {
          switch (output.operation) {
            case 0:
              this.store[`${key}Store`].create(output.entity)
            case 1:
              this.store[`${key}Store`].update(output.entity)
            case 3:
              this.store[`${key}Store`].delete(output.entity)
            default:
              throw new Error('operation is not defined')
          }
        }
      })
      // See if yield block execution of stream
      yield output
    }
  })

  eventStream = flow(async function * (input) {
    for await (const output of this.bridge.eventStream(input)) {
      if (this.store.entity.event.map[output.id]) {
        this.store.entity.event.update(output)
      } else {
        this.store.entity.event.add(output)
      }
      // See if yield block execution of stream
      yield output
    }
  })

  eventList = flow(async function * (input) {
    for await (const output of this.bridge.eventList(input)) {
      if (this.store.entity.event.map[output.id]) {
        this.store.entity.event.update(output)
      } else {
        this.store.entity.event.add(output)
      }
      // See if yield block execution of stream
      yield output
    }
  })

  eventUnseen = flow(async function * (input) {
    for await (const output of this.bridge.eventUnseen(input)) {
      if (this.store.entity.event.map[output.id]) {
        this.store.entity.event.update(output)
      } else {
        this.store.entity.event.add(output)
      }
      // See if yield block execution of stream
      yield output
    }
  })

  @action async getEvent (input) {
    return this.bridge.getEvent(input)
  }

  @action async eventSeen (input) {
    return this.bridge.eventSeen(input)
  }

  @action async configPublic (input) {
    return this.bridge.configPublic(input)
  }

  @action async configUpdate (input) {
    return this.bridge.configUpdate(input)
  }

  @action async contactRequest (input) {
    return this.bridge.contactRequest(input)
  }

  @action async contactAcceptRequest (input) {
    return this.bridge.contactAcceptRequest(input)
  }

  @action async contactRemove (input) {
    return this.bridge.contactRemove(input)
  }

  @action async contactUpdate (input) {
    return this.bridge.contactUpdate(input)
  }

  contactList = flow(async function * (input) {
    for await (const output of this.bridge.contactList(input)) {
      if (this.store.entity.contact.map[output.id]) {
        this.store.entity.contact.update(output)
      } else {
        this.store.entity.contact.add(output)
      }
      // See if yield block execution of stream
      yield output
    }
  })

  @action async contact (input) {
    return this.bridge.contact(input)
  }

  @action async contactCheckPublicKey (input) {
    return this.bridge.contactCheckPublicKey(input)
  }

  @action async conversationCreate (input) {
    return this.bridge.conversationCreate(input)
  }

  @action async conversationUpdate (input) {
    return this.bridge.conversationUpdate(input)
  }

  conversationList = flow(async function * (input) {
    for await (const output of this.bridge.conversationList(input)) {
      if (this.store.entity.conversation.map[output.id]) {
        this.store.entity.conversation.update(output)
      } else {
        this.store.entity.conversation.add(output)
      }
      // See if yield block execution of stream
      yield output
    }
  })

  @action async conversationInvite (input) {
    return this.bridge.conversationInvite(input)
  }

  @action async conversationExclude (input) {
    return this.bridge.conversationExclude(input)
  }

  @action async conversationAddMessage (input) {
    return this.bridge.conversationAddMessage(input)
  }

  @action async conversation (input) {
    return this.bridge.conversation(input)
  }

  @action async conversationMember (input) {
    return this.bridge.conversationMember(input)
  }

  @action async conversationRead (input) {
    return this.bridge.conversationRead(input)
  }

  @action async conversationRemove (input) {
    return this.bridge.conversationRemove(input)
  }

  @action async conversationLastEvent (input) {
    return this.bridge.conversationLastEvent(input)
  }

  @action async devicePushConfigList (input) {
    return this.bridge.devicePushConfigList(input)
  }

  @action async devicePushConfigCreate (input) {
    return this.bridge.devicePushConfigCreate(input)
  }

  @action async devicePushConfigNativeRegister (input) {
    return this.bridge.devicePushConfigNativeRegister(input)
  }

  @action async devicePushConfigNativeUnregister (input) {
    return this.bridge.devicePushConfigNativeUnregister(input)
  }

  @action async devicePushConfigRemove (input) {
    return this.bridge.devicePushConfigRemove(input)
  }

  @action async devicePushConfigUpdate (input) {
    return this.bridge.devicePushConfigUpdate(input)
  }

  @action async handleEvent (input) {
    return this.bridge.handleEvent(input)
  }

  @action async generateFakeData (input) {
    return this.bridge.generateFakeData(input)
  }

  @action async runIntegrationTests (input) {
    return this.bridge.runIntegrationTests(input)
  }

  @action async debugPing (input) {
    return this.bridge.debugPing(input)
  }

  @action async debugRequeueEvent (input) {
    return this.bridge.debugRequeueEvent(input)
  }

  @action async debugRequeueAll (input) {
    return this.bridge.debugRequeueAll(input)
  }

  @action async deviceInfos (input) {
    return this.bridge.deviceInfos(input)
  }

  @action async appVersion (input) {
    return this.bridge.appVersion(input)
  }

  @action async peers (input) {
    return this.bridge.peers(input)
  }

  @action async protocols (input) {
    return this.bridge.protocols(input)
  }

  logStream = flow(async function * (input) {
    for await (const output of this.bridge.logStream(input)) {
      // See if yield block execution of stream
      yield output
    }
  })

  logfileList = flow(async function * (input) {
    for await (const output of this.bridge.logfileList(input)) {
      // See if yield block execution of stream
      yield output
    }
  })

  logfileRead = flow(async function * (input) {
    for await (const output of this.bridge.logfileRead(input)) {
      // See if yield block execution of stream
      yield output
    }
  })

  @action async testLogBackgroundError (input) {
    return this.bridge.testLogBackgroundError(input)
  }

  @action async testLogBackgroundWarn (input) {
    return this.bridge.testLogBackgroundWarn(input)
  }

  @action async testLogBackgroundDebug (input) {
    return this.bridge.testLogBackgroundDebug(input)
  }

  @action async testPanic (input) {
    return this.bridge.testPanic(input)
  }

  @action async testError (input) {
    return this.bridge.testError(input)
  }

  monitorBandwidth = flow(async function * (input) {
    for await (const output of this.bridge.monitorBandwidth(input)) {
      // See if yield block execution of stream
      yield output
    }
  })

  monitorPeers = flow(async function * (input) {
    for await (const output of this.bridge.monitorPeers(input)) {
      // See if yield block execution of stream
      yield output
    }
  })

  @action async getListenAddrs (input) {
    return this.bridge.getListenAddrs(input)
  }

  @action async getListenInterfaceAddrs (input) {
    return this.bridge.getListenInterfaceAddrs(input)
  }

  @action async libp2PPing (input) {
    return this.bridge.libp2PPing(input)
  }
}

export class Store {
  constructor (bridge) {
    this.bridge = bridge
  }

  entity = {
    config: new EntityStore(this, Config),
    contact: new EntityStore(this, Contact),
    device: new EntityStore(this, Device),
    conversation: new EntityStore(this, Conversation),
    conversationMember: new EntityStore(this, ConversationMember),
    event: new EntityStore(this, Event),
    devicePushConfig: new EntityStore(this, DevicePushConfig),
    devicePushIdentifier: new EntityStore(this, DevicePushIdentifier),
    senderAlias: new EntityStore(this, SenderAlias),
  }

  service = {
    node: new NodeServiceStore(this, this.bridge),
  }
}
