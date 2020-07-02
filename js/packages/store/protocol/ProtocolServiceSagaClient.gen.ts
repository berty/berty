import * as api from '@berty-tech/api'
import { eventChannel, END } from 'redux-saga'
import { grpc } from '@improbable-eng/grpc-web'
import { ProtocolService } from './grpc-web-gen/bertyprotocol_pb_service'
import * as bertytypes from './grpc-web-gen/bertytypes_pb'

export default class ProtocolServiceSagaClient {
	host: string
	transport: grpc.TransportFactory

	constructor(host: string, transport: grpc.TransportFactory) {
		this.host = host
		this.transport = transport
	}

	instanceExportData = (requestObj: api.berty.types.v1.InstanceExportData.IRequest = {}) =>
		eventChannel<api.berty.types.v1.InstanceExportData.IReply>((emit) => {
			const buf = api.berty.types.v1.InstanceExportData.Request.encode(requestObj).finish()
			const request = bertytypes.InstanceExportData.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.InstanceExportData, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.InstanceExportData.Reply) =>
					emit(api.berty.types.v1.InstanceExportData.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC InstanceExportData ${
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
	instanceGetConfiguration = (
		requestObj: api.berty.types.v1.InstanceGetConfiguration.IRequest = {},
	) =>
		eventChannel<api.berty.types.v1.InstanceGetConfiguration.IReply>((emit) => {
			const buf = api.berty.types.v1.InstanceGetConfiguration.Request.encode(requestObj).finish()
			const request = bertytypes.InstanceGetConfiguration.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.InstanceGetConfiguration, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.InstanceGetConfiguration.Reply) =>
					emit(api.berty.types.v1.InstanceGetConfiguration.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC InstanceGetConfiguration ${
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
	contactRequestReference = (
		requestObj: api.berty.types.v1.ContactRequestReference.IRequest = {},
	) =>
		eventChannel<api.berty.types.v1.ContactRequestReference.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactRequestReference.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestReference.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestReference, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestReference.Reply) =>
					emit(api.berty.types.v1.ContactRequestReference.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactRequestReference ${
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
	contactRequestDisable = (requestObj: api.berty.types.v1.ContactRequestDisable.IRequest = {}) =>
		eventChannel<api.berty.types.v1.ContactRequestDisable.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactRequestDisable.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestDisable.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestDisable, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestDisable.Reply) =>
					emit(api.berty.types.v1.ContactRequestDisable.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactRequestDisable ${
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
	contactRequestEnable = (requestObj: api.berty.types.v1.ContactRequestEnable.IRequest = {}) =>
		eventChannel<api.berty.types.v1.ContactRequestEnable.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactRequestEnable.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestEnable.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestEnable, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestEnable.Reply) =>
					emit(api.berty.types.v1.ContactRequestEnable.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactRequestEnable ${
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
	contactRequestResetReference = (
		requestObj: api.berty.types.v1.ContactRequestResetReference.IRequest = {},
	) =>
		eventChannel<api.berty.types.v1.ContactRequestResetReference.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactRequestResetReference.Request.encode(
				requestObj,
			).finish()
			const request = bertytypes.ContactRequestResetReference.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestResetReference, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestResetReference.Reply) =>
					emit(
						api.berty.types.v1.ContactRequestResetReference.Reply.decode(message.serializeBinary()),
					),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactRequestResetReference ${
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
	contactRequestSend = (requestObj: api.berty.types.v1.ContactRequestSend.IRequest = {}) =>
		eventChannel<api.berty.types.v1.ContactRequestSend.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactRequestSend.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestSend.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestSend, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestSend.Reply) =>
					emit(api.berty.types.v1.ContactRequestSend.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactRequestSend ${
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
	contactRequestAccept = (requestObj: api.berty.types.v1.ContactRequestAccept.IRequest = {}) =>
		eventChannel<api.berty.types.v1.ContactRequestAccept.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactRequestAccept.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestAccept.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestAccept, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestAccept.Reply) =>
					emit(api.berty.types.v1.ContactRequestAccept.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactRequestAccept ${
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
	contactRequestDiscard = (requestObj: api.berty.types.v1.ContactRequestDiscard.IRequest = {}) =>
		eventChannel<api.berty.types.v1.ContactRequestDiscard.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactRequestDiscard.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestDiscard.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestDiscard, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestDiscard.Reply) =>
					emit(api.berty.types.v1.ContactRequestDiscard.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactRequestDiscard ${
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
	contactBlock = (requestObj: api.berty.types.v1.ContactBlock.IRequest = {}) =>
		eventChannel<api.berty.types.v1.ContactBlock.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactBlock.Request.encode(requestObj).finish()
			const request = bertytypes.ContactBlock.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactBlock, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactBlock.Reply) =>
					emit(api.berty.types.v1.ContactBlock.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactBlock ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							) as any,
						)
					}
					emit(END)
				},
			})
			return close
		})
	contactUnblock = (requestObj: api.berty.types.v1.ContactUnblock.IRequest = {}) =>
		eventChannel<api.berty.types.v1.ContactUnblock.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactUnblock.Request.encode(requestObj).finish()
			const request = bertytypes.ContactUnblock.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactUnblock, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactUnblock.Reply) =>
					emit(api.berty.types.v1.ContactUnblock.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactUnblock ${
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
	contactAliasKeySend = (requestObj: api.berty.types.v1.ContactAliasKeySend.IRequest = {}) =>
		eventChannel<api.berty.types.v1.ContactAliasKeySend.IReply>((emit) => {
			const buf = api.berty.types.v1.ContactAliasKeySend.Request.encode(requestObj).finish()
			const request = bertytypes.ContactAliasKeySend.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactAliasKeySend, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactAliasKeySend.Reply) =>
					emit(api.berty.types.v1.ContactAliasKeySend.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ContactAliasKeySend ${
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
	multiMemberGroupCreate = (requestObj: api.berty.types.v1.MultiMemberGroupCreate.IRequest = {}) =>
		eventChannel<api.berty.types.v1.MultiMemberGroupCreate.IReply>((emit) => {
			const buf = api.berty.types.v1.MultiMemberGroupCreate.Request.encode(requestObj).finish()
			const request = bertytypes.MultiMemberGroupCreate.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupCreate, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupCreate.Reply) =>
					emit(api.berty.types.v1.MultiMemberGroupCreate.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC MultiMemberGroupCreate ${
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
	multiMemberGroupJoin = (requestObj: api.berty.types.v1.MultiMemberGroupJoin.IRequest = {}) =>
		eventChannel<api.berty.types.v1.MultiMemberGroupJoin.IReply>((emit) => {
			const buf = api.berty.types.v1.MultiMemberGroupJoin.Request.encode(requestObj).finish()
			const request = bertytypes.MultiMemberGroupJoin.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupJoin, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupJoin.Reply) =>
					emit(api.berty.types.v1.MultiMemberGroupJoin.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC MultiMemberGroupJoin ${
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
	multiMemberGroupLeave = (requestObj: api.berty.types.v1.MultiMemberGroupLeave.IRequest = {}) =>
		eventChannel<api.berty.types.v1.MultiMemberGroupLeave.IReply>((emit) => {
			const buf = api.berty.types.v1.MultiMemberGroupLeave.Request.encode(requestObj).finish()
			const request = bertytypes.MultiMemberGroupLeave.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupLeave, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupLeave.Reply) =>
					emit(api.berty.types.v1.MultiMemberGroupLeave.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC MultiMemberGroupLeave ${
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
	multiMemberGroupAliasResolverDisclose = (
		requestObj: api.berty.types.v1.MultiMemberGroupAliasResolverDisclose.IRequest = {},
	) =>
		eventChannel<api.berty.types.v1.MultiMemberGroupAliasResolverDisclose.IReply>((emit) => {
			const buf = api.berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request.encode(
				requestObj,
			).finish()
			const request = bertytypes.MultiMemberGroupAliasResolverDisclose.Request.deserializeBinary(
				buf,
			)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupAliasResolverDisclose, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupAliasResolverDisclose.Reply) =>
					emit(
						api.berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply.decode(
							message.serializeBinary(),
						),
					),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC MultiMemberGroupAliasResolverDisclose ${
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
	multiMemberGroupAdminRoleGrant = (
		requestObj: api.berty.types.v1.MultiMemberGroupAdminRoleGrant.IRequest = {},
	) =>
		eventChannel<api.berty.types.v1.MultiMemberGroupAdminRoleGrant.IReply>((emit) => {
			const buf = api.berty.types.v1.MultiMemberGroupAdminRoleGrant.Request.encode(
				requestObj,
			).finish()
			const request = bertytypes.MultiMemberGroupAdminRoleGrant.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupAdminRoleGrant, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupAdminRoleGrant.Reply) =>
					emit(
						api.berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply.decode(
							message.serializeBinary(),
						),
					),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC MultiMemberGroupAdminRoleGrant ${
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
	multiMemberGroupInvitationCreate = (
		requestObj: api.berty.types.v1.MultiMemberGroupInvitationCreate.IRequest = {},
	) =>
		eventChannel<api.berty.types.v1.MultiMemberGroupInvitationCreate.IReply>((emit) => {
			const buf = api.berty.types.v1.MultiMemberGroupInvitationCreate.Request.encode(
				requestObj,
			).finish()
			const request = bertytypes.MultiMemberGroupInvitationCreate.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupInvitationCreate, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupInvitationCreate.Reply) =>
					emit(
						api.berty.types.v1.MultiMemberGroupInvitationCreate.Reply.decode(
							message.serializeBinary(),
						),
					),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC MultiMemberGroupInvitationCreate ${
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
	appMetadataSend = (requestObj: api.berty.types.v1.AppMetadataSend.IRequest = {}) =>
		eventChannel<api.berty.types.v1.AppMetadataSend.IReply>((emit) => {
			const buf = api.berty.types.v1.AppMetadataSend.Request.encode(requestObj).finish()
			const request = bertytypes.AppMetadataSend.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.AppMetadataSend, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.AppMetadataSend.Reply) =>
					emit(api.berty.types.v1.AppMetadataSend.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC AppMetadataSend ${
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
	appMessageSend = (requestObj: api.berty.types.v1.AppMessageSend.IRequest = {}) =>
		eventChannel<api.berty.types.v1.AppMessageSend.IReply>((emit) => {
			const buf = api.berty.types.v1.AppMessageSend.Request.encode(requestObj).finish()
			const request = bertytypes.AppMessageSend.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.AppMessageSend, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.AppMessageSend.Reply) =>
					emit(api.berty.types.v1.AppMessageSend.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC AppMessageSend ${
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
	groupMetadataSubscribe = (requestObj: api.berty.types.v1.GroupMetadataSubscribe.IRequest = {}) =>
		eventChannel<api.berty.types.v1.IGroupMetadataEvent>((emit) => {
			const buf = api.berty.types.v1.GroupMetadataSubscribe.Request.encode(requestObj).finish()
			const request = bertytypes.GroupMetadataSubscribe.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupMetadataSubscribe, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupMetadataSubscribe.Reply) =>
					emit(api.berty.types.v1.GroupMetadataEvent.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC GroupMetadataSubscribe ${
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
	groupMessageSubscribe = (requestObj: api.berty.types.v1.GroupMessageSubscribe.IRequest = {}) =>
		eventChannel<api.berty.types.v1.IGroupMessageEvent>((emit) => {
			const buf = api.berty.types.v1.GroupMessageSubscribe.Request.encode(requestObj).finish()
			const request = bertytypes.GroupMessageSubscribe.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupMessageSubscribe, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupMessageSubscribe.Reply) =>
					emit(api.berty.types.v1.GroupMessageEvent.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC GroupMessageSubscribe ${
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
	groupMetadataList = (requestObj: api.berty.types.v1.GroupMetadataList.IRequest = {}) =>
		eventChannel<api.berty.types.v1.IGroupMetadataEvent>((emit) => {
			const buf = api.berty.types.v1.GroupMetadataList.Request.encode(requestObj).finish()
			const request = bertytypes.GroupMetadataList.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupMetadataList, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupMetadataList.Reply) =>
					emit(api.berty.types.v1.GroupMetadataEvent.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC GroupMetadataList ${
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
	groupMessageList = (requestObj: api.berty.types.v1.GroupMessageList.IRequest = {}) =>
		eventChannel<api.berty.types.v1.IGroupMessageEvent>((emit) => {
			const buf = api.berty.types.v1.GroupMessageList.Request.encode(requestObj).finish()
			const request = bertytypes.GroupMessageList.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupMessageList, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupMessageList.Reply) =>
					emit(api.berty.types.v1.GroupMessageEvent.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC GroupMessageList ${
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
	groupInfo = (requestObj: api.berty.types.v1.GroupInfo.IRequest = {}) =>
		eventChannel<api.berty.types.v1.GroupInfo.IReply>((emit) => {
			const buf = api.berty.types.v1.GroupInfo.Request.encode(requestObj).finish()
			const request = bertytypes.GroupInfo.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupInfo, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupInfo.Reply) =>
					emit(api.berty.types.v1.GroupInfo.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC GroupInfo ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							) as any,
						)
					}
					emit(END)
				},
			})
			return close
		})
	activateGroup = (requestObj: api.berty.types.v1.ActivateGroup.IRequest = {}) =>
		eventChannel<api.berty.types.v1.ActivateGroup.IReply>((emit) => {
			const buf = api.berty.types.v1.ActivateGroup.Request.encode(requestObj).finish()
			const request = bertytypes.ActivateGroup.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ActivateGroup, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ActivateGroup.Reply) =>
					emit(api.berty.types.v1.ActivateGroup.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC ActivateGroup ${
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
	deactivateGroup = (requestObj: api.berty.types.v1.DeactivateGroup.IRequest = {}) =>
		eventChannel<api.berty.types.v1.DeactivateGroup.IReply>((emit) => {
			const buf = api.berty.types.v1.DeactivateGroup.Request.encode(requestObj).finish()
			const request = bertytypes.DeactivateGroup.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.DeactivateGroup, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.DeactivateGroup.Reply) =>
					emit(api.berty.types.v1.DeactivateGroup.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC DeactivateGroup ${
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
	debugListGroups = (requestObj: api.berty.types.v1.DebugListGroups.IRequest = {}) =>
		eventChannel<api.berty.types.v1.DebugListGroups.IReply>((emit) => {
			const buf = api.berty.types.v1.DebugListGroups.Request.encode(requestObj).finish()
			const request = bertytypes.DebugListGroups.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.DebugListGroups, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.DebugListGroups.Reply) =>
					emit(api.berty.types.v1.DebugListGroups.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC DebugListGroups ${
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
	debugInspectGroupStore = (requestObj: api.berty.types.v1.DebugInspectGroupStore.IRequest = {}) =>
		eventChannel<api.berty.types.v1.DebugInspectGroupStore.IReply>((emit) => {
			const buf = api.berty.types.v1.DebugInspectGroupStore.Request.encode(requestObj).finish()
			const request = bertytypes.DebugInspectGroupStore.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.DebugInspectGroupStore, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.DebugInspectGroupStore.Reply) =>
					emit(api.berty.types.v1.DebugInspectGroupStore.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC DebugInspectGroupStore ${
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
	debugGroup = (requestObj: api.berty.types.v1.DebugGroup.IRequest = {}) =>
		eventChannel<api.berty.types.v1.DebugGroup.IReply>((emit) => {
			const buf = api.berty.types.v1.DebugGroup.Request.encode(requestObj).finish()
			const request = bertytypes.DebugGroup.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.DebugGroup, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.DebugGroup.Reply) =>
					emit(api.berty.types.v1.DebugGroup.Reply.decode(message.serializeBinary())),
				onEnd: (code, msg, trailers) => {
					if (code !== grpc.Code.OK) {
						emit(
							new Error(
								`GRPC DebugGroup ${grpc.Code[code]} (${code}): ${msg}\nTrailers: ${JSON.stringify(
									trailers,
								)}`,
							) as any,
						)
					}
					emit(END)
				},
			})
			return close
		})
}
