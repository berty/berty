import * as api from '@berty-tech/api'
import { eventChannel, END } from 'redux-saga'
import { grpc } from '@improbable-eng/grpc-web'
import { MessengerService } from '../protocol/grpc-web-gen/bertymessenger_pb_service'
import * as bertymessenger from '../protocol/grpc-web-gen/bertymessenger_pb'

class GRPCError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'GRPCError'
	}
}

export default class MessengerServiceSagaClient {
	host: string
	transport: grpc.TransportFactory

	constructor(host: string, transport: grpc.TransportFactory) {
		this.host = host
		this.transport = transport
	}

	instanceShareableBertyID = (
		requestObj: api.berty.messenger.InstanceShareableBertyID.IRequest = {},
	) =>
		eventChannel<api.berty.messenger.InstanceShareableBertyID.IReply>((emit) => {
			const buf = api.berty.messenger.InstanceShareableBertyID.Request.encode(requestObj).finish()
			const request = bertymessenger.InstanceShareableBertyID.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.InstanceShareableBertyID, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertymessenger.InstanceShareableBertyID.Reply) =>
					emit(
						api.berty.messenger.InstanceShareableBertyID.Reply.decode(message.serializeBinary()),
					),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC InstanceShareableBertyID ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							) as any,
						)
					}
					emit(END)
				},
			})
			return close
		})
	devShareInstanceBertyID = (
		requestObj: api.berty.messenger.DevShareInstanceBertyID.IRequest = {},
	) =>
		eventChannel<api.berty.messenger.DevShareInstanceBertyID.IReply>((emit) => {
			const buf = api.berty.messenger.DevShareInstanceBertyID.Request.encode(requestObj).finish()
			const request = bertymessenger.DevShareInstanceBertyID.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.DevShareInstanceBertyID, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertymessenger.DevShareInstanceBertyID.Reply) =>
					emit(api.berty.messenger.DevShareInstanceBertyID.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC DevShareInstanceBertyID ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							) as any,
						)
					}
					emit(END)
				},
			})
			return close
		})
	parseDeepLink = (requestObj: api.berty.messenger.ParseDeepLink.IRequest = {}) =>
		eventChannel<api.berty.messenger.ParseDeepLink.IReply>((emit) => {
			const buf = api.berty.messenger.ParseDeepLink.Request.encode(requestObj).finish()
			const request = bertymessenger.ParseDeepLink.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.ParseDeepLink, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertymessenger.ParseDeepLink.Reply) =>
					emit(api.berty.messenger.ParseDeepLink.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC ParseDeepLink ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							) as any,
						)
					}
					emit(END)
				},
			})
			return close
		})
	sendContactRequest = (requestObj: api.berty.messenger.SendContactRequest.IRequest = {}) =>
		eventChannel<api.berty.messenger.SendContactRequest.IReply>((emit) => {
			const buf = api.berty.messenger.SendContactRequest.Request.encode(requestObj).finish()
			const request = bertymessenger.SendContactRequest.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(MessengerService.SendContactRequest, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertymessenger.SendContactRequest.Reply) =>
					emit(api.berty.messenger.SendContactRequest.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new GRPCError(
								`GRPC SendContactRequest ${
									grpc.Code[code]
								} (${code}): ${msg}\nTrailers: ${JSON.stringify(trailers)}`,
							) as any,
						)
					}
					emit(END)
				},
			})
			return close
		})
}
