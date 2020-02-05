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
	rdvLogtoken?: string

	constructor(metadata?: { [key: string]: string | string[] }) {
		super(metadata)
		if (__DEV__) {
			this.client = new DemoServiceClient(
				bridge({
					host: 'http://127.0.0.1:1337',
					transport: WebsocketTransport(),
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

	_logToken = async (): Promise<string> =>
		new Promise((resolve: (token: string) => void, reject: (err: Error) => void) =>
			this.client?.logToken({}, (error, response) =>
				error || response == null || response?.logToken == null
					? reject(error || new Error('GRPC ProtocolServiceHandler: response is undefined'))
					: resolve(response.logToken as string),
			),
		)

	_createPkHack = async (): Promise<string> =>
		(await Promise.all([this._logToken(), this._logToken()])).join(':')

	InstanceExportData: (
		request: api.berty.protocol.InstanceExportData.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceExportData.IReply,
		) => void,
	) => void = (request, callback) => {}

	InstanceGetConfiguration: (
		request: api.berty.protocol.InstanceGetConfiguration.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceGetConfiguration.IReply,
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
			response?: api.berty.protocol.ContactRequestReference.IReply,
		) => void,
	) => void = async (request, callback) => {
		this.rdvLogtoken = this.rdvLogtoken || (await this._logToken())
		callback(null, { reference: this.referenceBytes })
	}

	ContactRequestDisable: (
		request: api.berty.protocol.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDisable.IReply,
		) => void,
	) => void = (request, callback) => {
		this.rdvLogtoken = undefined
		callback(null, {})
		/*this.client?.logClose({ logToken: contactLogToken }, (error, response) => {
			if (error) {
				console.log('handler.ts: ContactRequestDisable: logClose error:', error)
				return
			}
		})*/
	}

	get accountMetadataLogToken() {
		const [value] = this.accountGroupPk?.split(':')
		return value
	}

	get devicePkBytes() {
		return Buffer.from(this.devicePk, 'utf-8')
	}

	get referenceBytes() {
		if (!this.rdvLogtoken) {
			throw new Error('handler.ts: referenceBytes: Undefined rdvLogtoken')
		}
		return Buffer.from(this.accountPk + '__' + this.rdvLogtoken, 'utf-8')
	}

	addEventToAccountMetadataLog = ({
		type,
		dataType,
		data,
	}: {
		type: string
		dataType: string
		data: { [key: string]: any }
	}) => {
		const { client } = this
		if (!client) {
			throw new Error('handler.ts: addEventToAccountMetadataLog: missing client')
		}
		return new Promise((resolve, reject) => {
			try {
				client.logAdd(
					{
						logToken: this.accountMetadataLogToken,
						data: api.berty.protocol.GroupMetadataEvent.encode({
							eventContext: {},
							metadata: {
								// TODO: fix api.berty.protocol.EventType type
								eventType: ((api.berty.protocol.EventType as unknown) as { [key: string]: number })[
									'EventType' + type
								],
							},
							event: (api.berty.protocol as { [key: string]: any })[dataType].encode(data).finish(),
						}).finish(),
					},
					(error, response) => {
						if (error) {
							reject(error)
						} else {
							resolve(response)
						}
					},
				)
			} catch (e) {
				console.error(e)
				reject(e)
			}
		})
	}

	ContactRequestEnable: (
		request: api.berty.protocol.ContactRequestEnable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestEnable.IReply,
		) => void,
	) => void = async (_, callback) => {
		if (!this.client) {
			throw new Error('handler.ts: ContactRequestEnable: missing client')
		}
		this.rdvLogtoken = this.rdvLogtoken || (await this._logToken())
		callback(null, { reference: this.referenceBytes })
		this.client.logStream({ logToken: this.rdvLogtoken }, (error, response) => {
			if (error || !response || !response.value) {
				console.error(
					'handler.ts: ContactRequestEnable: logStream error:',
					error,
					'With response',
					response,
				)
				return
			}
			const val = new Buffer(response.value).toString('utf-8')
			const parts = val.split(' ')
			const [type, requesterAccountPk, ...metadataParts] = parts
			if (type === 'CONTACT_REQUEST_FROM') {
				this.addEventToAccountMetadataLog({
					type: 'AccountContactRequestIncomingReceived',
					dataType: 'AccountContactRequestReceived',
					data: {
						devicePk: this.devicePkBytes,
						contactPk: Buffer.from(requesterAccountPk, 'utf-8'),
						contactMetadata: Buffer.from(metadataParts.join(' '), 'utf-8'),
					},
				})
			}
		})
	}

	ContactRequestResetReference: (
		request: api.berty.protocol.ContactRequestResetReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestResetReference.IReply,
		) => void,
	) => void = async (_, callback) => {
		this.rdvLogtoken = await this._logToken()
		callback(null, { reference: this.referenceBytes })
	}

	ContactRequestSend: (
		request: api.berty.protocol.ContactRequestSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestSend.IReply,
		) => void,
	) => void = async (request, callback) => {
		try {
			const { client } = this
			if (!client) {
				throw new Error('handler.ts: ContactRequestSend: missing client')
			}
			if (!request.reference) {
				throw new Error('handler.ts: ContactRequestSend: missing reference in request')
			}
			const refStr = new Buffer(request.reference).toString('utf-8')
			const [otherUserPk, otherUserRdvLogToken] = refStr.split('__')
			const ownMetadata =
				request.contactMetadata && new Buffer(request.contactMetadata).toString('utf-8')
			const ownId = this.accountPk
			const otherUserPkBytes = Buffer.from(otherUserPk, 'utf-8')
			await this.addEventToAccountMetadataLog({
				type: 'AccountContactRequestOutgoingEnqueued',
				dataType: 'AccountContactRequestEnqueued',
				data: {
					devicePk: this.devicePkBytes,
					contactPk: otherUserPkBytes,
				},
			})
			const dataStr = ['CONTACT_REQUEST_FROM', ownId, ownMetadata].join(' ')
			const logData = Buffer.from(dataStr, 'utf-8')
			await new Promise((resolve, reject) => {
				client.logAdd({ logToken: otherUserRdvLogToken, data: logData }, (error, response) => {
					return error || response == null
						? reject(error || new Error('GRPC ProtocolServiceHandler: response is undefined'))
						: resolve()
				})
			})
			await this.addEventToAccountMetadataLog({
				type: 'AccountContactRequestOutgoingSent',
				dataType: 'AccountContactRequestSent',
				data: {
					devicePk: this.devicePkBytes,
					contactPk: otherUserPkBytes,
				},
			})
			callback(null, {})
		} catch (e) {
			callback(e, {})
		}
	}
	ContactRequestAccept: (
		request: api.berty.protocol.ContactRequestAccept.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestAccept.IReply,
		) => void,
	) => void = async (request, callback) => {
		await this.addEventToAccountMetadataLog({
			type: 'AccountContactRequestIncomingAccepted',
			dataType: 'AccountContactRequestAccepted',
			data: {
				devicePk: this.devicePkBytes,
				contactPk: request.contactPk,
			},
		})
		callback(null, {})
	}
	ContactRequestDiscard: (
		request: api.berty.protocol.ContactRequestDiscard.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDiscard.IReply,
		) => void,
	) => void = async (request, callback) => {
		await this.addEventToAccountMetadataLog({
			type: 'AccountContactRequestIncomingDiscarded',
			dataType: 'AccountContactRequestDiscarded',
			data: {
				devicePk: this.devicePkBytes,
				contactPk: request.contactPk,
			},
		})
		callback(null, {})
	}
	ContactBlock: (
		request: api.berty.protocol.ContactBlock.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.ContactBlock.IReply) => void,
	) => void = (request, callback) => {}
	ContactUnblock: (
		request: api.berty.protocol.ContactUnblock.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.ContactUnblock.IReply) => void,
	) => void = (request, callback) => {}
	ContactAliasKeySend: (
		request: api.berty.protocol.ContactAliasKeySend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactAliasKeySend.IReply,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupCreate: (
		request: api.berty.protocol.MultiMemberGroupCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupCreate.IReply,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupJoin: (
		request: api.berty.protocol.MultiMemberGroupJoin.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupJoin.IReply,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupLeave: (
		request: api.berty.protocol.MultiMemberGroupLeave.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupLeave.IReply,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupAliasResolverDisclose: (
		request: api.berty.protocol.MultiMemberGroupAliasResolverDisclose.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupAliasResolverDisclose.IReply,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupAdminRoleGrant: (
		request: api.berty.protocol.MultiMemberGroupAdminRoleGrant.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupAdminRoleGrant.IReply,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupInvitationCreate: (
		request: api.berty.protocol.MultiMemberGroupInvitationCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupInvitationCreate.IReply,
		) => void,
	) => void = (request, callback) => {}
	AppMetadataSend: (
		request: api.berty.protocol.AppMetadataSend.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.AppMetadataSend.IReply) => void,
	) => void = (request, callback) => {}
	AppMessageSend: (
		request: api.berty.protocol.AppMessageSend.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.AppMessageSend.IReply) => void,
	) => void = (request, callback) => {}

	GroupMetadataSubscribe: (
		request: api.berty.protocol.GroupMetadataSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.IGroupMetadataEvent) => void,
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
		callback: (error: Error | null, response?: api.berty.protocol.IGroupMessageEvent) => void,
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
