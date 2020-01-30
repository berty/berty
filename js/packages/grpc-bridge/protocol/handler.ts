import * as api from '@berty-tech/api'
import { MockServiceHandler } from '../mock'
import { DemoServiceClient } from '../orbitdb'
import { bridge } from '../bridge'
import { ReactNativeTransport } from '../grpc-web-react-native-transport'
import { WebsocketTransport } from '../grpc-web-websocket-transport'
import { Buffer } from 'buffer'
import { GoBridge } from '../orbitdb/native'
import { IProtocolServiceHandler } from './handler.gen'
if (!__DEV__) {
	GoBridge.startDemo()
}

export class ProtocolServiceHandler extends MockServiceHandler implements IProtocolServiceHandler {
	client?: DemoServiceClient
	accountPk: string
	devicePk: string
	accountGroupPk: string

	constructor(metadata?: { [key: string]: string | string[] }) {
		super(metadata)
		if (__DEV__) {
			this.client = new DemoServiceClient(
				bridge({
					host: 'http://127.0.0.1:1337',
					transport: ReactNativeTransport({}),
				}),
			)
		} else {
			GoBridge.getDemoAddr()
				.then((addr: string) => {
					this.client = new DemoServiceClient(
						bridge({
							host: addr,
							transport: WebsocketTransport(),
						}),
					)
				})
				.catch((err: Error) => {
					console.error(err)
					// log bad error
				})
		}
		this.accountPk = (this.metadata?.accountPk as string) || ''
		this.devicePk = (this.metadata?.devicePk as string) || ''
		this.accountGroupPk = (this.metadata?.accountDevicePk as string) || ''
	}

	_createPkHack = async (): Promise<string> =>
		(
			await Promise.all([
				new Promise((resolve: (token: string) => void, reject: (err: Error) => void) =>
					this.client?.logToken({}, (error, response) =>
						error || response == null || response?.logToken == null
							? reject(error || new Error('GRPC ProtocolServiceHandler: response is undefined'))
							: resolve(response.logToken as string),
					),
				),
				new Promise((resolve: (token: string) => void, reject: (err: Error) => void) =>
					this.client?.logToken({}, (error, response) =>
						error || response == null || response?.logToken == null
							? reject(error || new Error('GRPC ProtocolServiceHandler: response is undefined'))
							: resolve(response.logToken as string),
					),
				),
			])
		).join(':')

	InstanceExportData: (
		request: api.berty.protocol.InstanceExportData.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceExportData.IReply | null,
		) => void,
	) => void = (request, callback) => {}

	InstanceGetConfiguration: (
		request: api.berty.protocol.InstanceGetConfiguration.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceGetConfiguration.IReply | null,
		) => void,
	) => void = async (request, callback) => {
		this.accountPk = this.accountPk ? this.accountPk : await this._createPkHack()
		this.devicePk = this.devicePk ? this.devicePk : await this._createPkHack()
		this.accountGroupPk = this.accountGroupPk ? this.accountGroupPk : await this._createPkHack()
		callback(null, {
			accountPk: new Buffer(this.accountPk),
			devicePk: new Buffer(this.devicePk),
			accountGroupPk: new Buffer(this.accountGroupPk),
		})
	}

	ContactRequestReference: (
		request: api.berty.protocol.ContactRequestReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestReference.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactRequestDisable: (
		request: api.berty.protocol.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDisable.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactRequestEnable: (
		request: api.berty.protocol.ContactRequestEnable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestEnable.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactRequestResetReference: (
		request: api.berty.protocol.ContactRequestResetReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestResetReference.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactRequestSend: (
		request: api.berty.protocol.ContactRequestSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestSend.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactRequestAccept: (
		request: api.berty.protocol.ContactRequestAccept.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestAccept.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactRequestDiscard: (
		request: api.berty.protocol.ContactRequestDiscard.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDiscard.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactBlock: (
		request: api.berty.protocol.ContactBlock.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactBlock.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactUnblock: (
		request: api.berty.protocol.ContactUnblock.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactUnblock.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactAliasKeySend: (
		request: api.berty.protocol.ContactAliasKeySend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactAliasKeySend.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupCreate: (
		request: api.berty.protocol.MultiMemberGroupCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupCreate.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupJoin: (
		request: api.berty.protocol.MultiMemberGroupJoin.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupJoin.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupLeave: (
		request: api.berty.protocol.MultiMemberGroupLeave.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupLeave.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupAliasResolverDisclose: (
		request: api.berty.protocol.MultiMemberGroupAliasResolverDisclose.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupAliasResolverDisclose.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupAdminRoleGrant: (
		request: api.berty.protocol.MultiMemberGroupAdminRoleGrant.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupAdminRoleGrant.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupInvitationCreate: (
		request: api.berty.protocol.MultiMemberGroupInvitationCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupInvitationCreate.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	AppMetadataSend: (
		request: api.berty.protocol.AppMetadataSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.AppMetadataSend.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	AppMessageSend: (
		request: api.berty.protocol.AppMessageSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.AppMessageSend.IReply | null,
		) => void,
	) => void = (request, callback) => {}

	GroupMetadataSubscribe: (
		request: api.berty.protocol.GroupMetadataSubscribe.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.IGroupMetadataEvent | null,
		) => void,
	) => void = (request, callback) => {
		if (request.groupPk == null) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk not defined'))
			return
		}
		const tokens = new Buffer(request.groupPk).toString('utf8').split(':')
		if (tokens.length < 2) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk corrupted'))
			return
		}
		this.client?.logStream({ logToken: tokens[0] }, (error, response) => {
			if (error || response == null || response.cid == null || response.value == null) {
				callback(error)
				return
			}
			const message = api.berty.protocol.GroupMetadataEvent.decode(response.value)
			if (message == null || message.eventContext == null) {
				callback(new Error('GRPC ProtocolServiceHandler: log event corrupted'))
				return
			}
			message.eventContext.id = Buffer.from(response.cid, 'utf8')
			callback(null, message)
		})
	}

	GroupMessageSubscribe: (
		request: api.berty.protocol.GroupMessageSubscribe.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.IGroupMessageEvent | null,
		) => void,
	) => void = (request, callback) => {
		if (request.groupPk == null) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk not defined'))
			return
		}
		const tokens = new Buffer(request.groupPk).toString('utf8').split(':')
		if (tokens.length < 2) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk corrupted'))
			return
		}
		this.client?.logStream({ logToken: tokens[1] }, (error, response) => {
			if (error || response == null || response.cid == null || response.value == null) {
				callback(error)
				return
			}
			const message = api.berty.protocol.GroupMessageEvent.decode(response.value)
			if (message == null || message.eventContext == null) {
				callback(new Error('GRPC ProtocolServiceHandler: log event corrupted'))
				return
			}
			message.eventContext.id = Buffer.from(response.cid, 'utf8')
			callback(null, message)
		})
	}
}
