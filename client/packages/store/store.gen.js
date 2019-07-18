import { observable } from 'mobx'
import Stream from 'stream'
import objectHash from 'object-hash'
import Mutex from 'await-mutex'

        export class ConfigEntityStore {
            store = null

            constructor (store, data) {
              this.store = store
              Object.keys(data).forEach(key => (this[key] = data[key]))
            }

                  id = null
                  createdAt = null
                  updatedAt = null
                get myself () {
                    return this.store.entity.contact.get(this.myselfId)
                }
                set myself (_) {

                  let entity = this.store.entity.contact.get(_.id)
                  entity = new ContactEntityStore(this.store, _)
                  this.store.entity.contact.set(_.id, entity)

                }
                  myselfId = null
                get currentDevice () {
                    return this.store.entity.device.get(this.currentDeviceId)
                }
                set currentDevice (_) {

                  let entity = this.store.entity.device.get(_.id)
                  entity = new DeviceEntityStore(this.store, _)
                  this.store.entity.device.set(_.id, entity)

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
                get devices () {
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

                  let entity = this.store.entity.device.get(_.id)
                  entity = new DeviceEntityStore(this.store, _)
                  this.store.entity.device.set(_.id, entity)

                   })
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
                get pushIdentifiers () {
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

                  let entity = this.store.entity.devicePushIdentifier.get(_.id)
                  entity = new DevicePushIdentifierEntityStore(this.store, _)
                  this.store.entity.devicePushIdentifier.set(_.id, entity)

                   })
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
                get members () {
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

                  let entity = this.store.entity.conversationMember.get(_.id)
                  entity = new ConversationMemberEntityStore(this.store, _)
                  this.store.entity.conversationMember.set(_.id, entity)

                   })
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
                get contact () {
                    return this.store.entity.contact.get(this.contactId)
                }
                set contact (_) {

                  let entity = this.store.entity.contact.get(_.id)
                  entity = new ContactEntityStore(this.store, _)
                  this.store.entity.contact.set(_.id, entity)

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
                get dispatches () {
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

                  let entity = this.store.entity.eventDispatch.get(_.id)
                  entity = new EventDispatchEntityStore(this.store, _)
                  this.store.entity.eventDispatch.set(_.id, entity)

                   })
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
                this.commitLogStreamMutex[inputHash]
                || (this.commitLogStreamMutex[inputHash] = new Mutex())
              ).lock()
              if (this.commitLogStreamCache[inputHash] == null) {
                this.commitLogStreamCache[inputHash] = new Stream.Transform({
              writableObjectMode: true,
              readableObjectMode: true,
              transform: (output, encoding, callback) => {

              Object.keys(output.entity).forEach(
                key => {
                  let _ = output.entity[key]
                  if (_ == null) {
                    return
                  }
                  switch (key) {
                    default:
                      break
                      case 'config': {
                        let entity = this.store.entity.config.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new ConfigEntityStore(this.store, _)
                            this.store.entity.config.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.config.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                      case 'contact': {
                        let entity = this.store.entity.contact.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new ContactEntityStore(this.store, _)
                            this.store.entity.contact.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.contact.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                      case 'device': {
                        let entity = this.store.entity.device.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new DeviceEntityStore(this.store, _)
                            this.store.entity.device.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.device.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                      case 'conversation': {
                        let entity = this.store.entity.conversation.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new ConversationEntityStore(this.store, _)
                            this.store.entity.conversation.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.conversation.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                      case 'conversationMember': {
                        let entity = this.store.entity.conversationMember.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new ConversationMemberEntityStore(this.store, _)
                            this.store.entity.conversationMember.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.conversationMember.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                      case 'event': {
                        let entity = this.store.entity.event.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new EventEntityStore(this.store, _)
                            this.store.entity.event.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.event.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                      case 'devicePushConfig': {
                        let entity = this.store.entity.devicePushConfig.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new DevicePushConfigEntityStore(this.store, _)
                            this.store.entity.devicePushConfig.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.devicePushConfig.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                      case 'devicePushIdentifier': {
                        let entity = this.store.entity.devicePushIdentifier.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new DevicePushIdentifierEntityStore(this.store, _)
                            this.store.entity.devicePushIdentifier.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.devicePushIdentifier.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                      case 'eventDispatch': {
                        let entity = this.store.entity.eventDispatch.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new EventDispatchEntityStore(this.store, _)
                            this.store.entity.eventDispatch.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.eventDispatch.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                      case 'senderAlias': {
                        let entity = this.store.entity.senderAlias.get(_.id)
                        switch (output.operation) {
                          default:
                          case 0:
                          case 1:
                            entity = new SenderAliasEntityStore(this.store, _)
                            this.store.entity.senderAlias.set(_.id, entity)
                            break
                          case 2:
                            if (entity) {
                              this.store.entity.senderAlias.delete(_.id)
                            }
                            break
                        }
                        _ = entity
                        break
                      }
                  }
                  output.entity[key] = _
                }
              )


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
                this.eventStreamMutex[inputHash]
                || (this.eventStreamMutex[inputHash] = new Mutex())
              ).lock()
              if (this.eventStreamCache[inputHash] == null) {
                this.eventStreamCache[inputHash] = new Stream.Transform({
              writableObjectMode: true,
              readableObjectMode: true,
              transform: (output, encoding, callback) => {


                let entity = this.store.entity.event.get(output.id)
                  entity = new EventEntityStore(this.store, output)
                  this.store.entity.event.set(output.id, entity)
                output = entity

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


                let entity = this.store.entity.event.get(output.id)
                  entity = new EventEntityStore(this.store, output)
                  this.store.entity.event.set(output.id, entity)
                output = entity

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
                this.eventUnseenMutex[inputHash]
                || (this.eventUnseenMutex[inputHash] = new Mutex())
              ).lock()
              if (this.eventUnseenCache[inputHash] == null) {
                this.eventUnseenCache[inputHash] = new Stream.Transform({
              writableObjectMode: true,
              readableObjectMode: true,
              transform: (output, encoding, callback) => {


                let entity = this.store.entity.event.get(output.id)
                  entity = new EventEntityStore(this.store, output)
                  this.store.entity.event.set(output.id, entity)
                output = entity

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


                let entity = this.store.entity.event.get(output.id)
                  entity = new EventEntityStore(this.store, output)
                  this.store.entity.event.set(output.id, entity)
                output = entity

            return output

        }


        eventSeen = async (input = {}) => {

            let output = await this.bridge.eventSeen(input)


                let entity = this.store.entity.event.get(output.id)
                  entity = new EventEntityStore(this.store, output)
                  this.store.entity.event.set(output.id, entity)
                output = entity

            return output

        }


        eventRetry = async (input = {}) => {

            let output = await this.bridge.eventRetry(input)


                let entity = this.store.entity.event.get(output.id)
                  entity = new EventEntityStore(this.store, output)
                  this.store.entity.event.set(output.id, entity)
                output = entity

            return output

        }


        config = async (input = {}) => {

            let output = await this.bridge.config(input)


                let entity = this.store.entity.config.get(output.id)
                  entity = new ConfigEntityStore(this.store, output)
                  this.store.entity.config.set(output.id, entity)
                output = entity

            return output

        }


        configPublic = async (input = {}) => {

            let output = await this.bridge.configPublic(input)


                let entity = this.store.entity.config.get(output.id)
                  entity = new ConfigEntityStore(this.store, output)
                  this.store.entity.config.set(output.id, entity)
                output = entity

            return output

        }


        configUpdate = async (input = {}) => {

            let output = await this.bridge.configUpdate(input)


                let entity = this.store.entity.config.get(output.id)
                  entity = new ConfigEntityStore(this.store, output)
                  this.store.entity.config.set(output.id, entity)
                output = entity

            return output

        }


        contactRequest = async (input = {}) => {

            let output = await this.bridge.contactRequest(input)


                let entity = this.store.entity.contact.get(output.id)
                  entity = new ContactEntityStore(this.store, output)
                  this.store.entity.contact.set(output.id, entity)
                output = entity

            return output

        }


        contactAcceptRequest = async (input = {}) => {

            let output = await this.bridge.contactAcceptRequest(input)


                let entity = this.store.entity.contact.get(output.id)
                  entity = new ContactEntityStore(this.store, output)
                  this.store.entity.contact.set(output.id, entity)
                output = entity

            return output

        }


        contactRemove = async (input = {}) => {

            let output = await this.bridge.contactRemove(input)


                let entity = this.store.entity.contact.get(output.id)
                  if (entity) {
                    this.store.entity.contact.delete(output.id)
                  }
                output = entity

            return output

        }


        contactUpdate = async (input = {}) => {

            let output = await this.bridge.contactUpdate(input)


                let entity = this.store.entity.contact.get(output.id)
                  entity = new ContactEntityStore(this.store, output)
                  this.store.entity.contact.set(output.id, entity)
                output = entity

            return output

        }

          contactListCache = {}


        contactList = async (input = {}) => {

              const transformStream = new Stream.Transform({
              writableObjectMode: true,
              readableObjectMode: true,
              transform: (output, encoding, callback) => {


                let entity = this.store.entity.contact.get(output.id)
                  entity = new ContactEntityStore(this.store, output)
                  this.store.entity.contact.set(output.id, entity)
                output = entity

                callback(null, output)
              },
            })
            const stream = await this.bridge.contactList(input)

              stream.pipe(transformStream)
              return transformStream

        }


        contact = async (input = {}) => {

            let output = await this.bridge.contact(input)


                let entity = this.store.entity.contact.get(output.id)
                  entity = new ContactEntityStore(this.store, output)
                  this.store.entity.contact.set(output.id, entity)
                output = entity

            return output

        }


        contactCheckPublicKey = async (input = {}) => {

            let output = await this.bridge.contactCheckPublicKey(input)



            return output

        }


        conversationCreate = async (input = {}) => {

            let output = await this.bridge.conversationCreate(input)


                let entity = this.store.entity.conversation.get(output.id)
                  entity = new ConversationEntityStore(this.store, output)
                  this.store.entity.conversation.set(output.id, entity)
                output = entity

            return output

        }


        conversationUpdate = async (input = {}) => {

            let output = await this.bridge.conversationUpdate(input)


                let entity = this.store.entity.conversation.get(output.id)
                  entity = new ConversationEntityStore(this.store, output)
                  this.store.entity.conversation.set(output.id, entity)
                output = entity

            return output

        }

          conversationListCache = {}


        conversationList = async (input = {}) => {

              const transformStream = new Stream.Transform({
              writableObjectMode: true,
              readableObjectMode: true,
              transform: (output, encoding, callback) => {


                let entity = this.store.entity.conversation.get(output.id)
                  entity = new ConversationEntityStore(this.store, output)
                  this.store.entity.conversation.set(output.id, entity)
                output = entity

                callback(null, output)
              },
            })
            const stream = await this.bridge.conversationList(input)

              stream.pipe(transformStream)
              return transformStream

        }


        conversationInvite = async (input = {}) => {

            let output = await this.bridge.conversationInvite(input)


                let entity = this.store.entity.conversation.get(output.id)
                  entity = new ConversationEntityStore(this.store, output)
                  this.store.entity.conversation.set(output.id, entity)
                output = entity

            return output

        }


        conversationExclude = async (input = {}) => {

            let output = await this.bridge.conversationExclude(input)


                let entity = this.store.entity.conversation.get(output.id)
                  entity = new ConversationEntityStore(this.store, output)
                  this.store.entity.conversation.set(output.id, entity)
                output = entity

            return output

        }


        conversationAddMessage = async (input = {}) => {

            let output = await this.bridge.conversationAddMessage(input)


                let entity = this.store.entity.event.get(output.id)
                  entity = new EventEntityStore(this.store, output)
                  this.store.entity.event.set(output.id, entity)
                output = entity

            return output

        }


        conversation = async (input = {}) => {

            let output = await this.bridge.conversation(input)


                let entity = this.store.entity.conversation.get(output.id)
                  entity = new ConversationEntityStore(this.store, output)
                  this.store.entity.conversation.set(output.id, entity)
                output = entity

            return output

        }


        conversationMember = async (input = {}) => {

            let output = await this.bridge.conversationMember(input)


                let entity = this.store.entity.conversationMember.get(output.id)
                  entity = new ConversationMemberEntityStore(this.store, output)
                  this.store.entity.conversationMember.set(output.id, entity)
                output = entity

            return output

        }


        conversationRead = async (input = {}) => {

            let output = await this.bridge.conversationRead(input)


                let entity = this.store.entity.conversation.get(output.id)
                  entity = new ConversationEntityStore(this.store, output)
                  this.store.entity.conversation.set(output.id, entity)
                output = entity

            return output

        }


        conversationRemove = async (input = {}) => {

            let output = await this.bridge.conversationRemove(input)


                let entity = this.store.entity.conversation.get(output.id)
                  if (entity) {
                    this.store.entity.conversation.delete(output.id)
                  }
                output = entity

            return output

        }


        conversationLastEvent = async (input = {}) => {

            let output = await this.bridge.conversationLastEvent(input)


                let entity = this.store.entity.event.get(output.id)
                  entity = new EventEntityStore(this.store, output)
                  this.store.entity.event.set(output.id, entity)
                output = entity

            return output

        }

          devicePushConfigListCache = {}


        devicePushConfigList = async (input = {}) => {

              const transformStream = new Stream.Transform({
              writableObjectMode: true,
              readableObjectMode: true,
              transform: (output, encoding, callback) => {


                let entity = this.store.entity.devicePushConfig.get(output.id)
                  entity = new DevicePushConfigEntityStore(this.store, output)
                  this.store.entity.devicePushConfig.set(output.id, entity)
                output = entity

                callback(null, output)
              },
            })
            const stream = await this.bridge.devicePushConfigList(input)

              stream.pipe(transformStream)
              return transformStream

        }


        devicePushConfigCreate = async (input = {}) => {

            let output = await this.bridge.devicePushConfigCreate(input)


                let entity = this.store.entity.devicePushConfig.get(output.id)
                  entity = new DevicePushConfigEntityStore(this.store, output)
                  this.store.entity.devicePushConfig.set(output.id, entity)
                output = entity

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


                let entity = this.store.entity.devicePushConfig.get(output.id)
                  if (entity) {
                    this.store.entity.devicePushConfig.delete(output.id)
                  }
                output = entity

            return output

        }


        devicePushConfigUpdate = async (input = {}) => {

            let output = await this.bridge.devicePushConfigUpdate(input)


                let entity = this.store.entity.devicePushConfig.get(output.id)
                  entity = new DevicePushConfigEntityStore(this.store, output)
                  this.store.entity.devicePushConfig.set(output.id, entity)
                output = entity

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


                let entity = this.store.entity.event.get(output.id)
                  entity = new EventEntityStore(this.store, output)
                  this.store.entity.event.set(output.id, entity)
                output = entity

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
                this.logStreamMutex[inputHash]
                || (this.logStreamMutex[inputHash] = new Mutex())
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
                this.logfileReadMutex[inputHash]
                || (this.logfileReadMutex[inputHash] = new Mutex())
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
                this.monitorBandwidthMutex[inputHash]
                || (this.monitorBandwidthMutex[inputHash] = new Mutex())
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
                this.monitorPeersMutex[inputHash]
                || (this.monitorPeersMutex[inputHash] = new Mutex())
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
        service: this.bridge && this.bridge.node && this.bridge.node.service && new NodeServiceStore(this, this.bridge.node.service),
      }

      this.daemon = this.bridge.daemon
    }
  }