import * as api from '@berty-tech/api'
import { MockServiceHandler } from '../mock'
import { DemoServiceClient } from '../orbitdb'
import { bridge } from '../bridge'
import { ReactNativeTransport } from '../grpc-web-react-native-transport'
import { WebsocketTransport } from '../grpc-web-websocket-transport'
import { Buffer } from 'buffer'
import { GoBridge } from '../orbitdb/native'
import { IProtocolServiceHandler } from './handler.gen'
import { AsymmetricKeystore, ec } from './keystore'
import { SHA3 } from 'sha3'

const useExternalBridge = __DEV__ // set to false to test integrated bridge in dev

if (!useExternalBridge) {
	GoBridge.startDemo()
}

export class ProtocolServiceHandler extends MockServiceHandler implements IProtocolServiceHandler {
	client?: DemoServiceClient
	accountPk: string
	devicePk: string
	accountGroupPk: string
	rdvLogtoken: string
	keystore: AsymmetricKeystore

	constructor() {
		super()
		if (useExternalBridge) {
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
		this.keystore = new AsymmetricKeystore()
		;['account', 'device', 'accountGroup', 'rdv'].forEach(this.keystore.createKeyPair)
		this.accountPk = this.getBase64PublicKey('account')
		this.devicePk = this.getBase64PublicKey('device')
		this.accountGroupPk = this.getBase64PublicKey('accountGroup')
		this.rdvLogtoken = this.getMetadataLogToken('rdv')
		console.log('rdvLogToken', this.rdvLogtoken)
	}

	getBase64PublicKey = (keyName: string) => {
		return this.keystore
			.get(keyName)
			.getPublic()
			.toString('base64')
	}

	getHexSecretKey = (keyName: string) => {
		return this.keystore
			.get(keyName)
			.getSecret()
			.toString('hex')
	}

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
		callback(null, {
			accountPk: new Buffer(this.accountPk, 'base64'),
			devicePk: new Buffer(this.devicePk, 'base64'),
			accountGroupPk: new Buffer(this.accountGroupPk, 'base64'),
		})
	}

	ContactRequestReference: (
		request: api.berty.protocol.ContactRequestReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestReference.IReply,
		) => void,
	) => void = async (request, callback) => {
		callback(null, { reference: this.referenceBytes })
	}

	ContactRequestDisable: (
		request: api.berty.protocol.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDisable.IReply,
		) => void,
	) => void = (request, callback) => {
		// TODO: close contact request log
		callback(null, {})
	}

	get devicePkBytes() {
		return this.keystore.get('device').getPublic()
	}

	get referenceBytes() {
		return Buffer.from(this.accountPk + '__' + this.rdvLogtoken, 'utf-8')
	}

	getMetadataLogToken = (keyName: string) => {
		return this.metadataLogTokenFromPk(this.keystore.get(keyName).getPublic())
	}

	metadataLogTokenFromPk = (pubKey: Buffer) => {
		// create a log token by running a round of sha3 on the pubKey
		const hash = new SHA3(256)
		hash.update(pubKey)
		// go expects the concatenation of sk and pk as sk
		const sk = hash.digest()
		const pk = new Buffer(ec.keyFromSecret(sk).getPublic())
		return Buffer.concat([sk, pk]).toString('hex')
	}

	messageLogTokenFromPk = (pubKey: Buffer) => {
		// create a log token by running two rounds of sha3 on the pubKey
		const hash1 = new SHA3(256)
		hash1.update(pubKey)
		const hash2 = new SHA3(256)
		hash2.update(hash1.digest())
		// go expects the concatenation of sk and pk as sk
		const sk = hash2.digest()
		const pk = new Buffer(ec.keyFromSecret(sk).getPublic())
		return Buffer.concat([sk, pk]).toString('hex')
	}

	addEventToMetadataLog = ({
		groupPk,
		type,
		dataType,
		data,
	}:
		| {
				groupPk: Buffer
				type: string
				dataType: string
				data: { [key: string]: any }
		  }
		| {
				groupPk: Buffer
				type: string
				data: Uint8Array
				dataType?: string
		  }) => {
		const { client } = this
		if (!client) {
			throw new Error('handler.ts: addEventToMetadataLog: missing client')
		}
		console.log(`adding ${type} to log with pubkey ${groupPk.toString('base64')}`)
		return new Promise((resolve, reject) => {
			try {
				client.logAdd(
					{
						logToken: this.metadataLogTokenFromPk(groupPk),
						data: api.berty.protocol.GroupMetadataEvent.encode({
							eventContext: {},
							metadata: {
								// TODO: fix api.berty.protocol.EventType type
								eventType: ((api.berty.protocol.EventType as unknown) as { [key: string]: number })[
									'EventType' + type
								],
							},
							event:
								type === 'GroupMetadataPayloadSent'
									? data
									: (api.berty.protocol as { [key: string]: any })[dataType].encode(data).finish(),
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
				//console.error(e)
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
			const [type, requesterAccountPk, metadata] = parts
			if (type === 'CONTACT_REQUEST_FROM') {
				this.addEventToMetadataLog({
					groupPk: this.keystore.get('accountGroup').getPublic(),
					type: 'AccountContactRequestIncomingReceived',
					dataType: 'AccountContactRequestReceived',
					data: {
						devicePk: this.devicePkBytes,
						contactPk: Buffer.from(requesterAccountPk, 'base64'),
						contactMetadata: Buffer.from(metadata, 'base64'),
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
		this.keystore.createKeyPair('rdv')
		this.rdvLogtoken = this.getMetadataLogToken('rdv')
		callback(null, { reference: this.referenceBytes })
	}

	ContactRequestSend: (
		request: api.berty.protocol.ContactRequestSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestSend.IReply,
		) => void,
	) => void = async (request, callback) => {
		console.log('ContactRequestSend called')
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
			console.log('otherUserPk', otherUserPk)
			console.log('otherUserRdvLogToken', otherUserRdvLogToken)
			const ownMetadata =
				request.contactMetadata && new Buffer(request.contactMetadata).toString('base64')
			const ownId = this.accountPk
			const otherUserPkBytes = Buffer.from(otherUserPk, 'base64')
			await this.addEventToMetadataLog({
				groupPk: this.keystore.get('accountGroup').getPublic(),
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
			await this.addEventToMetadataLog({
				groupPk: this.keystore.get('accountGroup').getPublic(),
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
		await this.addEventToMetadataLog({
			groupPk: this.keystore.get('accountGroup').getPublic(),
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
		await this.addEventToMetadataLog({
			groupPk: this.keystore.get('accountGroup').getPublic(),
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
	) => void = async (request, callback) => {
		const { groupPk, payload } = request
		if (!groupPk) {
			callback(new Error('Invalid groupPk'))
			return
		}
		try {
			await this.addEventToMetadataLog({
				groupPk: new Buffer(groupPk),
				type: 'GroupMetadataPayloadSent',
				data: payload as Uint8Array,
			})
			callback(null, {})
		} catch (error) {
			callback(error)
		}
	}
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
		this.client?.logStream(
			{ logToken: this.metadataLogTokenFromPk(new Buffer(request.groupPk)) },
			(error, response) => {
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
			},
		)
	}

	GroupMessageSubscribe: (
		request: api.berty.protocol.GroupMessageSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.IGroupMessageEvent) => void,
	) => void = (request, callback) => {
		if (request.groupPk == null) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk not defined'))
			return
		}
		this.client?.logStream(
			{ logToken: this.messageLogTokenFromPk(new Buffer(request.groupPk)) },
			(error, response) => {
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
			},
		)
	}
}
