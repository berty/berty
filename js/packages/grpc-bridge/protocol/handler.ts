import * as api from '@berty-tech/api'
import { MockServiceHandler } from '../mock'
import { DemoServiceClient } from '../orbitdb'
import { bridge } from '../bridge'
import { ReactNativeTransport } from '../grpc-web-react-native-transport'
import { WebsocketTransport } from '../grpc-web-websocket-transport'
import { Buffer } from 'buffer'
import { GoBridge } from '../orbitdb/native'

if (!__DEV__) {
	GoBridge.startDemo()
}

export class ProtocolServiceHandler extends MockServiceHandler {
	client?: DemoServiceClient
	accountGroupPk: string
	accountDevicePk: string

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
		this.accountGroupPk = (this.metadata?.accountGroupPk as string) || ''
		this.accountDevicePk = (this.metadata?.accountDevicePk as string) || ''
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
	) => void = (request, callback) => {
		callback(null, {
			accountGroupPk: Buffer.from(this.accountGroupPk, 'base64'),
			accountDevicePk: Buffer.from(this.accountDevicePk, 'base64'),
		})
	}

	InstanceLinkToExistingAccount: (
		request: api.berty.protocol.InstanceLinkToExistingAccount.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceLinkToExistingAccount.IReply | null,
		) => void,
	) => void = (request, callback) => {}

	InstanceInitiateNewAccount: (
		request: api.berty.protocol.InstanceInitiateNewAccount.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceInitiateNewAccount.IReply | null,
		) => void,
	) => void = async (_, callback) => {
		try {
			this.accountGroupPk = await this._createPkHack()
			this.accountDevicePk = await this._createPkHack()
			console.log(this.accountGroupPk)
			callback(null, {})
		} catch (err) {
			callback(err, null)
		}
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
	ContactRequestIgnore: (
		request: api.berty.protocol.ContactRequestIgnore.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestIgnore.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	ContactRequestRefuse: (
		request: api.berty.protocol.ContactRequestRefuse.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestRefuse.IReply | null,
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
	MultiMemberCreate: (
		request: api.berty.protocol.MultiMemberCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberCreate.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberJoin: (
		request: api.berty.protocol.MultiMemberJoin.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberJoin.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberLeave: (
		request: api.berty.protocol.MultiMemberLeave.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberLeave.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberAliasProofDisclose: (
		request: api.berty.protocol.MultiMemberAliasProofDisclose.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberAliasProofDisclose.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberAdminRoleGrant: (
		request: api.berty.protocol.MultiMemberAdminRoleGrant.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberAdminRoleGrant.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberCreateInvitation: (
		request: api.berty.protocol.MultiMemberCreateInvitation.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberCreateInvitation.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	AppSendPermanentMessage: (
		request: api.berty.protocol.AppSendPermanentMessage.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.AppSendPermanentMessage.IReply | null,
		) => void,
	) => void = (request, callback) => {}
	AppSecureMessage: (
		request: api.berty.protocol.AppSecureMessage.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.AppSecureMessage.IReply | null,
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
		const tokens = new Buffer(request.groupPk).toString('base64').split(':')
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
			message.eventContext.id = Buffer.from(response.cid, 'base64')
			callback(null, message)
		})
	}

	GroupSecureMessageSubscribe: (
		request: api.berty.protocol.GroupSecureMessageSubscribe.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.IGroupSecureMessageEvent | null,
		) => void,
	) => void = (request, callback) => {
		if (request.groupPk == null) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk not defined'))
			return
		}
		const tokens = new Buffer(request.groupPk).toString('base64').split(':')
		if (tokens.length < 2) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk corrupted'))
			return
		}
		this.client?.logStream({ logToken: tokens[1] }, (error, response) => {
			if (error || response == null || response.cid == null || response.value == null) {
				callback(error)
				return
			}
			const message = api.berty.protocol.GroupSecureMessageEvent.decode(response.value)
			if (message == null || message.eventContext == null) {
				callback(new Error('GRPC ProtocolServiceHandler: log event corrupted'))
				return
			}
			message.eventContext.id = Buffer.from(response.cid, 'base64')
			callback(null, message)
		})
	}
}
