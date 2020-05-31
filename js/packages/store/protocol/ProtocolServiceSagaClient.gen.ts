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

	instanceExportData = (requestObj: api.berty.types.InstanceExportData.IRequest = {}) =>
		eventChannel<api.berty.types.InstanceExportData.IReply>((emit) => {
			const buf = api.berty.types.InstanceExportData.Request.encode(requestObj).finish()
			const request = bertytypes.InstanceExportData.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.InstanceExportData, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.InstanceExportData.Reply) =>
					emit(api.berty.types.InstanceExportData.Reply.decode(message.serializeBinary())),
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
	instanceGetConfiguration = (requestObj: api.berty.types.InstanceGetConfiguration.IRequest = {}) =>
		eventChannel<api.berty.types.InstanceGetConfiguration.IReply>((emit) => {
			const buf = api.berty.types.InstanceGetConfiguration.Request.encode(requestObj).finish()
			const request = bertytypes.InstanceGetConfiguration.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.InstanceGetConfiguration, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.InstanceGetConfiguration.Reply) =>
					emit(api.berty.types.InstanceGetConfiguration.Reply.decode(message.serializeBinary())),
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
	contactRequestReference = (requestObj: api.berty.types.ContactRequestReference.IRequest = {}) =>
		eventChannel<api.berty.types.ContactRequestReference.IReply>((emit) => {
			const buf = api.berty.types.ContactRequestReference.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestReference.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestReference, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestReference.Reply) =>
					emit(api.berty.types.ContactRequestReference.Reply.decode(message.serializeBinary())),
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
	contactRequestDisable = (requestObj: api.berty.types.ContactRequestDisable.IRequest = {}) =>
		eventChannel<api.berty.types.ContactRequestDisable.IReply>((emit) => {
			const buf = api.berty.types.ContactRequestDisable.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestDisable.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestDisable, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestDisable.Reply) =>
					emit(api.berty.types.ContactRequestDisable.Reply.decode(message.serializeBinary())),
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
	contactRequestEnable = (requestObj: api.berty.types.ContactRequestEnable.IRequest = {}) =>
		eventChannel<api.berty.types.ContactRequestEnable.IReply>((emit) => {
			const buf = api.berty.types.ContactRequestEnable.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestEnable.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestEnable, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestEnable.Reply) =>
					emit(api.berty.types.ContactRequestEnable.Reply.decode(message.serializeBinary())),
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
		requestObj: api.berty.types.ContactRequestResetReference.IRequest = {},
	) =>
		eventChannel<api.berty.types.ContactRequestResetReference.IReply>((emit) => {
			const buf = api.berty.types.ContactRequestResetReference.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestResetReference.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestResetReference, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestResetReference.Reply) =>
					emit(
						api.berty.types.ContactRequestResetReference.Reply.decode(message.serializeBinary()),
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
	contactRequestSend = (requestObj: api.berty.types.ContactRequestSend.IRequest = {}) =>
		eventChannel<api.berty.types.ContactRequestSend.IReply>((emit) => {
			const buf = api.berty.types.ContactRequestSend.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestSend.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestSend, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestSend.Reply) =>
					emit(api.berty.types.ContactRequestSend.Reply.decode(message.serializeBinary())),
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
	contactRequestAccept = (requestObj: api.berty.types.ContactRequestAccept.IRequest = {}) =>
		eventChannel<api.berty.types.ContactRequestAccept.IReply>((emit) => {
			const buf = api.berty.types.ContactRequestAccept.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestAccept.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestAccept, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestAccept.Reply) =>
					emit(api.berty.types.ContactRequestAccept.Reply.decode(message.serializeBinary())),
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
	contactRequestDiscard = (requestObj: api.berty.types.ContactRequestDiscard.IRequest = {}) =>
		eventChannel<api.berty.types.ContactRequestDiscard.IReply>((emit) => {
			const buf = api.berty.types.ContactRequestDiscard.Request.encode(requestObj).finish()
			const request = bertytypes.ContactRequestDiscard.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactRequestDiscard, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactRequestDiscard.Reply) =>
					emit(api.berty.types.ContactRequestDiscard.Reply.decode(message.serializeBinary())),
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
	contactBlock = (requestObj: api.berty.types.ContactBlock.IRequest = {}) =>
		eventChannel<api.berty.types.ContactBlock.IReply>((emit) => {
			const buf = api.berty.types.ContactBlock.Request.encode(requestObj).finish()
			const request = bertytypes.ContactBlock.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactBlock, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactBlock.Reply) =>
					emit(api.berty.types.ContactBlock.Reply.decode(message.serializeBinary())),
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
	contactUnblock = (requestObj: api.berty.types.ContactUnblock.IRequest = {}) =>
		eventChannel<api.berty.types.ContactUnblock.IReply>((emit) => {
			const buf = api.berty.types.ContactUnblock.Request.encode(requestObj).finish()
			const request = bertytypes.ContactUnblock.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactUnblock, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactUnblock.Reply) =>
					emit(api.berty.types.ContactUnblock.Reply.decode(message.serializeBinary())),
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
	contactAliasKeySend = (requestObj: api.berty.types.ContactAliasKeySend.IRequest = {}) =>
		eventChannel<api.berty.types.ContactAliasKeySend.IReply>((emit) => {
			const buf = api.berty.types.ContactAliasKeySend.Request.encode(requestObj).finish()
			const request = bertytypes.ContactAliasKeySend.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ContactAliasKeySend, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ContactAliasKeySend.Reply) =>
					emit(api.berty.types.ContactAliasKeySend.Reply.decode(message.serializeBinary())),
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
	multiMemberGroupCreate = (requestObj: api.berty.types.MultiMemberGroupCreate.IRequest = {}) =>
		eventChannel<api.berty.types.MultiMemberGroupCreate.IReply>((emit) => {
			const buf = api.berty.types.MultiMemberGroupCreate.Request.encode(requestObj).finish()
			const request = bertytypes.MultiMemberGroupCreate.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupCreate, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupCreate.Reply) =>
					emit(api.berty.types.MultiMemberGroupCreate.Reply.decode(message.serializeBinary())),
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
	multiMemberGroupJoin = (requestObj: api.berty.types.MultiMemberGroupJoin.IRequest = {}) =>
		eventChannel<api.berty.types.MultiMemberGroupJoin.IReply>((emit) => {
			const buf = api.berty.types.MultiMemberGroupJoin.Request.encode(requestObj).finish()
			const request = bertytypes.MultiMemberGroupJoin.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupJoin, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupJoin.Reply) =>
					emit(api.berty.types.MultiMemberGroupJoin.Reply.decode(message.serializeBinary())),
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
	multiMemberGroupLeave = (requestObj: api.berty.types.MultiMemberGroupLeave.IRequest = {}) =>
		eventChannel<api.berty.types.MultiMemberGroupLeave.IReply>((emit) => {
			const buf = api.berty.types.MultiMemberGroupLeave.Request.encode(requestObj).finish()
			const request = bertytypes.MultiMemberGroupLeave.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupLeave, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupLeave.Reply) =>
					emit(api.berty.types.MultiMemberGroupLeave.Reply.decode(message.serializeBinary())),
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
		requestObj: api.berty.types.MultiMemberGroupAliasResolverDisclose.IRequest = {},
	) =>
		eventChannel<api.berty.types.MultiMemberGroupAliasResolverDisclose.IReply>((emit) => {
			const buf = api.berty.types.MultiMemberGroupAliasResolverDisclose.Request.encode(
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
						api.berty.types.MultiMemberGroupAliasResolverDisclose.Reply.decode(
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
		requestObj: api.berty.types.MultiMemberGroupAdminRoleGrant.IRequest = {},
	) =>
		eventChannel<api.berty.types.MultiMemberGroupAdminRoleGrant.IReply>((emit) => {
			const buf = api.berty.types.MultiMemberGroupAdminRoleGrant.Request.encode(requestObj).finish()
			const request = bertytypes.MultiMemberGroupAdminRoleGrant.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupAdminRoleGrant, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupAdminRoleGrant.Reply) =>
					emit(
						api.berty.types.MultiMemberGroupAdminRoleGrant.Reply.decode(message.serializeBinary()),
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
		requestObj: api.berty.types.MultiMemberGroupInvitationCreate.IRequest = {},
	) =>
		eventChannel<api.berty.types.MultiMemberGroupInvitationCreate.IReply>((emit) => {
			const buf = api.berty.types.MultiMemberGroupInvitationCreate.Request.encode(
				requestObj,
			).finish()
			const request = bertytypes.MultiMemberGroupInvitationCreate.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.MultiMemberGroupInvitationCreate, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.MultiMemberGroupInvitationCreate.Reply) =>
					emit(
						api.berty.types.MultiMemberGroupInvitationCreate.Reply.decode(
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
	appMetadataSend = (requestObj: api.berty.types.AppMetadataSend.IRequest = {}) =>
		eventChannel<api.berty.types.AppMetadataSend.IReply>((emit) => {
			const buf = api.berty.types.AppMetadataSend.Request.encode(requestObj).finish()
			const request = bertytypes.AppMetadataSend.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.AppMetadataSend, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.AppMetadataSend.Reply) =>
					emit(api.berty.types.AppMetadataSend.Reply.decode(message.serializeBinary())),
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
	appMessageSend = (requestObj: api.berty.types.AppMessageSend.IRequest = {}) =>
		eventChannel<api.berty.types.AppMessageSend.IReply>((emit) => {
			const buf = api.berty.types.AppMessageSend.Request.encode(requestObj).finish()
			const request = bertytypes.AppMessageSend.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.AppMessageSend, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.AppMessageSend.Reply) =>
					emit(api.berty.types.AppMessageSend.Reply.decode(message.serializeBinary())),
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
	groupMetadataSubscribe = (requestObj: api.berty.types.GroupMetadataSubscribe.IRequest = {}) =>
		eventChannel<api.berty.types.IGroupMetadataEvent>((emit) => {
			const buf = api.berty.types.GroupMetadataSubscribe.Request.encode(requestObj).finish()
			const request = bertytypes.GroupMetadataSubscribe.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupMetadataSubscribe, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupMetadataEvent) =>
					emit(api.berty.types.GroupMetadataEvent.decode(message.serializeBinary())),
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
	groupMessageSubscribe = (requestObj: api.berty.types.GroupMessageSubscribe.IRequest = {}) =>
		eventChannel<api.berty.types.IGroupMessageEvent>((emit) => {
			const buf = api.berty.types.GroupMessageSubscribe.Request.encode(requestObj).finish()
			const request = bertytypes.GroupMessageSubscribe.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupMessageSubscribe, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupMessageEvent) =>
					emit(api.berty.types.GroupMessageEvent.decode(message.serializeBinary())),
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
	groupMetadataList = (requestObj: api.berty.types.GroupMetadataList.IRequest = {}) =>
		eventChannel<api.berty.types.IGroupMetadataEvent>((emit) => {
			const buf = api.berty.types.GroupMetadataList.Request.encode(requestObj).finish()
			const request = bertytypes.GroupMetadataList.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupMetadataList, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupMetadataEvent) =>
					emit(api.berty.types.GroupMetadataEvent.decode(message.serializeBinary())),
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
	groupMessageList = (requestObj: api.berty.types.GroupMessageList.IRequest = {}) =>
		eventChannel<api.berty.types.IGroupMessageEvent>((emit) => {
			const buf = api.berty.types.GroupMessageList.Request.encode(requestObj).finish()
			const request = bertytypes.GroupMessageList.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupMessageList, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupMessageEvent) =>
					emit(api.berty.types.GroupMessageEvent.decode(message.serializeBinary())),
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
	groupInfo = (requestObj: api.berty.types.GroupInfo.IRequest = {}) =>
		eventChannel<api.berty.types.GroupInfo.IReply>((emit) => {
			const buf = api.berty.types.GroupInfo.Request.encode(requestObj).finish()
			const request = bertytypes.GroupInfo.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.GroupInfo, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.GroupInfo.Reply) =>
					emit(api.berty.types.GroupInfo.Reply.decode(message.serializeBinary())),
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
	activateGroup = (requestObj: api.berty.types.ActivateGroup.IRequest = {}) =>
		eventChannel<api.berty.types.ActivateGroup.IReply>((emit) => {
			const buf = api.berty.types.ActivateGroup.Request.encode(requestObj).finish()
			const request = bertytypes.ActivateGroup.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.ActivateGroup, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.ActivateGroup.Reply) =>
					emit(api.berty.types.ActivateGroup.Reply.decode(message.serializeBinary())),
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
	deactivateGroup = (requestObj: api.berty.types.DeactivateGroup.IRequest = {}) =>
		eventChannel<api.berty.types.DeactivateGroup.IReply>((emit) => {
			const buf = api.berty.types.DeactivateGroup.Request.encode(requestObj).finish()
			const request = bertytypes.DeactivateGroup.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.DeactivateGroup, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.DeactivateGroup.Reply) =>
					emit(api.berty.types.DeactivateGroup.Reply.decode(message.serializeBinary())),
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
	debugListGroups = (requestObj: api.berty.types.DebugListGroups.IRequest = {}) =>
		eventChannel<api.berty.types.DebugListGroups.IReply>((emit) => {
			const buf = api.berty.types.DebugListGroups.Request.encode(requestObj).finish()
			const request = bertytypes.DebugListGroups.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.DebugListGroups, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.DebugListGroups.Reply) =>
					emit(api.berty.types.DebugListGroups.Reply.decode(message.serializeBinary())),
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
	debugInspectGroupStore = (requestObj: api.berty.types.DebugInspectGroupStore.IRequest = {}) =>
		eventChannel<api.berty.types.DebugInspectGroupStore.IReply>((emit) => {
			const buf = api.berty.types.DebugInspectGroupStore.Request.encode(requestObj).finish()
			const request = bertytypes.DebugInspectGroupStore.Request.deserializeBinary(buf)
			const { close } = grpc.invoke(ProtocolService.DebugInspectGroupStore, {
				request,
				transport: this.transport,
				host: this.host,
				onMessage: (message: bertytypes.DebugInspectGroupStore.Reply) =>
					emit(api.berty.types.DebugInspectGroupStore.Reply.decode(message.serializeBinary())),
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
}
