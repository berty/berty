import { observable, computed } from 'mobx'
import Stream from 'stream'
import objectHash from 'object-hash'
import Mutex from 'await-mutex'

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
  set myself (_) {
    if (this.store.entity.contact.has(_.id)) {
      const entity = this.store.entity.contact.get(_.id)
      Object.keys(_).forEach(k => {
        _[k] = entity[k]
      })
    } else {
      this.store.entity.contact.set(_.id, new ContactEntityStore(this.store, _))
    }
  }
  @observable myselfId = null
  @computed get currentDevice () {
    return this.store.entity.device.get(this.currentDeviceId)
  }
  set currentDevice (_) {
    if (this.store.entity.device.has(_.id)) {
      const entity = this.store.entity.device.get(_.id)
      Object.keys(_).forEach(k => {
        _[k] = entity[k]
      })
    } else {
      this.store.entity.device.set(_.id, new DeviceEntityStore(this.store, _))
    }
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
    const devices = []
    for (const [, _] of this.store.entity.device) {
      if (_.contactId === this.id) {
        devices.push(_)
      }
    }
    return devices
  }
  set devices (_) {
    _.forEach(_ => {
      if (this.store.entity.device.has(_.id)) {
        const entity = this.store.entity.device.get(_.id)
        Object.keys(_).forEach(k => {
          _[k] = entity[k]
        })
      } else {
        this.store.entity.device.set(_.id, new DeviceEntityStore(this.store, _))
      }
    })
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
    const pushIdentifiers = []
    for (const [, _] of this.store.entity.devicePushIdentifier) {
      if (_.deviceId === this.id) {
        pushIdentifiers.push(_)
      }
    }
    return pushIdentifiers
  }
  set pushIdentifiers (_) {
    _.forEach(_ => {
      if (this.store.entity.devicePushIdentifier.has(_.id)) {
        const entity = this.store.entity.devicePushIdentifier.get(_.id)
        Object.keys(_).forEach(k => {
          _[k] = entity[k]
        })
      } else {
        this.store.entity.devicePushIdentifier.set(
          _.id,
          new DevicePushIdentifierEntityStore(this.store, _)
        )
      }
    })
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
    const members = []
    for (const [, _] of this.store.entity.conversationMember) {
      if (_.conversationId === this.id) {
        members.push(_)
      }
    }
    return members
  }
  set members (_) {
    _.forEach(_ => {
      if (this.store.entity.conversationMember.has(_.id)) {
        const entity = this.store.entity.conversationMember.get(_.id)
        Object.keys(_).forEach(k => {
          _[k] = entity[k]
        })
      } else {
        this.store.entity.conversationMember.set(
          _.id,
          new ConversationMemberEntityStore(this.store, _)
        )
      }
    })
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
  set contact (_) {
    if (this.store.entity.contact.has(_.id)) {
      const entity = this.store.entity.contact.get(_.id)
      Object.keys(_).forEach(k => {
        _[k] = entity[k]
      })
    } else {
      this.store.entity.contact.set(_.id, new ContactEntityStore(this.store, _))
    }
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
    const dispatches = []
    for (const [, _] of this.store.entity.eventDispatch) {
      if (_.eventId === this.id) {
        dispatches.push(_)
      }
    }
    return dispatches
  }
  set dispatches (_) {
    _.forEach(_ => {
      if (this.store.entity.eventDispatch.has(_.id)) {
        const entity = this.store.entity.eventDispatch.get(_.id)
        Object.keys(_).forEach(k => {
          _[k] = entity[k]
        })
      } else {
        this.store.entity.eventDispatch.set(
          _.id,
          new EventDispatchEntityStore(this.store, _)
        )
      }
    })
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
    this.commitLogStream({}).then(commitLog => {
      commitLog.on('data', data => {
        // init the stream
      })
    })
  }

  id = async (input = {}) => {
    let output = await this.bridge.id(input)

    return output
  }

  commitLogStreamCache = {}

  commitLogStreamMutex = {}

  commitLogStream = async (input = {}) => {
    const inputHash = objectHash(input)
    const unlock = await (
      this.commitLogStreamMutex[inputHash] ||
      (this.commitLogStreamMutex[inputHash] = new Mutex())
    ).lock()
    if (this.commitLogStreamCache[inputHash] == null) {
      this.commitLogStreamCache[inputHash] = new Stream.Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform: (output, encoding, callback) => {
          Object.keys(output.entity).forEach(key => {
            let entity = output.entity[key]
            if (entity == null) {
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
                    if (this.store.entity.config.has(entity.id)) {
                      const current = this.store.entity.config.get(entity.id)
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new ConfigEntityStore(this.store, entity)
                      this.store.entity.config.set(entity.id, entity)
                    }
                    break
                  case 2:
                    if (this.store.entity.config.has(entity.id)) {
                      entity = this.store.entity.config.get(entity.id)
                      this.store.entity.config.delete(entity.id)
                    }
                    break
                }
                break
              case 'contact':
                switch (output.operation) {
                  default:
                  case 0:
                  case 1:
                    if (this.store.entity.contact.has(entity.id)) {
                      const current = this.store.entity.contact.get(entity.id)
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new ContactEntityStore(this.store, entity)
                      this.store.entity.contact.set(entity.id, entity)
                    }
                    break
                  case 2:
                    if (this.store.entity.contact.has(entity.id)) {
                      entity = this.store.entity.contact.get(entity.id)
                      this.store.entity.contact.delete(entity.id)
                    }
                    break
                }
                break
              case 'device':
                switch (output.operation) {
                  default:
                  case 0:
                  case 1:
                    if (this.store.entity.device.has(entity.id)) {
                      const current = this.store.entity.device.get(entity.id)
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new DeviceEntityStore(this.store, entity)
                      this.store.entity.device.set(entity.id, entity)
                    }
                    break
                  case 2:
                    if (this.store.entity.device.has(entity.id)) {
                      entity = this.store.entity.device.get(entity.id)
                      this.store.entity.device.delete(entity.id)
                    }
                    break
                }
                break
              case 'conversation':
                switch (output.operation) {
                  default:
                  case 0:
                  case 1:
                    if (this.store.entity.conversation.has(entity.id)) {
                      const current = this.store.entity.conversation.get(
                        entity.id
                      )
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new ConversationEntityStore(this.store, entity)
                      this.store.entity.conversation.set(entity.id, entity)
                    }
                    break
                  case 2:
                    if (this.store.entity.conversation.has(entity.id)) {
                      entity = this.store.entity.conversation.get(entity.id)
                      this.store.entity.conversation.delete(entity.id)
                    }
                    break
                }
                break
              case 'conversationMember':
                switch (output.operation) {
                  default:
                  case 0:
                  case 1:
                    if (this.store.entity.conversationMember.has(entity.id)) {
                      const current = this.store.entity.conversationMember.get(
                        entity.id
                      )
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new ConversationMemberEntityStore(
                        this.store,
                        entity
                      )
                      this.store.entity.conversationMember.set(
                        entity.id,
                        entity
                      )
                    }
                    break
                  case 2:
                    if (this.store.entity.conversationMember.has(entity.id)) {
                      entity = this.store.entity.conversationMember.get(
                        entity.id
                      )
                      this.store.entity.conversationMember.delete(entity.id)
                    }
                    break
                }
                break
              case 'event':
                switch (output.operation) {
                  default:
                  case 0:
                  case 1:
                    if (this.store.entity.event.has(entity.id)) {
                      const current = this.store.entity.event.get(entity.id)
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new EventEntityStore(this.store, entity)
                      this.store.entity.event.set(entity.id, entity)
                    }
                    break
                  case 2:
                    if (this.store.entity.event.has(entity.id)) {
                      entity = this.store.entity.event.get(entity.id)
                      this.store.entity.event.delete(entity.id)
                    }
                    break
                }
                break
              case 'devicePushConfig':
                switch (output.operation) {
                  default:
                  case 0:
                  case 1:
                    if (this.store.entity.devicePushConfig.has(entity.id)) {
                      const current = this.store.entity.devicePushConfig.get(
                        entity.id
                      )
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new DevicePushConfigEntityStore(
                        this.store,
                        entity
                      )
                      this.store.entity.devicePushConfig.set(entity.id, entity)
                    }
                    break
                  case 2:
                    if (this.store.entity.devicePushConfig.has(entity.id)) {
                      entity = this.store.entity.devicePushConfig.get(entity.id)
                      this.store.entity.devicePushConfig.delete(entity.id)
                    }
                    break
                }
                break
              case 'devicePushIdentifier':
                switch (output.operation) {
                  default:
                  case 0:
                  case 1:
                    if (this.store.entity.devicePushIdentifier.has(entity.id)) {
                      const current = this.store.entity.devicePushIdentifier.get(
                        entity.id
                      )
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new DevicePushIdentifierEntityStore(
                        this.store,
                        entity
                      )
                      this.store.entity.devicePushIdentifier.set(
                        entity.id,
                        entity
                      )
                    }
                    break
                  case 2:
                    if (this.store.entity.devicePushIdentifier.has(entity.id)) {
                      entity = this.store.entity.devicePushIdentifier.get(
                        entity.id
                      )
                      this.store.entity.devicePushIdentifier.delete(entity.id)
                    }
                    break
                }
                break
              case 'eventDispatch':
                switch (output.operation) {
                  default:
                  case 0:
                  case 1:
                    if (this.store.entity.eventDispatch.has(entity.id)) {
                      const current = this.store.entity.eventDispatch.get(
                        entity.id
                      )
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new EventDispatchEntityStore(this.store, entity)
                      this.store.entity.eventDispatch.set(entity.id, entity)
                    }
                    break
                  case 2:
                    if (this.store.entity.eventDispatch.has(entity.id)) {
                      entity = this.store.entity.eventDispatch.get(entity.id)
                      this.store.entity.eventDispatch.delete(entity.id)
                    }
                    break
                }
                break
              case 'senderAlias':
                switch (output.operation) {
                  default:
                  case 0:
                  case 1:
                    if (this.store.entity.senderAlias.has(entity.id)) {
                      const current = this.store.entity.senderAlias.get(
                        entity.id
                      )
                      Object.keys(entity).forEach(_ => {
                        current[_] = entity[_]
                      })
                      entity = current
                    } else {
                      entity = new SenderAliasEntityStore(this.store, entity)
                      this.store.entity.senderAlias.set(entity.id, entity)
                    }
                    break
                  case 2:
                    if (this.store.entity.senderAlias.has(entity.id)) {
                      entity = this.store.entity.senderAlias.get(entity.id)
                      this.store.entity.senderAlias.delete(entity.id)
                    }
                    break
                }
                break
            }
            output.entity[key] = entity
          })

          callback(null, output)
        },
      })
      const stream = await this.bridge.commitLogStream(input)

      this.commitLogStreamCache[inputHash].setMaxListeners(30)
      stream.pipe(this.commitLogStreamCache[inputHash])
      this.commitLogStreamCache[inputHash].on('end', () => {
        delete this.commitLogStreamCache[inputHash]
      })
    }
    const passThroughStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    this.commitLogStreamCache[inputHash].pipe(passThroughStream)
    unlock()
    return passThroughStream
  }

  eventStreamCache = {}

  eventStreamMutex = {}

  eventStream = async (input = {}) => {
    const inputHash = objectHash(input)
    const unlock = await (
      this.eventStreamMutex[inputHash] ||
      (this.eventStreamMutex[inputHash] = new Mutex())
    ).lock()
    if (this.eventStreamCache[inputHash] == null) {
      this.eventStreamCache[inputHash] = new Stream.Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform: (output, encoding, callback) => {
          if (this.store.entity.event.has(output.id)) {
            const current = this.store.entity.event.get(output.id)
            Object.keys(output).forEach(_ => {
              current[_] = output[_]
            })
            output = current
          } else {
            output = new EventEntityStore(this.store, output)
            this.store.entity.event.set(output.id, output)
          }

          callback(null, output)
        },
      })
      const stream = await this.bridge.eventStream(input)

      this.eventStreamCache[inputHash].setMaxListeners(30)
      stream.pipe(this.eventStreamCache[inputHash])
      this.eventStreamCache[inputHash].on('end', () => {
        delete this.eventStreamCache[inputHash]
      })
    }
    const passThroughStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    this.eventStreamCache[inputHash].pipe(passThroughStream)
    unlock()
    return passThroughStream
  }

  eventListCache = {}

  eventList = async (input = {}) => {
    const transformStream = new Stream.Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform: (output, encoding, callback) => {
        if (this.store.entity.event.has(output.id)) {
          const current = this.store.entity.event.get(output.id)
          Object.keys(output).forEach(_ => {
            current[_] = output[_]
          })
          output = current
        } else {
          output = new EventEntityStore(this.store, output)
          this.store.entity.event.set(output.id, output)
        }

        callback(null, output)
      },
    })
    const stream = await this.bridge.eventList(input)

    stream.pipe(transformStream)
    return transformStream
  }

  eventUnseenCache = {}

  eventUnseenMutex = {}

  eventUnseen = async (input = {}) => {
    const inputHash = objectHash(input)
    const unlock = await (
      this.eventUnseenMutex[inputHash] ||
      (this.eventUnseenMutex[inputHash] = new Mutex())
    ).lock()
    if (this.eventUnseenCache[inputHash] == null) {
      this.eventUnseenCache[inputHash] = new Stream.Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform: (output, encoding, callback) => {
          if (this.store.entity.event.has(output.id)) {
            const current = this.store.entity.event.get(output.id)
            Object.keys(output).forEach(_ => {
              current[_] = output[_]
            })
            output = current
          } else {
            output = new EventEntityStore(this.store, output)
            this.store.entity.event.set(output.id, output)
          }

          callback(null, output)
        },
      })
      const stream = await this.bridge.eventUnseen(input)

      this.eventUnseenCache[inputHash].setMaxListeners(30)
      stream.pipe(this.eventUnseenCache[inputHash])
      this.eventUnseenCache[inputHash].on('end', () => {
        delete this.eventUnseenCache[inputHash]
      })
    }
    const passThroughStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    this.eventUnseenCache[inputHash].pipe(passThroughStream)
    unlock()
    return passThroughStream
  }

  getEvent = async (input = {}) => {
    let output = await this.bridge.getEvent(input)

    if (this.store.entity.event.has(output.id)) {
      const current = this.store.entity.event.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)
    }

    return output
  }

  eventSeen = async (input = {}) => {
    let output = await this.bridge.eventSeen(input)

    if (this.store.entity.event.has(output.id)) {
      const current = this.store.entity.event.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)
    }

    return output
  }

  eventRetry = async (input = {}) => {
    let output = await this.bridge.eventRetry(input)

    if (this.store.entity.event.has(output.id)) {
      const current = this.store.entity.event.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)
    }

    return output
  }

  config = async (input = {}) => {
    let output = await this.bridge.config(input)

    if (this.store.entity.config.has(output.id)) {
      const current = this.store.entity.config.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConfigEntityStore(this.store, output)
      this.store.entity.config.set(output.id, output)
    }

    return output
  }

  configPublic = async (input = {}) => {
    let output = await this.bridge.configPublic(input)

    if (this.store.entity.config.has(output.id)) {
      const current = this.store.entity.config.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConfigEntityStore(this.store, output)
      this.store.entity.config.set(output.id, output)
    }

    return output
  }

  configUpdate = async (input = {}) => {
    let output = await this.bridge.configUpdate(input)

    if (this.store.entity.config.has(output.id)) {
      const current = this.store.entity.config.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConfigEntityStore(this.store, output)
      this.store.entity.config.set(output.id, output)
    }

    return output
  }

  contactRequest = async (input = {}) => {
    let output = await this.bridge.contactRequest(input)

    if (this.store.entity.contact.has(output.id)) {
      const current = this.store.entity.contact.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ContactEntityStore(this.store, output)
      this.store.entity.contact.set(output.id, output)
    }

    return output
  }

  contactAcceptRequest = async (input = {}) => {
    let output = await this.bridge.contactAcceptRequest(input)

    if (this.store.entity.contact.has(output.id)) {
      const current = this.store.entity.contact.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ContactEntityStore(this.store, output)
      this.store.entity.contact.set(output.id, output)
    }

    return output
  }

  contactRemove = async (input = {}) => {
    let output = await this.bridge.contactRemove(input)

    if (this.store.entity.contact.has(output.id)) {
      output = this.store.entity.contact.get(output.id)
      this.store.entity.contact.delete(output.id)
    }

    return output
  }

  contactUpdate = async (input = {}) => {
    let output = await this.bridge.contactUpdate(input)

    if (this.store.entity.contact.has(output.id)) {
      const current = this.store.entity.contact.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ContactEntityStore(this.store, output)
      this.store.entity.contact.set(output.id, output)
    }

    return output
  }

  contactListCache = {}

  contactList = async (input = {}) => {
    const transformStream = new Stream.Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform: (output, encoding, callback) => {
        if (this.store.entity.contact.has(output.id)) {
          const current = this.store.entity.contact.get(output.id)
          Object.keys(output).forEach(_ => {
            current[_] = output[_]
          })
          output = current
        } else {
          output = new ContactEntityStore(this.store, output)
          this.store.entity.contact.set(output.id, output)
        }

        callback(null, output)
      },
    })
    const stream = await this.bridge.contactList(input)

    stream.pipe(transformStream)
    return transformStream
  }

  contact = async (input = {}) => {
    let output = await this.bridge.contact(input)

    if (this.store.entity.contact.has(output.id)) {
      const current = this.store.entity.contact.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ContactEntityStore(this.store, output)
      this.store.entity.contact.set(output.id, output)
    }

    return output
  }

  contactCheckPublicKey = async (input = {}) => {
    let output = await this.bridge.contactCheckPublicKey(input)

    return output
  }

  conversationCreate = async (input = {}) => {
    let output = await this.bridge.conversationCreate(input)

    if (this.store.entity.conversation.has(output.id)) {
      const current = this.store.entity.conversation.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConversationEntityStore(this.store, output)
      this.store.entity.conversation.set(output.id, output)
    }

    return output
  }

  conversationUpdate = async (input = {}) => {
    let output = await this.bridge.conversationUpdate(input)

    if (this.store.entity.conversation.has(output.id)) {
      const current = this.store.entity.conversation.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConversationEntityStore(this.store, output)
      this.store.entity.conversation.set(output.id, output)
    }

    return output
  }

  conversationListCache = {}

  conversationList = async (input = {}) => {
    const transformStream = new Stream.Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform: (output, encoding, callback) => {
        if (this.store.entity.conversation.has(output.id)) {
          const current = this.store.entity.conversation.get(output.id)
          Object.keys(output).forEach(_ => {
            current[_] = output[_]
          })
          output = current
        } else {
          output = new ConversationEntityStore(this.store, output)
          this.store.entity.conversation.set(output.id, output)
        }

        callback(null, output)
      },
    })
    const stream = await this.bridge.conversationList(input)

    stream.pipe(transformStream)
    return transformStream
  }

  conversationInvite = async (input = {}) => {
    let output = await this.bridge.conversationInvite(input)

    if (this.store.entity.conversation.has(output.id)) {
      const current = this.store.entity.conversation.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConversationEntityStore(this.store, output)
      this.store.entity.conversation.set(output.id, output)
    }

    return output
  }

  conversationExclude = async (input = {}) => {
    let output = await this.bridge.conversationExclude(input)

    if (this.store.entity.conversation.has(output.id)) {
      const current = this.store.entity.conversation.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConversationEntityStore(this.store, output)
      this.store.entity.conversation.set(output.id, output)
    }

    return output
  }

  conversationAddMessage = async (input = {}) => {
    let output = await this.bridge.conversationAddMessage(input)

    if (this.store.entity.event.has(output.id)) {
      const current = this.store.entity.event.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)
    }

    return output
  }

  conversation = async (input = {}) => {
    let output = await this.bridge.conversation(input)

    if (this.store.entity.conversation.has(output.id)) {
      const current = this.store.entity.conversation.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConversationEntityStore(this.store, output)
      this.store.entity.conversation.set(output.id, output)
    }

    return output
  }

  conversationMember = async (input = {}) => {
    let output = await this.bridge.conversationMember(input)

    if (this.store.entity.conversationMember.has(output.id)) {
      const current = this.store.entity.conversationMember.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConversationMemberEntityStore(this.store, output)
      this.store.entity.conversationMember.set(output.id, output)
    }

    return output
  }

  conversationRead = async (input = {}) => {
    let output = await this.bridge.conversationRead(input)

    if (this.store.entity.conversation.has(output.id)) {
      const current = this.store.entity.conversation.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new ConversationEntityStore(this.store, output)
      this.store.entity.conversation.set(output.id, output)
    }

    return output
  }

  conversationRemove = async (input = {}) => {
    let output = await this.bridge.conversationRemove(input)

    if (this.store.entity.conversation.has(output.id)) {
      output = this.store.entity.conversation.get(output.id)
      this.store.entity.conversation.delete(output.id)
    }

    return output
  }

  conversationLastEvent = async (input = {}) => {
    let output = await this.bridge.conversationLastEvent(input)

    if (this.store.entity.event.has(output.id)) {
      const current = this.store.entity.event.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)
    }

    return output
  }

  devicePushConfigList = async (input = {}) => {
    let output = await this.bridge.devicePushConfigList(input)

    return output
  }

  devicePushConfigCreate = async (input = {}) => {
    let output = await this.bridge.devicePushConfigCreate(input)

    if (this.store.entity.devicePushConfig.has(output.id)) {
      const current = this.store.entity.devicePushConfig.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new DevicePushConfigEntityStore(this.store, output)
      this.store.entity.devicePushConfig.set(output.id, output)
    }

    return output
  }

  devicePushConfigNativeRegister = async (input = {}) => {
    let output = await this.bridge.devicePushConfigNativeRegister(input)

    return output
  }

  devicePushConfigNativeUnregister = async (input = {}) => {
    let output = await this.bridge.devicePushConfigNativeUnregister(input)

    return output
  }

  devicePushConfigRemove = async (input = {}) => {
    let output = await this.bridge.devicePushConfigRemove(input)

    if (this.store.entity.devicePushConfig.has(output.id)) {
      output = this.store.entity.devicePushConfig.get(output.id)
      this.store.entity.devicePushConfig.delete(output.id)
    }

    return output
  }

  devicePushConfigUpdate = async (input = {}) => {
    let output = await this.bridge.devicePushConfigUpdate(input)

    if (this.store.entity.devicePushConfig.has(output.id)) {
      const current = this.store.entity.devicePushConfig.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new DevicePushConfigEntityStore(this.store, output)
      this.store.entity.devicePushConfig.set(output.id, output)
    }

    return output
  }

  handleEvent = async (input = {}) => {
    let output = await this.bridge.handleEvent(input)

    return output
  }

  generateFakeData = async (input = {}) => {
    let output = await this.bridge.generateFakeData(input)

    return output
  }

  runIntegrationTests = async (input = {}) => {
    let output = await this.bridge.runIntegrationTests(input)

    return output
  }

  debugPing = async (input = {}) => {
    let output = await this.bridge.debugPing(input)

    return output
  }

  debugRequeueEvent = async (input = {}) => {
    let output = await this.bridge.debugRequeueEvent(input)

    if (this.store.entity.event.has(output.id)) {
      const current = this.store.entity.event.get(output.id)
      Object.keys(output).forEach(_ => {
        current[_] = output[_]
      })
      output = current
    } else {
      output = new EventEntityStore(this.store, output)
      this.store.entity.event.set(output.id, output)
    }

    return output
  }

  debugRequeueAll = async (input = {}) => {
    let output = await this.bridge.debugRequeueAll(input)

    return output
  }

  deviceInfos = async (input = {}) => {
    let output = await this.bridge.deviceInfos(input)

    return output
  }

  appVersion = async (input = {}) => {
    let output = await this.bridge.appVersion(input)

    return output
  }

  peers = async (input = {}) => {
    let output = await this.bridge.peers(input)

    return output
  }

  protocols = async (input = {}) => {
    let output = await this.bridge.protocols(input)

    return output
  }

  logStreamCache = {}

  logStreamMutex = {}

  logStream = async (input = {}) => {
    const inputHash = objectHash(input)
    const unlock = await (
      this.logStreamMutex[inputHash] ||
      (this.logStreamMutex[inputHash] = new Mutex())
    ).lock()
    if (this.logStreamCache[inputHash] == null) {
      this.logStreamCache[inputHash] = new Stream.Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform: (output, encoding, callback) => {
          callback(null, output)
        },
      })
      const stream = await this.bridge.logStream(input)

      this.logStreamCache[inputHash].setMaxListeners(30)
      stream.pipe(this.logStreamCache[inputHash])
      this.logStreamCache[inputHash].on('end', () => {
        delete this.logStreamCache[inputHash]
      })
    }
    const passThroughStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    this.logStreamCache[inputHash].pipe(passThroughStream)
    unlock()
    return passThroughStream
  }

  logfileListCache = {}

  logfileList = async (input = {}) => {
    const transformStream = new Stream.Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform: (output, encoding, callback) => {
        callback(null, output)
      },
    })
    const stream = await this.bridge.logfileList(input)

    stream.pipe(transformStream)
    return transformStream
  }

  logfileReadCache = {}

  logfileReadMutex = {}

  logfileRead = async (input = {}) => {
    const inputHash = objectHash(input)
    const unlock = await (
      this.logfileReadMutex[inputHash] ||
      (this.logfileReadMutex[inputHash] = new Mutex())
    ).lock()
    if (this.logfileReadCache[inputHash] == null) {
      this.logfileReadCache[inputHash] = new Stream.Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform: (output, encoding, callback) => {
          callback(null, output)
        },
      })
      const stream = await this.bridge.logfileRead(input)

      this.logfileReadCache[inputHash].setMaxListeners(30)
      stream.pipe(this.logfileReadCache[inputHash])
      this.logfileReadCache[inputHash].on('end', () => {
        delete this.logfileReadCache[inputHash]
      })
    }
    const passThroughStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    this.logfileReadCache[inputHash].pipe(passThroughStream)
    unlock()
    return passThroughStream
  }

  testLogBackgroundError = async (input = {}) => {
    let output = await this.bridge.testLogBackgroundError(input)

    return output
  }

  testLogBackgroundWarn = async (input = {}) => {
    let output = await this.bridge.testLogBackgroundWarn(input)

    return output
  }

  testLogBackgroundDebug = async (input = {}) => {
    let output = await this.bridge.testLogBackgroundDebug(input)

    return output
  }

  testPanic = async (input = {}) => {
    let output = await this.bridge.testPanic(input)

    return output
  }

  testError = async (input = {}) => {
    let output = await this.bridge.testError(input)

    return output
  }

  monitorBandwidthCache = {}

  monitorBandwidthMutex = {}

  monitorBandwidth = async (input = {}) => {
    const inputHash = objectHash(input)
    const unlock = await (
      this.monitorBandwidthMutex[inputHash] ||
      (this.monitorBandwidthMutex[inputHash] = new Mutex())
    ).lock()
    if (this.monitorBandwidthCache[inputHash] == null) {
      this.monitorBandwidthCache[inputHash] = new Stream.Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform: (output, encoding, callback) => {
          callback(null, output)
        },
      })
      const stream = await this.bridge.monitorBandwidth(input)

      this.monitorBandwidthCache[inputHash].setMaxListeners(30)
      stream.pipe(this.monitorBandwidthCache[inputHash])
      this.monitorBandwidthCache[inputHash].on('end', () => {
        delete this.monitorBandwidthCache[inputHash]
      })
    }
    const passThroughStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    this.monitorBandwidthCache[inputHash].pipe(passThroughStream)
    unlock()
    return passThroughStream
  }

  monitorPeersCache = {}

  monitorPeersMutex = {}

  monitorPeers = async (input = {}) => {
    const inputHash = objectHash(input)
    const unlock = await (
      this.monitorPeersMutex[inputHash] ||
      (this.monitorPeersMutex[inputHash] = new Mutex())
    ).lock()
    if (this.monitorPeersCache[inputHash] == null) {
      this.monitorPeersCache[inputHash] = new Stream.Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform: (output, encoding, callback) => {
          callback(null, output)
        },
      })
      const stream = await this.bridge.monitorPeers(input)

      this.monitorPeersCache[inputHash].setMaxListeners(30)
      stream.pipe(this.monitorPeersCache[inputHash])
      this.monitorPeersCache[inputHash].on('end', () => {
        delete this.monitorPeersCache[inputHash]
      })
    }
    const passThroughStream = new Stream.PassThrough({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    this.monitorPeersCache[inputHash].pipe(passThroughStream)
    unlock()
    return passThroughStream
  }

  getListenAddrs = async (input = {}) => {
    let output = await this.bridge.getListenAddrs(input)

    return output
  }

  getListenInterfaceAddrs = async (input = {}) => {
    let output = await this.bridge.getListenInterfaceAddrs(input)

    return output
  }

  libp2PPing = async (input = {}) => {
    let output = await this.bridge.libp2PPing(input)

    return output
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

    this.daemon = this.bridge.daemon
  }
}
