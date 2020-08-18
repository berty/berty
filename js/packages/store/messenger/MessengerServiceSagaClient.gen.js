import * as api from '@berty-tech/api'
import { eventChannel, END } from 'redux-saga'
import { grpc } from '@improbable-eng/grpc-web'
import { MessengerService } from '../protocol/grpc-web-gen/bertymessenger_pb_service'
import * as bertymessenger from '../protocol/grpc-web-gen/bertymessenger_pb'

class GRPCError extends Error {
	constructor(message) {
		super(message)
		this.name = 'GRPCError'
	}
}

export default class MessengerServiceSagaClient {
	host
	transport

	constructor(host, transport) {
		this.host = host
		this.transport = transport
	}

	instanceShareableBertyID = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.InstanceShareableBertyID.Request.encode(
				requestObj,
			).finish()
			const request = bertymessenger.InstanceShareableBertyID.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.InstanceShareableBertyID, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(
						api.berty.messenger.v1.InstanceShareableBertyID.Reply.decode(message.serializeBinary()),
					),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC InstanceShareableBertyID ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	shareableBertyGroup = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.ShareableBertyGroup.Request.encode(requestObj).finish()
			const request = bertymessenger.ShareableBertyGroup.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.ShareableBertyGroup, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.ShareableBertyGroup.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC ShareableBertyGroup ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	devShareInstanceBertyID = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.DevShareInstanceBertyID.Request.encode(requestObj).finish()
			const request = bertymessenger.DevShareInstanceBertyID.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.DevShareInstanceBertyID, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(
						api.berty.messenger.v1.DevShareInstanceBertyID.Reply.decode(message.serializeBinary()),
					),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC DevShareInstanceBertyID ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	parseDeepLink = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.ParseDeepLink.Request.encode(requestObj).finish()
			const request = bertymessenger.ParseDeepLink.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.ParseDeepLink, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.ParseDeepLink.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC ParseDeepLink ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	sendContactRequest = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.SendContactRequest.Request.encode(requestObj).finish()
			const request = bertymessenger.SendContactRequest.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.SendContactRequest, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.SendContactRequest.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC SendContactRequest ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	sendMessage = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.SendMessage.Request.encode(requestObj).finish()
			const request = bertymessenger.SendMessage.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.SendMessage, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.SendMessage.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC SendMessage ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	sendAck = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.SendAck.Request.encode(requestObj).finish()
			const request = bertymessenger.SendAck.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.SendAck, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.SendAck.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC SendAck ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	systemInfo = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.SystemInfo.Request.encode(requestObj).finish()
			const request = bertymessenger.SystemInfo.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.SystemInfo, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.SystemInfo.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC SystemInfo ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	echoTest = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.EchoTest.Request.encode(requestObj).finish()
			const request = bertymessenger.EchoTest.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.EchoTest, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.EchoTest.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC EchoTest ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	conversationStream = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.ConversationStream.Request.encode(requestObj).finish()
			const request = bertymessenger.ConversationStream.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.ConversationStream, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.ConversationStream.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC ConversationStream ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	eventStream = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.EventStream.Request.encode(requestObj).finish()
			const request = bertymessenger.EventStream.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.EventStream, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.EventStream.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC EventStream ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	conversationCreate = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.ConversationCreate.Request.encode(requestObj).finish()
			const request = bertymessenger.ConversationCreate.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.ConversationCreate, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.ConversationCreate.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC ConversationCreate ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	conversationJoin = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.ConversationJoin.Request.encode(requestObj).finish()
			const request = bertymessenger.ConversationJoin.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.ConversationJoin, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.ConversationJoin.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC ConversationJoin ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	accountGet = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.AccountGet.Request.encode(requestObj).finish()
			const request = bertymessenger.AccountGet.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.AccountGet, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.AccountGet.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC AccountGet ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	accountUpdate = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.AccountUpdate.Request.encode(requestObj).finish()
			const request = bertymessenger.AccountUpdate.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.AccountUpdate, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.AccountUpdate.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC AccountUpdate ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	contactRequest = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.ContactRequest.Request.encode(requestObj).finish()
			const request = bertymessenger.ContactRequest.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.ContactRequest, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.ContactRequest.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC ContactRequest ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	contactAccept = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.ContactAccept.Request.encode(requestObj).finish()
			const request = bertymessenger.ContactAccept.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.ContactAccept, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.ContactAccept.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC ContactAccept ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
	interact = (requestObj = {}) =>
		eventChannel((emit) => {
			const buf = api.berty.messenger.v1.Interact.Request.encode(requestObj).finish()
			const request = bertymessenger.Interact.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.Interact, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message) =>
					emit(api.berty.messenger.v1.Interact.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC Interact ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							),
						)
					}
					emit(END)
				},
			})
			return close
		})
}
